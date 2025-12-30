import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export const Input = ({ fullWidth = false, style, ...props }: InputProps) => {
  return (
    <input 
      style={{ 
        width: fullWidth ? '100%' : 'auto',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        color: 'white',
        fontSize: '1rem',
        lineHeight: '1.5',
        outline: 'none',
        boxSizing: 'border-box',
        ...style
      }}
      {...props}
    />
  );
};
