import './SkeletonLoader.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = '4px', className = '', style = {} }: SkeletonProps) => {
  return (
    <div 
      className={`skeleton-loader ${className}`} 
      style={{ width, height, borderRadius, ...style }}
    />
  );
};

export default SkeletonLoader;
