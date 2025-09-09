import React from 'react';
import { X, FileText } from 'phosphor-react';
import { AttachedFile } from '../../types';

interface FileAttachmentProps {
  file: AttachedFile;
  onRemove: (fileId: string) => void;
}

/**
 * Individual file attachment component showing thumbnail, name, and remove button
 * Handles both loading and loaded states with appropriate visual feedback
 */
export const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onRemove }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (file.isLoading) {
    // Loading state - gray placeholder
    return (
      <div className="relative w-16 h-20 bg-gray-200 rounded-lg animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* File thumbnail container */}
      <div className="w-16 h-20 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {isPDF ? (
          // PDF preview with document icon and "PDF" label
          <div className="h-full flex flex-col items-center justify-center p-2">
            <FileText size={24} weight="regular" className="text-red-600 mb-1" />
            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-1 py-0.5 rounded">
              PDF
            </span>
          </div>
        ) : file.thumbnail ? (
          // Image thumbnail
          <img 
            src={file.thumbnail} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          // Generic file icon
          <div className="h-full flex items-center justify-center">
            <FileText size={24} weight="regular" className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Remove button - appears on hover */}
      <button
        onClick={() => onRemove(file.id)}
        className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 hover:bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <X size={12} weight="bold" />
      </button>

      {/* File name tooltip on hover */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap mt-1">
          {file.name}
          <div className="text-gray-300">{formatFileSize(file.size)}</div>
        </div>
      </div>
    </div>
  );
};