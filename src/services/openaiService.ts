interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

interface ChatResponse {
  message: string;
  imageUrl?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIError {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}

interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  n?: number;
  quality?: 'standard' | 'hd';
  response_format?: 'url' | 'b64_json';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  user?: string;
}

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

class OpenAIService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  // Keywords that indicate a request for visual content
  private imageGenerationKeywords = [
    'create a diagram', 'draw', 'visualize', 'show me', 'generate an image',
    'make a chart', 'create a graph', 'illustrate', 'sketch', 'design',
    'create a visual', 'show visually', 'draw a picture', 'create an illustration',
    'make a drawing', 'visual representation', 'create a figure', 'diagram',
    'flowchart', 'mind map', 'infographic', 'timeline', 'organizational chart'
  ];

  // Keywords that indicate a request for math-related content
  private mathKeywords = [
    'plot', 'graph', 'equation', 'coordinate system', 'number line', 'geometric',
    'geometry', 'algebra', 'calculus', 'function', 'parabola', 'sine', 'cosine',
    'tangent', 'derivative', 'integral', 'polynomial', 'quadratic', 'linear',
    'exponential', 'logarithm', 'matrix', 'vector', 'triangle', 'circle',
    'rectangle', 'square', 'polygon', 'angle', 'slope', 'intercept', 'axis',
    'mathematical', 'math', 'statistics', 'probability', 'histogram', 'scatter plot',
    'bar chart', 'pie chart', 'box plot', 'regression', 'correlation'
  ];

  // Static math images for common requests
  private mathImages = {
    triangle: 'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    geometry: 'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    graph: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    plot: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    equation: 'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    function: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800&h=600'
  };

  private isMathRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.mathKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  private shouldGenerateImage(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.imageGenerationKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  private getMathImageUrl(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    for (const [key, url] of Object.entries(this.mathImages)) {
      if (lowerMessage.includes(key)) {
        return url;
      }
    }
    
    // Default math image for general math requests
    return this.mathImages.equation;
  }

  private generateMathPythonCode(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('triangle')) {
      return `import matplotlib.pyplot as plt
import numpy as np

# Create a triangle with labeled angles
fig, ax = plt.subplots(1, 1, figsize=(8, 6))

# Define triangle vertices
vertices = np.array([[0, 0], [1, 0], [0.3, 0.8], [0, 0]])

# Plot the triangle
ax.plot(vertices[:, 0], vertices[:, 1], 'k-', linewidth=2)

# Fill the triangle with different colors for each angle
triangle1 = plt.Polygon([(0, 0), (0.15, 0), (0.05, 0.1)], color='green', alpha=0.6)
triangle2 = plt.Polygon([(0.85, 0), (1, 0), (0.9, 0.1)], color='yellow', alpha=0.6)
triangle3 = plt.Polygon([(0.25, 0.7), (0.35, 0.7), (0.3, 0.8)], color='cyan', alpha=0.6)

ax.add_patch(triangle1)
ax.add_patch(triangle2)
ax.add_patch(triangle3)

# Add vertex labels
ax.text(-0.05, -0.05, 'A', fontsize=14, fontweight='bold')
ax.text(1.05, -0.05, 'B', fontsize=14, fontweight='bold')
ax.text(0.3, 0.85, 'C', fontsize=14, fontweight='bold')

# Add angle labels
ax.text(0.05, 0.05, '43°', fontsize=12, color='green', fontweight='bold')
ax.text(0.9, 0.05, '62°', fontsize=12, color='orange', fontweight='bold')
ax.text(0.25, 0.7, '75°', fontsize=12, color='cyan', fontweight='bold')

# Set equal aspect ratio and clean up the plot
ax.set_aspect('equal')
ax.set_xlim(-0.1, 1.1)
ax.set_ylim(-0.1, 0.9)
ax.axis('off')

plt.title('Triangle with Labeled Angles', fontsize=16, pad=20)
plt.tight_layout()
plt.show()`;
    }
    
    if (lowerMessage.includes('plot') || lowerMessage.includes('graph')) {
      return `import matplotlib.pyplot as plt
import numpy as np

# Generate x values
x = np.linspace(-10, 10, 100)

# Example function - you can modify this
y = x**2  # Quadratic function

# Create the plot
plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2, label='y = x²')
plt.grid(True, alpha=0.3)
plt.xlabel('x', fontsize=12)
plt.ylabel('y', fontsize=12)
plt.title('Mathematical Function Plot', fontsize=14)
plt.legend()
plt.axhline(y=0, color='k', linewidth=0.5)
plt.axvline(x=0, color='k', linewidth=0.5)
plt.show()`;
    }
    
    if (lowerMessage.includes('sine') || lowerMessage.includes('cosine')) {
      return `import matplotlib.pyplot as plt
import numpy as np

# Generate x values
x = np.linspace(0, 4*np.pi, 100)

# Create sine and cosine functions
y_sin = np.sin(x)
y_cos = np.cos(x)

# Create the plot
plt.figure(figsize=(12, 6))
plt.plot(x, y_sin, 'b-', linewidth=2, label='sin(x)')
plt.plot(x, y_cos, 'r-', linewidth=2, label='cos(x)')
plt.grid(True, alpha=0.3)
plt.xlabel('x', fontsize=12)
plt.ylabel('y', fontsize=12)
plt.title('Trigonometric Functions', fontsize=14)
plt.legend()
plt.axhline(y=0, color='k', linewidth=0.5)
plt.show()`;
    }
    
    // Default code for general math requests
    return `import matplotlib.pyplot as plt
import numpy as np

# Create a simple example plot
x = np.linspace(0, 2*np.pi, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2, label='sin(x)')
plt.grid(True, alpha=0.3)
plt.xlabel('x')
plt.ylabel('y')
plt.title('Mathematical Function')
plt.legend()
plt.show()`;
  }

  private createImagePrompt(userMessage: string): string {
    // Professional technical diagram style instructions
    const technicalDiagramStyle = `Create a professional, clean, and precise technical diagram suitable for educational purposes. Use the following specifications:
    
    VISUAL STYLE:
    - Clean vector art style with sharp, precise lines
    - Professional technical drawing aesthetic
    - Plain white background
    - High contrast for clarity
    - Avoid sketchy, hand-drawn, or artistic interpretations
    
    COLORS:
    - Use appropriate, distinct colors for different elements
    - Ensure colors are educational and meaningful (not random)
    - Maintain good contrast for readability
    - Use color coding consistently throughout the diagram
    
    LABELS AND TEXT:
    - All text must be perfectly legible and clearly positioned
    - Use clean, professional fonts
    - Ensure labels are properly aligned and spaced
    - Include all requested measurements, angles, or specifications
    - Make text large enough to read easily
    
    LAYOUT:
    - Center the diagram appropriately
    - Ensure proper proportions and scale
    - Leave adequate white space around elements
    - Organize elements logically and clearly
    
    EDUCATIONAL FOCUS:
    - Prioritize clarity and educational value over artistic appeal
    - Make the diagram suitable for teaching and learning
    - Ensure all requested elements are clearly visible and labeled
    
    REQUEST: ${userMessage}`;

    return technicalDiagramStyle;
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    // CRITICAL: Create immutable copy of the message to prevent reference sharing
    const immutableMessage = String(message);
    
    console.log('=== OPENAI SERVICE DEBUG ===');
    console.log('Original message:', message);
    console.log('Immutable message:', immutableMessage);
    console.log('Is math request:', this.isMathRequest(immutableMessage));
    console.log('Should generate image:', this.shouldGenerateImage(immutableMessage));
    console.log('============================');
    
    // Check if this is a math-related request first
    if (this.isMathRequest(immutableMessage)) {
      console.log('Math request detected, providing Python code and static image');
      
      const pythonCode = this.generateMathPythonCode(immutableMessage);
      const mathImageUrl = this.getMathImageUrl(immutableMessage);
      
      const mathResponse = `Here's Python code to create the mathematical visualization you requested:

\`\`\`python
${pythonCode}
\`\`\`

You can run this code in a Python environment that has matplotlib and numpy installed to generate the exact diagram. The code will create a precise mathematical visualization that you can use in your teaching materials.

**To run this code:**
1. Make sure you have matplotlib and numpy installed: \`pip install matplotlib numpy\`
2. Copy and paste the code into a Python file or Jupyter notebook
3. Run the code to see the generated diagram

The code above will create a professional mathematical diagram with proper labeling, colors, and formatting suitable for educational use.

Would you like me to modify the code or create a different type of visualization?`;

      return {
        message: mathResponse,
        imageUrl: mathImageUrl || undefined
      };
    }
    
    // Check if this is an image generation request
    if (this.shouldGenerateImage(immutableMessage)) {
      try {
        return await this.generateImageResponse(immutableMessage, conversationHistory);
      } catch (error) {
        console.warn('Image generation failed, falling back to text response:', error);
        // Fall back to text response if image generation fails
        return this.sendTextMessage(immutableMessage, conversationHistory);
      }
    }
    
    // Regular text message
    return this.sendTextMessage(immutableMessage, conversationHistory);
  }

  // Direct chat with custom messages, bypassing math/image heuristics
  public async sendCustomChat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
    }

    const functionUrl = `${this.supabaseUrl}/functions/v1/openai-chat`;
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'x-client-info': 'tutor-copilot@1.0.0',
          // Provide apikey as well for some environments
          'apikey': this.supabaseAnonKey,
        },
        body: JSON.stringify({ messages }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge function failed: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Supabase Edge Function error:', error);
      throw error;
    }
  }

  // Helper specialized for lesson plan updates to ensure HTML-only outputs
  public async updateLessonPlanWithContext(userRequest: string, lessonPlanHtml: string): Promise<string> {
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: [
        'You are an expert instructional designer and lesson plan editor.',
        'Apply the user request to the provided lesson plan using minimal edits.',
        'Unless the user explicitly asks to change a section, preserve ALL existing sections and their content (e.g., Notes) verbatim.',
        'When the request is about practice problems/questions, update only the Practice Problems section and do not remove or truncate any other section.',
        'For practice problems: DO NOT use <ol> or <ul> for the problems themselves. Output each problem as its own paragraph or line (no numbering characters), exactly matching the number requested by the user.',
        'Immediately after each problem paragraph, include a solution block using only plain HTML elements in this order: a paragraph with "Solution:", an ordered list (<ol>) of 2–5 short steps, and a final paragraph starting with "Answer:". Do NOT wrap with custom attributes; we will transform it.',
        'Each problem must be a complete, solvable statement (one or two sentences). Do NOT output generic learning objectives, and avoid placeholders like "Problem X:".',
        'If the user does not specify a number of practice problems, generate 8 problems with solutions by default; if the user asks for N, generate exactly N problems with solutions.',
        'Return only the FULL UPDATED LESSON PLAN as clean HTML suitable for a rich text editor (TipTap).',
        'Do not include code fences, backticks, markdown, or commentary—only the updated HTML.'
      ].join('\n')
    };
    const userPrompt: ChatMessage = {
      role: 'user',
      content: `Current lesson plan (HTML):\n\n${lessonPlanHtml}\n\nUser request: ${userRequest}\n\nPlease return only the full updated lesson plan in HTML.`
    };
    const result = await this.sendCustomChat([systemPrompt, userPrompt]);
    // System log: capture raw LLM result for debugging (truncated for safety)
    try {
      const msg = (result.message || '').toString();
      const preview = msg.slice(0, 1000);
      console.log('[OpenAI:updateLessonPlanWithContext] LLM response length:', msg.length);
      console.log('[OpenAI:updateLessonPlanWithContext] LLM response preview (first 1000 chars):', preview);
    } catch {}
    return (result.message || '').trim();
  }

  // NOTE: Removed; solutions are generated inline by updateLessonPlanWithContext

  private async generateImageResponse(message: string, conversationHistory: ChatMessage[]): Promise<ChatResponse> {
    // Generate both image and explanatory text
    const imagePrompt = this.createImagePrompt(message);
    
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
    }
    
    return await this.generateImageViaSupabase(message, imagePrompt, conversationHistory);
  }

  private async generateImageViaSupabase(message: string, imagePrompt: string, conversationHistory: ChatMessage[]): Promise<ChatResponse> {
    const functionUrl = `${this.supabaseUrl}/functions/v1/openai-image`;
    
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'x-client-info': 'tutor-copilot@1.0.0',
        },
        body: JSON.stringify({
          message,
          imagePrompt,
          conversationHistory
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText}` };
        }
        
        throw new Error(errorData.error || 'Failed to generate image via Supabase Edge Function');
      }

      return response.json();
    } catch (error) {
      console.error('Supabase image generation error:', error);
      throw error;
    }
  }


  private async sendTextMessage(message: string, conversationHistory: ChatMessage[]): Promise<ChatResponse> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
    }
    
    return await this.sendMessageViaSupabase(message, conversationHistory);
  }

  private async sendMessageViaSupabase(message: string, conversationHistory: ChatMessage[]): Promise<ChatResponse> {
    const functionUrl = `${this.supabaseUrl}/functions/v1/openai-chat`;
    
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'x-client-info': 'tutor-copilot@1.0.0',
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText}` };
        }
        
        // Handle specific OpenAI quota errors
        if (errorData.error && typeof errorData.error === 'string' && errorData.error.includes('insufficient_quota')) {
          throw new Error('OpenAI API quota exceeded. Please check your OpenAI account billing and usage at https://platform.openai.com/account/billing');
        }
        
        throw new Error(errorData.error || 'Failed to get AI response from Supabase Edge Function');
      }

      return response.json();
    } catch (error) {
      console.error('Supabase Edge Function error:', error);
      throw error;
    }
  }

}

export const openaiService = new OpenAIService();
