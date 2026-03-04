import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Loading3D.css';

export function Loading3D() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading animation on every mount/reload
    setIsLoading(true);
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds loading animation

    // Listen for page reload
    const handleBeforeUnload = () => {
      setIsLoading(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loading-3d-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="loading-3d-wrapper">
            {/* 3D Rotating Cube */}
            <div className="cube-container">
              <div className="cube">
                <div className="cube-face cube-front">
                  <div className="cube-content">🎨</div>
                </div>
                <div className="cube-face cube-back">
                  <div className="cube-content">✨</div>
                </div>
                <div className="cube-face cube-right">
                  <div className="cube-content">🖼️</div>
                </div>
                <div className="cube-face cube-left">
                  <div className="cube-content">🌟</div>
                </div>
                <div className="cube-face cube-top">
                  <div className="cube-content">💎</div>
                </div>
                <div className="cube-face cube-bottom">
                  <div className="cube-content">🎭</div>
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <motion.div
              className="loading-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="loading-title">ArtGallery.Pk</h2>
              <div className="loading-dots">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                >
                  ●
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                >
                  ●
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                >
                  ●
                </motion.span>
              </div>
            </motion.div>

            {/* Orbiting Particles */}
            <div className="particles">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="particle"
                  style={{
                    '--index': i,
                  } as React.CSSProperties}
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: 'linear',
                    },
                    scale: {
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    },
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

