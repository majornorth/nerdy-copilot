import React from 'react';
import { useCallback, useRef, useEffect } from 'react';

interface UseAutoSaveOptions {
  onSave: (content: string) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseAutoSaveReturn {
  triggerSave: (content: string) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  hasError: boolean;
  error: string | null;
  forceSave: (content: string) => Promise<void>;
  retryCount: number;
  isRetrying: boolean;
  retry: () => Promise<void>;
}

/**
 * Custom hook for implementing debounced auto-save functionality
 * Prevents excessive API calls by delaying save operations
 * Includes retry logic for handling network failures
 */
export const useAutoSave = ({
  onSave,
  delay = 2000,
  enabled = true,
  maxRetries = 3,
  retryDelay = 1000
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const isRetryingRef = useRef(false);
  const lastSavedRef = useRef<Date | null>(null);
  const hasErrorRef = useRef(false);
  const errorRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const pendingContentRef = useRef<string | null>(null);
  const lastFailedContentRef = useRef<string | null>(null);

  // Force re-render when state changes
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const clearSaveTimeout = useCallback(() => {
    if (timeoutRef.current) {
      // Ensure we call the global window.clearTimeout to avoid any shadowing
      window.clearTimeout(timeoutRef.current as unknown as number);
      timeoutRef.current = null;
    }
  }, []);

  const isNetworkError = useCallback((error: unknown): boolean => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('offline') ||
        error.name === 'NetworkError' ||
        error.name === 'TypeError'
      );
    }
    return false;
  }, []);

  const performSaveWithRetry = useCallback(async (content: string, retryAttempt: number = 0): Promise<void> => {
    try {
      await onSave(content);
      
      // Success - reset retry count and clear error state
      retryCountRef.current = 0;
      lastFailedContentRef.current = null;
      hasErrorRef.current = false;
      errorRef.current = null;
      lastSavedRef.current = new Date();
      pendingContentRef.current = null;
      
      console.log('Auto-save completed successfully');
    } catch (error) {
      const isRetryable = isNetworkError(error) && retryAttempt < maxRetries;
      
      if (isRetryable) {
        retryCountRef.current = retryAttempt + 1;
        lastFailedContentRef.current = content;
        
        console.log(`Auto-save failed (attempt ${retryAttempt + 1}/${maxRetries + 1}), retrying in ${retryDelay}ms...`, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryAttempt))); // Exponential backoff
        
        // Retry the save operation
        return performSaveWithRetry(content, retryAttempt + 1);
      } else {
        // Max retries reached or non-retryable error
        retryCountRef.current = retryAttempt;
        lastFailedContentRef.current = content;
        hasErrorRef.current = true;
        
        if (retryAttempt >= maxRetries) {
          errorRef.current = `Save failed after ${maxRetries + 1} attempts. Please check your connection and try again.`;
        } else {
          errorRef.current = error instanceof Error ? error.message : 'Save failed';
        }
        
        console.error('Auto-save failed permanently:', error);
        throw error;
      }
    }
  }, [onSave, maxRetries, retryDelay, isNetworkError]);

  const performSave = useCallback(async (content: string) => {
    if (!enabled || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      isRetryingRef.current = false;
      forceUpdate();

      await performSaveWithRetry(content);
      
    } catch (error) {
      // Error handling is done in performSaveWithRetry
    } finally {
      isSavingRef.current = false;
      isRetryingRef.current = false;
      forceUpdate();
    }
  }, [enabled, performSaveWithRetry]);

  const triggerSave = useCallback((content: string) => {
    if (!enabled) return;

    // Store the latest content
    pendingContentRef.current = content;

    // Clear any existing timeout
    clearSaveTimeout();

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      if (pendingContentRef.current) {
        performSave(pendingContentRef.current);
      }
    }, delay);

    console.log(`Auto-save scheduled in ${delay}ms`);
  }, [enabled, delay, clearSaveTimeout, performSave]);

  const forceSave = useCallback(async (content: string) => {
    clearSaveTimeout();
    await performSave(content);
  }, [clearSaveTimeout, performSave]);

  const retry = useCallback(async () => {
    if (!lastFailedContentRef.current || isSavingRef.current) return;
    
    try {
      isRetryingRef.current = true;
      hasErrorRef.current = false;
      errorRef.current = null;
      forceUpdate();
      
      await performSave(lastFailedContentRef.current);
    } catch (error) {
      // Error handling is already done in performSave
      console.error('Manual retry failed:', error);
    }
  }, [performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSaveTimeout();
    };
  }, [clearSaveTimeout]);

  return {
    triggerSave,
    isSaving: isSavingRef.current,
    isRetrying: isRetryingRef.current,
    lastSaved: lastSavedRef.current,
    hasError: hasErrorRef.current,
    error: errorRef.current,
    retryCount: retryCountRef.current,
    forceSave,
    retry
  };
};
