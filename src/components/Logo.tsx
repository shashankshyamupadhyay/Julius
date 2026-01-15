import React from 'react';

export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <img 
      src="/caesar-logo.png" 
      alt="Julius Caesar" 
      className={`${className} object-contain`}
    />
  );
};