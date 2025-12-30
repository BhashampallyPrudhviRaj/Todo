import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export const Card = ({ children, className = '', style, ...props }: CardProps) => {
  return (
    <motion.div 
      className={`glass-card ${className}`}
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--card-border)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: 'var(--glass-shadow)',
        marginBottom: '1rem',
        ...style
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
