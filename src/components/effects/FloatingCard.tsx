import { motion } from 'framer-motion';
import { useState, useRef, MouseEvent } from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  intensity?: number;
  glowColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function FloatingCard({ 
  children, 
  intensity = 20, 
  glowColor = '#d4af37',
  style,
  className 
}: FloatingCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -intensity;
    const rotateYValue = ((x - centerX) / centerX) * intensity;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setGlowPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowPosition({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        position: 'relative',
        overflow: 'hidden',
      }}
      className={className}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor}40 0%, transparent 50%)`,
          opacity: rotateX !== 0 || rotateY !== 0 ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
      
      {/* Shine effect */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `linear-gradient(135deg, transparent 40%, ${glowColor}20 50%, transparent 60%)`,
          transform: `translateX(${rotateY * 2}px) translateY(${rotateX * 2}px)`,
          transition: 'transform 0.3s ease',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
    </motion.div>
  );
}
