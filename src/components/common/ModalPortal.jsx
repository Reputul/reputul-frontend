import { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const ModalPortal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState(null);

  useLayoutEffect(() => {
    let modalRoot = document.getElementById('modal-root');
    
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
    
    // Apply styles to modal root
    Object.assign(modalRoot.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '99999',
      pointerEvents: 'none'
    });

    // Create container element
    const el = document.createElement('div');
    el.style.pointerEvents = 'auto';
    modalRoot.appendChild(el);
    
    setContainer(el);
    setMounted(true);
    
    // Store the previous overflow value
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Set overflow hidden and compensate for scrollbar
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    return () => {
      // Clean up: restore overflow and padding
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      
      // Remove container
      if (modalRoot && el.parentNode === modalRoot) {
        modalRoot.removeChild(el);
      }
      
      // If modal root is empty, clean it up
      if (modalRoot && modalRoot.children.length === 0) {
        modalRoot.style.position = '';
        modalRoot.style.zIndex = '';
      }
    };
  }, []);

  if (!mounted || !container) {
    return null;
  }

  return createPortal(children, container);
};

export default ModalPortal;