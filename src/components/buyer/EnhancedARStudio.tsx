import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RotateCw, ZoomIn, ZoomOut, Move, Trash2, ShoppingCart, Image as ImageIcon, Grid3x3, Check, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { fetchArtworks } from '../../services/artworkService';
import { getArtworks } from '../../utils/artworksStore';
import { Artwork, ARPlacement } from '../../types';
import { FloatingCard } from '../effects/FloatingCard';
import { ParticleBackground } from '../effects/ParticleBackground';

interface EnhancedARStudioProps {
  onNavigate: (page: string) => void;
  onAddToCart: (artwork: Artwork) => void;
}

interface PlacedArtwork extends ARPlacement {
  artwork: Artwork;
}

export function EnhancedARStudio({ onNavigate, onAddToCart }: EnhancedARStudioProps) {
  const [wallImage, setWallImage] = useState<string | null>(null);
  const [placedArtworks, setPlacedArtworks] = useState<PlacedArtwork[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);
  const [showArtworkSelector, setShowArtworkSelector] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Load artworks — localStorage first (instant), then merge with Firestore
  useEffect(() => {
    async function loadArtworks() {
      setLoadingArtworks(true);

      // STEP 1: localStorage se turant load karo
      const localArtworks = getArtworks().map((artwork: any) => ({
        ...artwork,
        image: artwork.imageUrl || artwork.image,
      }));
      if (localArtworks.length > 0) {
        setArtworks(localArtworks);
        setLoadingArtworks(false);
      }

      // STEP 2: Firestore se merge karo (optional)
      try {
        const dbArtworks = await fetchArtworks({ limit: 100 });
        if (dbArtworks.length > 0) {
          const formattedDb = dbArtworks.map((artwork: any) => ({
            ...artwork,
            image: artwork.imageUrl || artwork.image,
          }));
          const dbIds = new Set(formattedDb.map((a: any) => a.id));
          const localOnly = localArtworks.filter((a: any) => !dbIds.has(a.id));
          const merged = [...formattedDb, ...localOnly];
          setArtworks(merged);
        }
      } catch (error) {
        console.warn('⚠️ Firestore unavailable in Enhanced AR Studio, showing localStorage artworks');
      } finally {
        setLoadingArtworks(false);
      }
    }
    loadArtworks();
  }, []);

  const handleWallUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWallImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addArtworkToWall = (artwork: Artwork) => {
    const newPlacement: PlacedArtwork = {
      artworkId: artwork.id,
      artwork,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    setPlacedArtworks([...placedArtworks, newPlacement]);
    setShowArtworkSelector(false);
    setSelectedPlacement(artwork.id);
  };

  const removePlacement = (artworkId: string) => {
    setPlacedArtworks(placedArtworks.filter(p => p.artworkId !== artworkId));
    setSelectedPlacement(null);
  };

  const updatePlacement = (artworkId: string, updates: Partial<ARPlacement>) => {
    setPlacedArtworks(
      placedArtworks.map(p =>
        p.artworkId === artworkId ? { ...p, ...updates } : p
      )
    );
  };

  const getCurrentPlacement = () => {
    return placedArtworks.find(p => p.artworkId === selectedPlacement);
  };

  useEffect(() => {
    if (!canvasRef.current || !wallImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const wallImg = new window.Image();
    wallImg.src = wallImage;

    wallImg.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;

      // Draw wall image
      ctx.drawImage(wallImg, 0, 0, canvas.width, canvas.height);

      // Draw placed artworks with enhanced 3D frames
      placedArtworks.forEach((placement) => {
        const { artwork, x, y, scale, rotation } = placement;
        const artImg = new window.Image();
        artImg.crossOrigin = 'anonymous';
        artImg.src = artwork.image;

        artImg.onload = () => {
          ctx.save();

          // Calculate dimensions
          const baseWidth = 200;
          const baseHeight = (baseWidth * artImg.height) / artImg.width;
          const width = baseWidth * scale;
          const height = baseHeight * scale;
          const frameWidth = 24 * scale; // Increased frame width

          // Position
          const posX = (canvas.width * x) / 100;
          const posY = (canvas.height * y) / 100;

          // Apply rotation
          ctx.translate(posX, posY);
          ctx.rotate((rotation * Math.PI) / 180);

          // Enhanced shadow layers for 3D depth
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 30 * scale;
          ctx.shadowOffsetX = 12 * scale;
          ctx.shadowOffsetY = 12 * scale;

          // Outer frame (darker gold)
          const outerGradient = ctx.createLinearGradient(
            -width / 2 - frameWidth,
            -height / 2 - frameWidth,
            width / 2 + frameWidth,
            height / 2 + frameWidth
          );
          outerGradient.addColorStop(0, '#8b6914');
          outerGradient.addColorStop(0.25, '#b8941e');
          outerGradient.addColorStop(0.5, '#d4af37');
          outerGradient.addColorStop(0.75, '#ffd700');
          outerGradient.addColorStop(1, '#b8941e');

          ctx.fillStyle = outerGradient;
          ctx.fillRect(
            -width / 2 - frameWidth,
            -height / 2 - frameWidth,
            width + frameWidth * 2,
            height + frameWidth * 2
          );

          // Inner frame bevel (lighter)
          const innerGradient = ctx.createLinearGradient(
            -width / 2 - frameWidth * 0.7,
            -height / 2 - frameWidth * 0.7,
            width / 2 + frameWidth * 0.7,
            height / 2 + frameWidth * 0.7
          );
          innerGradient.addColorStop(0, '#ffd700');
          innerGradient.addColorStop(0.5, '#d4af37');
          innerGradient.addColorStop(1, '#8b6914');

          ctx.fillStyle = innerGradient;
          ctx.fillRect(
            -width / 2 - frameWidth * 0.6,
            -height / 2 - frameWidth * 0.6,
            width + frameWidth * 1.2,
            height + frameWidth * 1.2
          );

          // Inner dark border
          ctx.fillStyle = '#4a3a1a';
          ctx.fillRect(
            -width / 2 - frameWidth * 0.3,
            -height / 2 - frameWidth * 0.3,
            width + frameWidth * 0.6,
            height + frameWidth * 0.6
          );

          // Clear shadow for artwork
          ctx.shadowColor = 'transparent';

          // Draw artwork
          ctx.drawImage(artImg, -width / 2, -height / 2, width, height);

          // Add glass reflection effect
          const reflectionGradient = ctx.createLinearGradient(
            -width / 2,
            -height / 2,
            -width / 2,
            -height / 2 + height * 0.3
          );
          reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = reflectionGradient;
          ctx.fillRect(-width / 2, -height / 2, width, height * 0.3);

          // Highlight if selected
          if (selectedPlacement === placement.artworkId) {
            ctx.strokeStyle = '#00f2fe';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 20;
            ctx.setLineDash([15, 8]);
            ctx.strokeRect(
              -width / 2 - frameWidth,
              -height / 2 - frameWidth,
              width + frameWidth * 2,
              height + frameWidth * 2
            );
            ctx.setLineDash([]);
          }

          ctx.restore();
        };
      });
    };
  }, [wallImage, placedArtworks, selectedPlacement]);

  const currentPlacement = getCurrentPlacement();

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .enhanced-ar-container {
            padding-top: 70px !important;
          }
          
          .enhanced-ar-header {
            padding: 1rem !important;
          }
          
          .enhanced-ar-title {
            font-size: 1.5rem !important;
            flex-direction: column !important;
            text-align: center !important;
          }
          
          .enhanced-ar-subtitle {
            font-size: 0.875rem !important;
            text-align: center !important;
          }
          
          .enhanced-ar-content {
            grid-template-columns: 1fr !important;
            padding: 0 1rem 2rem !important;
            gap: 1.5rem !important;
          }
          
          .enhanced-ar-canvas-panel {
            min-height: 400px !important;
            height: auto !important;
          }
          
          .enhanced-ar-upload-area {
            padding: 2rem 1rem !important;
          }
          
          .enhanced-ar-upload-title {
            font-size: 1.25rem !important;
          }
          
          .enhanced-ar-upload-text {
            font-size: 0.875rem !important;
          }
          
          .enhanced-ar-canvas-container {
            min-height: 350px !important;
            flex-direction: column !important;
            padding: 1rem !important;
          }
          
          .enhanced-ar-canvas {
            max-width: 100% !important;
            height: auto !important;
            margin-bottom: 1rem !important;
          }
          
          .enhanced-ar-quick-actions {
            position: relative !important;
            top: auto !important;
            right: auto !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 0.5rem !important;
            padding: 0 !important;
          }
          
          .enhanced-ar-action-button {
            width: 100% !important;
            padding: 0.75rem !important;
          }
          
          .enhanced-ar-change-wall-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            opacity: 1 !important;
            display: flex !important;
          }
          
          .enhanced-ar-control-panel {
            width: 100% !important;
          }
          
          .enhanced-ar-section {
            padding: 1rem !important;
          }
          
          .enhanced-ar-section-title {
            font-size: 1.125rem !important;
          }
          
          .enhanced-ar-placed-list {
            gap: 0.75rem !important;
          }
          
          .enhanced-ar-placed-item {
            padding: 0.75rem !important;
          }
          
          .enhanced-ar-controls {
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
          
          .enhanced-ar-control-btn {
            flex: 1 1 auto !important;
            min-width: 100px !important;
            padding: 0.5rem !important;
            font-size: 0.75rem !important;
          }
          
          .enhanced-ar-modal {
            width: 95% !important;
            max-height: 85vh !important;
            padding: 1.5rem !important;
          }
          
          .enhanced-ar-modal-title {
            font-size: 1.25rem !important;
            margin-bottom: 1rem !important;
          }
          
          .enhanced-ar-artwork-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          
          .enhanced-ar-artwork-card {
            display: flex !important;
            flex-direction: row !important;
          }
          
          .enhanced-ar-artwork-image {
            width: 120px !important;
            height: 120px !important;
            flex-shrink: 0 !important;
          }
          
          .enhanced-ar-artwork-info {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          
          .enhanced-ar-comparison-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={styles.container} className="enhanced-ar-container">
        <ParticleBackground color="#667eea" particleCount={30} />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.header}
          className="enhanced-ar-header"
        >
          <div>
            <h1 style={styles.title} className="enhanced-ar-title">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles size={32} style={{ color: '#d4af37' }} />
              </motion.div>
              VIP AR Try-On Studio
            </h1>
            <p style={styles.subtitle} className="enhanced-ar-subtitle">
              Upload your wall photo, select paintings, and preview them in realistic 3D AR
            </p>
          </div>
        </motion.div>

        <div style={styles.content} className="enhanced-ar-content">
          {/* Left Panel - Wall Canvas */}
          <FloatingCard intensity={15} glowColor="#667eea" style={styles.canvasPanel} className="enhanced-ar-canvas-panel">
            {!wallImage ? (
              <motion.div
                style={styles.uploadArea}
                className="enhanced-ar-upload-area"
                whileHover={{ scale: 1.02 }}
                onClick={() => fileInputRef.current?.click()}
                animate={{
                  borderColor: ['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.6)', 'rgba(212, 175, 55, 0.3)'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Upload size={64} style={{ color: '#d4af37' }} />
                </motion.div>
                <h3 style={styles.uploadTitle} className="enhanced-ar-upload-title">Upload Your Wall Photo</h3>
                <p style={styles.uploadText} className="enhanced-ar-upload-text">
                  Click to upload or drag and drop your room/wall image
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWallUpload}
                  style={{ display: 'none' }}
                />
              </motion.div>
            ) : (
              <div style={styles.canvasContainer} className="enhanced-ar-canvas-container">
                <canvas ref={canvasRef} style={styles.canvas} className="enhanced-ar-canvas" />

                {/* Hidden file input for changing wall */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWallUpload}
                  style={{ display: 'none' }}
                />

                {/* Quick Actions with 3D effects */}
                <div style={styles.quickActions} className="enhanced-ar-quick-actions">
                  <motion.button
                    style={styles.actionButton}
                    className="enhanced-ar-action-button"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)',
                      rotateY: 5,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowArtworkSelector(true)}
                  >
                    <Grid3x3 size={20} />
                    Add Painting
                  </motion.button>

                  <motion.button
                    style={styles.actionButton}
                    className="enhanced-ar-action-button"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)',
                      rotateY: -5,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setComparisonMode(!comparisonMode)}
                  >
                    <Check size={20} />
                    Compare ({placedArtworks.length})
                  </motion.button>

                  <motion.button
                    style={{ ...styles.actionButton, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    className="enhanced-ar-action-button enhanced-ar-change-wall-button"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: '0 0 30px rgba(102, 126, 234, 0.6)',
                      rotateY: 5,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <Upload size={20} />
                    Change Wall
                  </motion.button>
                </div>
              </div>
            )}
          </FloatingCard>

          {/* Right Panel - Controls */}
          {wallImage && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              style={styles.controlPanel}
              className="enhanced-ar-control-panel"
            >
              <FloatingCard intensity={10} glowColor="#764ba2" style={styles.section} className="enhanced-ar-section">
                <h3 style={styles.sectionTitle} className="enhanced-ar-section-title">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                  {' '}Placed Artworks
                </h3>

                {placedArtworks.length === 0 ? (
                  <div style={styles.emptyState}>
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                      }}
                    >
                      <ImageIcon size={48} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    </motion.div>
                    <p style={styles.emptyText}>No artworks placed yet</p>
                    <p style={styles.emptySubtext}>Click "Add Painting" to start</p>
                  </div>
                ) : (
                  <div style={styles.placedList} className="enhanced-ar-placed-list">
                    {placedArtworks.map((placement, index) => (
                      <motion.div
                        key={placement.artworkId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          ...styles.placedItem,
                          ...(selectedPlacement === placement.artworkId ? styles.placedItemActive : {}),
                        }}
                        className="enhanced-ar-placed-item"
                        whileHover={{
                          x: 5,
                          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
                        }}
                        onClick={() => setSelectedPlacement(placement.artworkId)}
                      >
                        <img src={placement.artwork.image} alt={placement.artwork.title} style={styles.placedThumbnail} />
                        <div style={styles.placedInfo}>
                          <p style={styles.placedTitle}>{placement.artwork.title}</p>
                          <p style={styles.placedArtist}>{placement.artwork.artist}</p>
                        </div>
                        <motion.button
                          style={styles.removeButton}
                          whileHover={{ scale: 1.2, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlacement(placement.artworkId);
                          }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </FloatingCard>

              {currentPlacement && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FloatingCard intensity={10} glowColor="#ffd700" style={styles.section} className="enhanced-ar-section">
                    <h3 style={styles.sectionTitle} className="enhanced-ar-section-title">🎨 Adjustment Controls</h3>

                    {/* Position */}
                    <div style={styles.controlGroup} className="enhanced-ar-controls">
                      <label style={styles.controlLabel}>
                        <Move size={16} />
                        Position X: {currentPlacement.x.toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentPlacement.x}
                        onChange={(e) => updatePlacement(currentPlacement.artworkId, { x: Number(e.target.value) })}
                        style={styles.slider}
                      />
                    </div>

                    <div style={styles.controlGroup}>
                      <label style={styles.controlLabel}>Position Y: {currentPlacement.y.toFixed(0)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentPlacement.y}
                        onChange={(e) => updatePlacement(currentPlacement.artworkId, { y: Number(e.target.value) })}
                        style={styles.slider}
                      />
                    </div>

                    {/* Scale */}
                    <div style={styles.controlGroup}>
                      <label style={styles.controlLabel}>
                        <ZoomIn size={16} />
                        Scale: {currentPlacement.scale.toFixed(2)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={currentPlacement.scale}
                        onChange={(e) => updatePlacement(currentPlacement.artworkId, { scale: Number(e.target.value) })}
                        style={styles.slider}
                      />
                    </div>

                    {/* Rotation */}
                    <div style={styles.controlGroup}>
                      <label style={styles.controlLabel}>
                        <RotateCw size={16} />
                        Rotation: {currentPlacement.rotation.toFixed(0)}°
                      </label>
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={currentPlacement.rotation}
                        onChange={(e) => updatePlacement(currentPlacement.artworkId, { rotation: Number(e.target.value) })}
                        style={styles.slider}
                      />
                    </div>

                    {/* Add to Cart */}
                    <motion.button
                      style={styles.addToCartButton}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 40px rgba(212, 175, 55, 0.8)',
                        rotateY: 5,
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        onAddToCart(currentPlacement.artwork);
                        alert(`Added "${currentPlacement.artwork.title}" to cart!`);
                      }}
                    >
                      <ShoppingCart size={20} />
                      Add to Cart - PKR {currentPlacement.artwork.price.toLocaleString()}
                    </motion.button>
                  </FloatingCard>
                </motion.div>
              )}

              {/* Comparison View */}
              {comparisonMode && placedArtworks.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <FloatingCard intensity={10} glowColor="#00f2fe" style={styles.section} className="enhanced-ar-section">
                    <h3 style={styles.sectionTitle} className="enhanced-ar-section-title">📊 Side-by-Side Comparison</h3>
                    <div style={styles.comparisonGrid} className="enhanced-ar-comparison-grid">
                      {placedArtworks.map((placement, index) => (
                        <motion.div
                          key={placement.artworkId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          style={styles.comparisonItem}
                          whileHover={{ scale: 1.05, y: -5 }}
                        >
                          <img src={placement.artwork.image} alt={placement.artwork.title} style={styles.comparisonImage} />
                          <p style={styles.comparisonTitle}>{placement.artwork.title}</p>
                          <p style={styles.comparisonPrice}>PKR {placement.artwork.price.toLocaleString()}</p>
                        </motion.div>
                      ))}
                    </div>
                  </FloatingCard>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Artwork Selector Modal with 3D effects */}
        <AnimatePresence>
          {showArtworkSelector && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.modalBackdrop}
                onClick={() => setShowArtworkSelector(false)}
              />
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(26, 26, 46, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  width: '90%',
                  maxWidth: '1000px',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 1200,
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.2)',
                }}
                className="enhanced-ar-modal"
              >
                <h2 style={styles.modalTitle} className="enhanced-ar-modal-title">Select Artwork to Place</h2>
                {loadingArtworks ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
                    Loading artworks...
                  </div>
                ) : (
                  <div style={styles.artworkGrid} className="enhanced-ar-artwork-grid">
                    {artworks.map((artwork, index) => (
                      <motion.div
                        key={artwork.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={styles.artworkCard}
                        className="enhanced-ar-artwork-card"
                        whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(212, 175, 55, 0.3)' }}
                        onClick={() => addArtworkToWall(artwork)}
                      >
                        <img src={artwork.image} alt={artwork.title} style={styles.artworkImage} className="enhanced-ar-artwork-image" />
                        <div style={styles.artworkInfo} className="enhanced-ar-artwork-info">
                          <p style={styles.artworkTitle}>{artwork.title}</p>
                          <p style={styles.artworkArtist}>{artwork.artist}</p>
                          <p style={styles.artworkPrice}>PKR {artwork.price.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Styles remain the same as the original ARStudio component
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    paddingTop: '80px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    padding: '2rem 1.5rem',
    maxWidth: '1600px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 1.5rem 2rem',
    position: 'relative',
    zIndex: 1,
  },
  canvasPanel: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    minHeight: '600px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArea: {
    textAlign: 'center',
    padding: '4rem 2rem',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed rgba(212, 175, 55, 0.3)',
    borderRadius: '1rem',
    transition: 'all 0.3s ease',
  },
  uploadTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  uploadText: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  canvasContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  canvas: {
    maxWidth: '100%',
    maxHeight: '700px',
    borderRadius: '0.5rem',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6)',
  },
  quickActions: {
    position: 'absolute',
    top: '2rem',
    right: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  actionButton: {
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
    whiteSpace: 'nowrap',
    transformStyle: 'preserve-3d',
  },
  controlPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  section: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '1rem',
  },
  emptySubtext: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: '0.5rem',
  },
  placedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  placedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.3s ease',
  },
  placedItemActive: {
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
  },
  placedThumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '0.5rem',
    objectFit: 'cover',
  },
  placedInfo: {
    flex: 1,
  },
  placedTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.25rem',
  },
  placedArtist: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  removeButton: {
    background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlGroup: {
    marginBottom: '1.5rem',
  },
  controlLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.1)',
    outline: 'none',
    cursor: 'pointer',
  },
  addToCartButton: {
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    padding: '1rem',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
    width: '100%',
    transformStyle: 'preserve-3d',
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  comparisonItem: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    textAlign: 'center',
    cursor: 'pointer',
  },
  comparisonImage: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover',
    borderRadius: '0.375rem',
    marginBottom: '0.5rem',
  },
  comparisonTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.25rem',
  },
  comparisonPrice: {
    fontSize: '0.75rem',
    color: '#d4af37',
    fontWeight: 600,
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1100,
    backdropFilter: 'blur(8px)',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) !important',
    background: 'rgba(26, 26, 46, 0.98)',
    backdropFilter: 'blur(20px)',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '1.5rem',
    padding: '2rem',
    width: '90%',
    maxWidth: '1000px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1200,
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.2)',
  } as React.CSSProperties,
  modalTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '1.5rem',
    textAlign: 'center',
    flexShrink: 0,
  },
  artworkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    overflowY: 'auto',
    paddingRight: '0.5rem',
    paddingBottom: '1rem',
  },
  artworkCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
  },
  artworkImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
  },
  artworkInfo: {
    padding: '1rem',
  },
  artworkTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  artworkArtist: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '0.5rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  artworkPrice: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#d4af37',
  },
};
