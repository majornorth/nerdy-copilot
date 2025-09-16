import React, { useEffect, useRef } from 'react';
import { addToBoard } from '../../../services/whiteboardBridge';

interface PracticeProblemsRendererProps {
  containerRef: React.RefObject<HTMLDivElement> | null;
  isEditing: boolean;
}

export const PracticeProblemsRenderer: React.FC<PracticeProblemsRendererProps> = ({ 
  containerRef,
  isEditing 
}) => {
  const processedSectionsRef = useRef<WeakSet<Element>>(new WeakSet());

  useEffect(() => {
    if (!containerRef?.current || isEditing) return;

    const processPracticeProblems = () => {
      try {
      const container = containerRef?.current;
      if (!container) return;

      // Find all practice problem headings
      const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const practiceHeading = headings.find(h => 
        /practice\s*problems/i.test(h.textContent || '')
      );

      if (!practiceHeading) {
        return;
      }

      // Find the practice problems content after the heading
      let currentElement = practiceHeading.nextElementSibling;
      const problems: { element: Element; text: string }[] = [];

      // Look for data-problem-list container first
      let problemListContainer = practiceHeading.nextElementSibling;
      while (problemListContainer && problemListContainer.getAttribute('data-problem-list') !== 'true' && !(/^H[1-6]$/.test(problemListContainer.tagName))) {
        problemListContainer = problemListContainer.nextElementSibling;
      }

      if (problemListContainer && problemListContainer.getAttribute('data-problem-list') === 'true') {
        // Handle structured problems
        const problemItems = problemListContainer.querySelectorAll(':scope > [data-problem-item="true"]');
        problemItems.forEach((item, index) => {
          // Only get the first paragraph which should be the problem text
          const firstP = item.querySelector('p');
          const text = firstP ? firstP.textContent?.trim() || '' : item.textContent?.trim() || '';
          if (text) {
            problems.push({ element: item, text });
          }
        });

        // If there are more blocks than the requested target, trim the extras
        const targetAttr = (problemListContainer as HTMLElement).getAttribute('data-problem-target-count');
        const target = targetAttr ? parseInt(targetAttr, 10) : undefined;
        if (target && problems.length > target) {
          // Remove extra nodes from the DOM so counting and UI match exactly
          const extra = Array.from(problemListContainer.querySelectorAll(':scope > [data-problem-item="true"]')).slice(target);
          extra.forEach(node => node.parentElement?.removeChild(node));
          problems.splice(target);
        }
      } else {
        // Fallback: collect all problem elements (paragraphs, list items, or divs)
        let currentElement = practiceHeading.nextElementSibling;
        while (currentElement && !(/^H[1-6]$/.test(currentElement.tagName))) {
          if (currentElement.tagName === 'OL' || currentElement.tagName === 'UL') {
            // Handle list items
            const items = currentElement.querySelectorAll('li');
            items.forEach(item => {
              const text = item.textContent?.replace(/^\d+\.?\s*/, '').trim() || '';
              if (text) {
                problems.push({ element: item, text });
              }
            });
            break;
          } else if (currentElement.tagName === 'P') {
            // Handle paragraphs that look like problems
            const text = currentElement.textContent?.trim() || '';
            if (text && !text.toLowerCase().includes('solution:') && !text.toLowerCase().includes('answer:')) {
              problems.push({ element: currentElement, text });
            }
          }
          currentElement = currentElement.nextElementSibling;
        }
      }

      if (problems.length === 0) return;

      // If the list looks truncated (e.g., less than 8) but the container contains more items,
      // wait briefly and re-query once to allow TipTap to finish rendering.
      const expected = (() => {
        const m = /\b(\d+)\s+(practice\s+problems|questions)\b/i.exec(document.body.innerText || '');
        return m ? parseInt(m[1], 10) : undefined;
      })();
      if (expected && problems.length < expected) {
        setTimeout(() => {
          const retryItems = problemListContainer?.querySelectorAll(':scope > [data-problem-item="true"]') || [];
          if (retryItems.length > problems.length) {
            // Force a rerender by clearing processed cache for this heading
            processedSectionsRef.current = new WeakSet();
            processPracticeProblems();
          }
        }, 500);
      }

      // Check if we've already processed this section
      if (processedSectionsRef.current.has(practiceHeading)) return;
      processedSectionsRef.current.add(practiceHeading);

      // Create the custom UI container
      const customContainer = document.createElement('div');
      customContainer.className = 'practice-problems-custom-ui mt-4';
      
      // Add the "Add to white board" button
      const addAllButton = document.createElement('button');
      addAllButton.className = 'w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200';
      addAllButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" class="text-[#6B46C1]">
          <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
        </svg>
        <span>Add to white board</span>
      `;
      
      addAllButton.onclick = async () => {
        const allProblemsHtml = problems
          .map((p, index) => `<p><strong>Problem ${index + 1}:</strong> ${p.text}</p>`)
          .join('\n');
        
        await addToBoard({
          type: 'html',
          html: allProblemsHtml,
          meta: { source: 'practice-problems-all' }
        });
      };
      
      customContainer.appendChild(addAllButton);

      // Create individual problem containers
      const problemsContainer = document.createElement('div');
      problemsContainer.className = '';

      problems.forEach((problem, index) => {
        const problemDiv = document.createElement('div');
        problemDiv.className = 'border border-gray-200 rounded-lg p-6 mb-4';
        
        // Problem header with count and plus button
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex items-start justify-between gap-4';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-1';
        contentDiv.innerHTML = `
          <p class="text-sm text-gray-500 mb-3">${index + 1} of ${problems.length}</p>
          <p class="text-gray-900 text-base leading-relaxed">${problem.text}</p>
        `;
        
        const addButton = document.createElement('button');
        addButton.className = 'flex-shrink-0 p-2 -mt-1 text-[#6B46C1] hover:bg-purple-50 rounded-lg transition-colors';
        addButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
          </svg>
        `;
        
        addButton.onclick = async () => {
          await addToBoard({
            type: 'html',
            html: `<p><strong>Problem ${index + 1}:</strong> ${problem.text}</p>`,
            meta: { source: 'practice-problem-individual', problemIndex: index }
          });
        };
        
        headerDiv.appendChild(contentDiv);
        headerDiv.appendChild(addButton);
        problemDiv.appendChild(headerDiv);

        // Look for solution in child elements of the problem container
        let solutionContent = null;
        const problemContainer = problem.element;
        
        // Check if solution is already inside the problem container
        const existingSolutionDiv = problemContainer.querySelector('div[style*="background: #f5f5f5"]');
        if (existingSolutionDiv) {
          solutionContent = existingSolutionDiv.cloneNode(true) as HTMLElement;
        }

        // Always add a "See solution" section (even if no solution exists yet)
        const solutionToggle = document.createElement('button');
        solutionToggle.className = 'mt-4 flex items-center gap-1 text-[#6B46C1] text-sm font-medium hover:text-purple-700 transition-colors';
        solutionToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" class="caret-icon">
            <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
          </svg>
          <span>See solution</span>
        `;
        
        const solutionDiv = document.createElement('div');
        solutionDiv.className = 'mt-4 hidden';
        
        if (solutionContent) {
          // Parse and format the solution content
          const formattedSolution = document.createElement('div');
          formattedSolution.className = 'bg-gray-50 p-4 rounded-lg';
          
          // Extract solution text and steps
          const solutionText = solutionContent.textContent || '';
          if (solutionText.includes('Solution:')) {
            formattedSolution.innerHTML = `<p class="text-sm font-medium text-gray-900 mb-3">Solution:</p>`;
            
            // Look for numbered steps
            const stepsList = solutionContent.querySelector('ol');
            if (stepsList) {
              const stepsHtml = stepsList.outerHTML.replace(/class="[^"]*"/g, 'class="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-3"');
              formattedSolution.innerHTML += stepsHtml;
            }
            
            // Look for answer
            const answerMatch = solutionText.match(/Answer:\s*(.+)/i);
            if (answerMatch) {
              formattedSolution.innerHTML += `<p class="text-sm text-gray-900"><span class="font-medium">Answer:</span> <span class="text-[#6B46C1] font-medium">${answerMatch[1].trim()}</span></p>`;
            }
          } else {
            formattedSolution.appendChild(solutionContent);
          }
          
          solutionDiv.appendChild(formattedSolution);
        } else {
          // No solution yet - show placeholder
          solutionDiv.innerHTML = `<div class="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">Solution will appear here when generated.</div>`;
        }
        
        solutionToggle.onclick = () => {
          const isHidden = solutionDiv.classList.contains('hidden');
          solutionDiv.classList.toggle('hidden');
          const icon = solutionToggle.querySelector('.caret-icon');
          if (icon) {
            if (isHidden) {
              icon.innerHTML = '<path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>';
            } else {
              icon.innerHTML = '<path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>';
            }
          }
        };
        
        problemDiv.appendChild(solutionToggle);
        problemDiv.appendChild(solutionDiv);
        
        problemsContainer.appendChild(problemDiv);
      });

      customContainer.appendChild(problemsContainer);

      // Hide original elements and insert custom UI
      let elementToHide = practiceHeading.nextElementSibling;
      while (elementToHide && !(/^H[1-6]$/.test(elementToHide.tagName))) {
        (elementToHide as HTMLElement).style.display = 'none';
        elementToHide = elementToHide.nextElementSibling;
      }

      // Insert custom UI after the heading
      practiceHeading.insertAdjacentElement('afterend', customContainer);
      } catch (error) {
        console.error('Error processing practice problems:', error);
      }
    };

    // Process after a delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      processPracticeProblems();
    }, 2000); // Increased delay to ensure all content is rendered

    // Set up observer for changes with debounce
    let observerTimeout: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      // Clear any existing processed sections when content changes
      processedSectionsRef.current = new WeakSet();
      clearTimeout(observerTimeout);
      observerTimeout = setTimeout(() => {
        processPracticeProblems();
      }, 1000); // Increased debounce time
    });

    if (containerRef?.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(observerTimeout);
      observer.disconnect();
    };
  }, [containerRef, isEditing]);

  return null;
};
