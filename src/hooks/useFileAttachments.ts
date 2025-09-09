import { useState, useCallback } from 'react';
import { AttachedFile } from '../types';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const useFileAttachments = () => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const generateThumbnail = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const addFiles = useCallback(async (files: FileList) => {
    const newFiles: AttachedFile[] = [];
    
    // Check if adding these files would exceed the limit
    if (attachedFiles.length + files.length > MAX_FILES) {
      alert(`You can only attach up to ${MAX_FILES} files.`);
      return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      const fileId = `file-${Date.now()}-${i}`;
      
      // Add file in loading state first
      const loadingFile: AttachedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        isLoading: true
      };
      
      newFiles.push(loadingFile);
    }

    // Add loading files immediately
    setAttachedFiles(prev => [...prev, ...newFiles]);

    // Process files asynchronously
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = newFiles[i]?.id;
      
      if (!fileId) continue;

      try {
        // Generate thumbnail for images
        const thumbnail = await generateThumbnail(file);
        
        // Simulate processing delay (remove in production)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // Update file with processed data
        setAttachedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? {
                ...f,
                isLoading: false,
                thumbnail,
                url: URL.createObjectURL(file)
              }
            : f
        ));
      } catch (error) {
        console.error('Error processing file:', error);
        // Remove failed file
        setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
      }
    }
  }, [attachedFiles.length]);

  const removeFile = useCallback((fileId: string) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  const clearAllFiles = useCallback(() => {
    attachedFiles.forEach(file => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    setAttachedFiles([]);
  }, [attachedFiles]);

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi';
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        addFiles(files);
      }
    };
    
    input.click();
  }, [addFiles]);

  return {
    attachedFiles,
    addFiles,
    removeFile,
    clearAllFiles,
    openFileDialog,
    canAddMore: attachedFiles.length < MAX_FILES,
    maxFiles: MAX_FILES
  };
};