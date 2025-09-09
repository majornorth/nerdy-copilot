import React from 'react';
import { FileAttachment } from './FileAttachment';
import { AttachedFile } from '../../types';

interface FileAttachmentListProps {
  files: AttachedFile[];
  onRemoveFile: (fileId: string) => void;
}

/**
 * Container component for displaying multiple file attachments
 * Shows files in a horizontal scrollable list with proper spacing
 */
export const FileAttachmentList: React.FC<FileAttachmentListProps> = ({ 
  files, 
  onRemoveFile 
}) => {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {files.map((file) => (
        <FileAttachment
          key={file.id}
          file={file}
          onRemove={onRemoveFile}
        />
      ))}
    </div>
  );
};