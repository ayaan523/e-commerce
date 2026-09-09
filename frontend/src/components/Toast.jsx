import { useEffect } from 'react';
import '../App.css';

const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div className={`toast-wrapper ${isVisible ? 'visible' : ''}`}>
      <div className="toast-container">
        <div className="toast-dot" />
        <p className="toast-text">{message}</p>
      </div>
    </div>
  );
};

export default Toast;