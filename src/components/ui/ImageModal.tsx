import React from 'react';
import { X, ArrowSquareOut, Download } from 'phosphor-react';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

/**
 * Image modal component that displays images in a full-screen overlay
 * Matches the design from the screenshot with white background and action buttons
 */
export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageUrl,
  altText = "Generated diagram",
  onClose
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'generated-diagram.png';
    link.click();
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999999] p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] overflow-hidden">
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={handleOpenInNewTab}
            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 hover:text-gray-900 rounded-lg shadow-sm transition-all duration-200 backdrop-blur-sm"
            title="Open in new tab"
          >
            <ArrowSquareOut size={20} weight="regular" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 hover:text-gray-900 rounded-lg shadow-sm transition-all duration-200 backdrop-blur-sm"
            title="Download image"
          >
            <Download size={20} weight="regular" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 hover:text-gray-900 rounded-lg shadow-sm transition-all duration-200 backdrop-blur-sm"
            title="Close"
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* Image Container */}
        <div className="p-8 flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={altText}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  ) : null;

  return createPortal(modalContent, document.body);
};