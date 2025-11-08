import React, { useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-start justify-between">
            <h2 id="modal-title" className="text-xl font-bold text-white">{title}</h2>
            <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white rounded-full transition-colors"
                aria-label="Close modal"
            >
                <XIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="mt-4">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;