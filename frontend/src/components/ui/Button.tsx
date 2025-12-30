import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', className = '', style, children, ...props }: ButtonProps) => {
  const baseStyle = {
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    ...style
  };

  const variants = {
    primary: {
      background: 'var(--primary)',
      color: 'white',
      border: 'none'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'var(--text-main)',
      border: '1px solid var(--card-border)'
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--danger)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      padding: '0.5rem'
    }
  };

  return (
    <button 
      className={`btn-${variant} ${className}`}
      style={{ ...baseStyle, ...variants[variant] }}
      {...props}
    >
      {children}
    </button>
  );
};
