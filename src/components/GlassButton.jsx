import React from 'react';

const GlassButton = ({ children, onClick, className = "", type = "button", ...props }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg transition-all hover:bg-white/30 hover:scale-105 active:scale-95 font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlassButton;
