import React from 'react';

interface OllamaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const OllamaLogo: React.FC<OllamaLogoProps> = ({ 
  className = '', 
  size = 'md',
  style = {}
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={`${sizeClasses[size]} ${className}`}
      fill="currentColor"
      style={style}
    >
      <path d="M128,56C95.7,56,68,69.2,50.1,92.5c-8.7,11.3-14.8,24.7-17.5,39.1c-2.8,15-1.1,30.9,4.9,44.9c6,14,16.2,25.4,29.2,32.7 c13,7.3,28.5,10.7,44.3,9.8c15.8-0.9,31-5.1,43.9-12.3c12.9-7.2,23.1-17.4,29.2-30.1c6.1-12.7,8.1-27.4,5.7-41.6c-2.4-14.2-9.6-27.5-20.7-37.7 C164.2,68.4,147.2,56,128,56z M128,72c16.1,0,31.2,7.3,41.5,20c10.3,12.7,15.1,29.6,13.1,45.9c-2,16.3-9.6,31.2-21.3,41.7 c-11.7,10.5-27.1,16.1-43.3,15.7c-16.2-0.4-31.7-6.7-43.2-17.5c-11.5-10.8-18.3-25.9-19-42.1c-0.7-16.2,4.9-32.1,15.5-43.9 C87.9,79.9,107.3,72,128,72z M128,104c-13.3,0-24,10.7-24,24s10.7,24,24,24s24-10.7,24-24S141.3,104,128,104z" />
    </svg>
  );
};