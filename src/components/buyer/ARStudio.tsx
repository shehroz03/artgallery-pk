import { motion, AnimatePresence } from 'framer-motion';
import { Upload, RotateCw, ZoomIn, ZoomOut, Move, Trash2, ShoppingCart, Image as ImageIcon, Grid3x3, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { fetchArtworks } from '../../services/artworkService';
import { getArtworks } from '../../utils/artworksStore';
import { Artwork, ARPlacement } from '../../types';

interface ARStudioProps {
  onNavigate: (page: string) => void;
  onAddToCart: (artwork: Artwork) => void;
}

interface PlacedArtwork extends ARPlacement {
  artwork: Artwork;
}

export function ARStudio({ onNavigate, onAddToCart }: ARStudioProps) {
  const [wallImage, setWallImage] = useState<string | null>(null);
  const [placedArtworks, setPlacedArtworks] = useState<PlacedArtwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

      // STEP 1: Load from localStorage immediately
      const localArtworks = getArtworks().map((artwork: any) => ({
        ...artwork,
        image: artwork.imageUrl || artwork.image,
      }));
      if (localArtworks.length > 0) {
        setArtworks(localArtworks);
        setLoadingArtworks(false);
      }

      // STEP 2: Try Firestore and merge
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
        console.warn('⚠️ Firestore unavailable in AR Studio, using localStorage artworks');
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
      ctx.drawImage(wallImg, 0, 0, canvas.width, canvas.height);

      // Draw placed artworks with frames
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
          const frameWidth = 20 * scale;

          // Position
          const posX = (canvas.width * x) / 100;
          const posY = (canvas.height * y) / 100;

          // Apply rotation
          ctx.translate(posX, posY);
          ctx.rotate((rotation * Math.PI) / 180);

          // Draw shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 20 * scale;
          ctx.shadowOffsetX = 10 * scale;
          ctx.shadowOffsetY = 10 * scale;

          // Draw ornate gold frame
          const gradient = ctx.createLinearGradient(-width / 2 - frameWidth, -height / 2 - frameWidth, width / 2 + frameWidth, height / 2 + frameWidth);
          gradient.addColorStop(0, '#d4af37');
          gradient.addColorStop(0.5, '#ffd700');
          gradient.addColorStop(1, '#b8941e');

          ctx.fillStyle = gradient;
          ctx.fillRect(-width / 2 - frameWidth, -height / 2 - frameWidth, width + frameWidth * 2, height + frameWidth * 2);

          // Inner frame detail
          ctx.fillStyle = '#8b6914';
          ctx.fillRect(-width / 2 - frameWidth / 2, -height / 2 - frameWidth / 2, width + frameWidth, height + frameWidth);

          // Draw artwork
          ctx.shadowColor = 'transparent';
          ctx.drawImage(artImg, -width / 2, -height / 2, width, height);

          // Highlight if selected
          if (selectedPlacement === placement.artworkId) {
            ctx.strokeStyle = '#00f2fe';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.strokeRect(-width / 2 - frameWidth, -height / 2 - frameWidth, width + frameWidth * 2, height + frameWidth * 2);
            ctx.setLineDash([]);
          }

          ctx.restore();
        };
      });
    };
  }, [wallImage, placedArtworks, selectedPlacement]);

  const currentPlacement = getCurrentPlacement();

  return (
    <div style={styles.container} className="ar-container">
      <style>
        {`
          @media (max-width: 768px) {
            .ar-container {
              padding-top: 70px !important;
              min-height: 100vh !important;
            }
            
            .ar-header {
              padding: 1rem !important;
            }
            
            .ar-title {
              font-size: 1.5rem !important;
              gap: 0.5rem !important;
            }
            
            .ar-title svg {
              width: 24px !important;
              height: 24px !important;
            }
            
            .ar-subtitle {
              font-size: 0.875rem !important;
              line-height: 1.4 !important;
            }
            
            .ar-content {
              display: block !important;
              grid-template-columns: 1fr !important;
              padding: 1rem !important;
              gap: 1rem !important;
              min-height: auto !important;
            }
            
            .ar-canvas-panel {
              width: 100% !important;
              margin-bottom: 1rem !important;
              min-height: 400px !important;
              height: 400px !important;
              position: relative !important;
            }
            
            .ar-sidebar {
              display: none !important;
            }
            
            .ar-main-content {
              margin-left: 0 !important;
              padding: 1rem !important;
            }
            
            .ar-canvas-container {
              height: 300px !important;
              min-height: 300px !important;
            }
            
            .ar-upload-area {
              position: relative !important;
              inset: auto !important;
              min-height: 350px !important;
              height: 100% !important;
              padding: 2rem 1rem !important;
              width: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .ar-upload-text {
              font-size: 1.125rem !important;
              margin-bottom: 0.5rem !important;
            }
            
            .ar-upload-subtext {
              font-size: 0.875rem !important;
              text-align: center !important;
              max-width: 80% !important;
            }
            
            .ar-upload-area svg {
              width: 48px !important;
              height: 48px !important;
            }
            
            .ar-controls {
              flex-wrap: wrap !important;
              gap: 0.5rem !important;
              justify-content: center !important;
            }
            
            .ar-control-button {
              padding: 0.5rem 1rem !important;
              font-size: 0.875rem !important;
              flex: 1 1 auto !important;
              min-width: 120px !important;
            }
            
            .ar-artwork-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.75rem !important;
            }
            
            .ar-artwork-card {
              padding: 0.75rem !important;
            }
            
            .ar-artwork-title {
              font-size: 0.75rem !important;
            }
            
            .ar-artwork-price {
              font-size: 0.875rem !important;
            }
          }
        `}
      </style>
      <div style={styles.header} className="ar-header">
        <div>
          <h1 style={styles.title} className="ar-title">
            <ImageIcon size={32} style={{ color: '#d4af37' }} />
            VIP AR Try-On Studio
          </h1>
          <p style={styles.subtitle} className="ar-subtitle">
            Upload your wall photo, select paintings, and preview them in realistic AR
          </p>
        </div>
      </div>

      <div style={styles.content} className="ar-content">
        {/* Left Panel - Wall Canvas */}
        <div style={styles.canvasPanel} className="ar-canvas-panel">
          {!wallImage ? (
            <motion.div
              style={styles.uploadArea}
              className="ar-upload-area"
              whileHover={{ scale: 1.02 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={64} style={{ color: '#d4af37', marginBottom: '1rem' }} />
              <h3 style={styles.uploadTitle} className="ar-upload-text">Upload Your Wall Photo</h3>
              <p style={styles.uploadText} className="ar-upload-subtext">
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
            <div style={styles.canvasContainer} className="ar-canvas-container">
              <canvas ref={canvasRef} style={styles.canvas} />

              {/* Quick Actions */}
              <div style={styles.quickActions}>
                <motion.button
                  style={styles.actionButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowArtworkSelector(true)}
                >
                  <Grid3x3 size={20} />
                  Add Painting
                </motion.button>

                <motion.button
                  style={styles.actionButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setComparisonMode(!comparisonMode)}
                >
                  <Check size={20} />
                  Compare ({placedArtworks.length})
                </motion.button>

                <motion.button
                  style={{ ...styles.actionButton, background: '#1a1a2e' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={20} />
                  Change Wall
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Controls */}
        {wallImage && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={styles.controlPanel}
            className="ar-sidebar"
          >
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Placed Artworks</h3>

              {placedArtworks.length === 0 ? (
                <div style={styles.emptyState}>
                  <ImageIcon size={48} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  <p style={styles.emptyText}>No artworks placed yet</p>
                  <p style={styles.emptySubtext}>Click "Add Painting" to start</p>
                </div>
              ) : (
                <div style={styles.placedList}>
                  {placedArtworks.map((placement) => (
                    <motion.div
                      key={placement.artworkId}
                      style={{
                        ...styles.placedItem,
                        ...(selectedPlacement === placement.artworkId ? styles.placedItemActive : {}),
                      }}
                      whileHover={{ x: 5 }}
                      onClick={() => setSelectedPlacement(placement.artworkId)}
                    >
                      <img src={placement.artwork.image} alt={placement.artwork.title} style={styles.placedThumbnail} />
                      <div style={styles.placedInfo}>
                        <p style={styles.placedTitle}>{placement.artwork.title}</p>
                        <p style={styles.placedArtist}>{placement.artwork.artist}</p>
                      </div>
                      <motion.button
                        style={styles.removeButton}
                        whileHover={{ scale: 1.1 }}
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
            </div>

            {currentPlacement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.section}
              >
                <h3 style={styles.sectionTitle}>Adjustment Controls</h3>

                {/* Position */}
                <div style={styles.controlGroup}>
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
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onAddToCart(currentPlacement.artwork);
                    alert(`Added "${currentPlacement.artwork.title}" to cart!`);
                  }}
                >
                  <ShoppingCart size={20} />
                  Add to Cart - PKR {currentPlacement.artwork.price.toLocaleString()}
                </motion.button>
              </motion.div>
            )}

            {/* Comparison View */}
            {comparisonMode && placedArtworks.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.section}
              >
                <h3 style={styles.sectionTitle}>Side-by-Side Comparison</h3>
                <div style={styles.comparisonGrid}>
                  {placedArtworks.map((placement) => (
                    <div key={placement.artworkId} style={styles.comparisonItem}>
                      <img src={placement.artwork.image} alt={placement.artwork.title} style={styles.comparisonImage} />
                      <p style={styles.comparisonTitle}>{placement.artwork.title}</p>
                      <p style={styles.comparisonPrice}>PKR {placement.artwork.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Artwork Selector Modal */}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={styles.modal}
            >
              <h2 style={styles.modalTitle}>Select Artwork to Place</h2>
              {loadingArtworks ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
                  Loading artworks...
                </div>
              ) : (
                <div style={styles.artworkGrid} className="ar-artwork-grid">
                  {artworks.map((artwork) => (
                    <motion.div
                      key={artwork.id}
                      style={styles.artworkCard}
                      className="ar-artwork-card"
                      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' }}
                      onClick={() => addArtworkToWall(artwork)}
                    >
                      <img src={artwork.image} alt={artwork.title} style={styles.artworkImage} />
                      <div style={styles.artworkInfo}>
                        <p style={styles.artworkTitle} className="ar-artwork-title">{artwork.title}</p>
                        <p style={styles.artworkArtist}>{artwork.artist}</p>
                        <p style={styles.artworkPrice} className="ar-artwork-price">PKR {artwork.price.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    paddingTop: '80px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  header: {
    padding: '2rem 1.5rem',
    maxWidth: '1600px',
    margin: '0 auto',
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
    minHeight: '500px',
  },
  canvasPanel: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  uploadArea: {
    textAlign: 'center',
    padding: '4rem 2rem',
    cursor: 'pointer',
    width: '100%',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed rgba(212, 175, 55, 0.3)',
    borderRadius: '1rem',
    transition: 'all 0.3s ease',
    position: 'absolute',
    inset: 0,
  },
  uploadTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
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
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  quickActions: {
    position: 'absolute',
    top: '2rem',
    right: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
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
    height: '6px',
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
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1100,
    backdropFilter: 'blur(5px)',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#1a1a2e',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '900px',
    maxHeight: '80vh',
    overflow: 'auto',
    zIndex: 1200,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '1.5rem',
  },
  artworkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
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
    aspectRatio: '4/3',
    objectFit: 'cover',
  },
  artworkInfo: {
    padding: '1rem',
  },
  artworkTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.25rem',
  },
  artworkArtist: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '0.5rem',
  },
  artworkPrice: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#d4af37',
  },
};
