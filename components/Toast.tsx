import React, { useEffect, useState } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setVisible(true);
    // Set timeout to animate out
    const timer = setTimeout(() => {
      setVisible(false);
      // Call onClose after animation out
      setTimeout(onClose, 300);
    }, 2700);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const bgColor = type === 'success' ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500';
  const Icon = type === 'success' ? CheckIcon : XIcon;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg text-white border transition-all duration-300 ${bgColor} ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button onClick={onClose} className="ml-4 -mr-2 p-1.5 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
