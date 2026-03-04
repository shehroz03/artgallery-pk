import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Award, ArrowRight, Eye, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getArtworks } from '../../utils/artworksStore';
import { fetchArtworks } from '../../services/artworkService';
import { fetchArtists, Artist } from '../../services/artistService';

interface BuyerHomeProps {
  onNavigate: (page: string, artworkId?: string) => void;
}

export function BuyerHome({ onNavigate }: BuyerHomeProps) {
  const [hoveredArtwork, setHoveredArtwork] = useState<string | null>(null);
  const [artworks, setArtworks] = useState(() => getArtworks());
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    fetchArtists().then(setArtists).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadArtworks() {
      try {
        const dbArtworks = await fetchArtworks({ limit: 100 });
        const formattedArtworks = dbArtworks.map((artwork: any) => ({
          ...artwork,
          image: artwork.imageUrl || artwork.image,
        }));

        // Remove duplicates by ID
        const uniqueArtworks = Array.from(
          formattedArtworks.reduce((map, artwork) => {
            const existing = map.get(artwork.id);
            if (!existing ||
              (artwork.updatedAt && (!existing.updatedAt || artwork.updatedAt > existing.updatedAt))) {
              map.set(artwork.id, artwork);
            }
            return map;
          }, new Map()).values()
        );

        setArtworks(uniqueArtworks);
      } catch (error) {
        console.error('Failed to load artworks:', error);
        setArtworks(getArtworks());
      } finally {
        setLoading(false);
      }
    }

    loadArtworks();

    const handler = () => {
      fetchArtworks({ limit: 100 }).then((dbArtworks) => {
        const formattedArtworks = dbArtworks.map((artwork: any) => ({
          ...artwork,
          image: artwork.imageUrl || artwork.image,
        }));
        setArtworks(formattedArtworks);
      });
    };
    window.addEventListener('artworks-updated', handler);
    return () => window.removeEventListener('artworks-updated', handler);
  }, []);

  const featuredArtworks = artworks.filter(art => art.featured);
  const trendingArtworks = artworks.filter(art => art.trending);

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .hero-content {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
              padding: 1rem !important;
              text-align: center;
            }
            
            .hero-title {
              font-size: 2rem !important;
            }
            
            .hero-subtitle {
              font-size: 1rem !important;
            }
            
            .hero-stats {
              justify-content: center !important;
            }
            
            .hero-image-container {
              display: none !important;
            }
            
            .section-container {
              padding: 3rem 1rem !important;
            }
            
            .section-title {
              font-size: 1.75rem !important;
            }
            
            .artwork-grid {
              grid-template-columns: 1fr !important;
              gap: 1.5rem !important;
            }
            
            .artists-grid {
              grid-template-columns: 1fr !important;
            }
            
            .stat-item {
              padding: 1rem !important;
            }
            
            .stat-value {
              font-size: 1.5rem !important;
            }
          }
        `}
      </style>
      {/* Hero Section with Floating Orbs */}
      <section style={styles.hero}>
        {/* Animated Background Orbs */}
        <motion.div
          style={{ ...styles.orb, ...styles.orb1 }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          style={{ ...styles.orb, ...styles.orb2 }}
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          style={{ ...styles.orb, ...styles.orb3 }}
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div style={styles.heroContent} className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={styles.heroText}
          >
            <motion.h1
              style={styles.heroTitle}
              className="hero-title"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              Discover Extraordinary Art
            </motion.h1>
            <p style={styles.heroSubtitle} className="hero-subtitle">
              Curated collection of Pakistan's finest contemporary artworks
            </p>

            <div style={styles.heroButtons}>
              <motion.button
                style={styles.primaryButton}
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('marketplace')}
              >
                <Sparkles size={20} />
                Explore Gallery
              </motion.button>
              <motion.button
                style={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('ar-studio')}
              >
                Try AR Studio
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={styles.heroImage}
            className="hero-image-container"
          >
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading artworks...</p>
              </div>
            ) : (
              <div style={styles.heroImageGrid}>
                {featuredArtworks.slice(0, 4).map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    style={styles.heroGridItem}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                  >
                    <img src={artwork.image} alt={artwork.title} style={styles.heroGridImage} />
                    <div style={styles.heroGridOverlay}>
                      <p style={styles.heroGridTitle}>{artwork.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Stats */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={styles.statsSection}
      >
        <div style={styles.statsGrid}>
          {[
            { label: 'Artworks', value: '5,000+', icon: Sparkles },
            { label: 'Artists', value: '250+', icon: Award },
            { label: 'Happy Collectors', value: '12K+', icon: Heart },
            { label: 'Countries', value: '45+', icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              style={styles.statCard}
              className="stat-item"
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
            >
              <stat.icon size={32} style={{ color: '#d4af37' }} />
              <h3 style={styles.statValue} className="stat-value">{stat.value}</h3>
              <p style={styles.statLabel}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Trending Artworks */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={styles.section}
        className="section-container"
      >
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle} className="section-title">
              <TrendingUp size={32} style={{ color: '#d4af37' }} />
              Trending Now
            </h2>
            <p style={styles.sectionSubtitle}>Most popular artworks this week</p>
          </div>
          <motion.button
            style={styles.viewAllButton}
            whileHover={{ x: 10 }}
            onClick={() => onNavigate('marketplace')}
          >
            View All <ArrowRight size={20} />
          </motion.button>
        </div>

        <div style={styles.artworkGrid} className="artwork-grid">
          {trendingArtworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              style={styles.artworkCard}
              onMouseEnter={() => setHoveredArtwork(artwork.id)}
              onMouseLeave={() => setHoveredArtwork(null)}
              whileHover={{ y: -10 }}
            >
              <div style={styles.artworkImageContainer}>
                <img src={artwork.image} alt={artwork.title} style={styles.artworkImage} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredArtwork === artwork.id ? 1 : 0 }}
                  style={styles.artworkOverlay}
                >
                  <motion.button
                    style={styles.overlayButton}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Eye size={20} />
                    Quick View
                  </motion.button>
                  <motion.button
                    style={{ ...styles.overlayButton, ...styles.overlayButtonSecondary }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart size={20} />
                  </motion.button>
                </motion.div>
              </div>
              <div style={styles.artworkInfo}>
                <h3 style={styles.artworkTitle}>{artwork.title}</h3>
                <p style={styles.artworkArtist}>{artwork.artist}</p>
                <div style={styles.artworkFooter}>
                  <span style={styles.artworkPrice}>PKR {artwork.price.toLocaleString()}</span>
                  <div style={styles.artworkStats}>
                    <span style={styles.artworkStat}>
                      <Heart size={14} /> {artwork.likes}
                    </span>
                    <span style={styles.artworkStat}>
                      <Eye size={14} /> {artwork.views}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Artists */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ ...styles.section, ...styles.artistsSection }}
      >
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              <Award size={32} style={{ color: '#d4af37' }} />
              Featured Artists
            </h2>
            <p style={styles.sectionSubtitle}>Discover talented creators</p>
          </div>
        </div>

        <div style={styles.artistsGrid} className="artists-grid">
          {artists.slice(0, 4).map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              style={styles.artistCard}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
            >
              <div style={styles.artistAvatar}>
                <img src={artist.avatar} alt={artist.name} style={styles.artistAvatarImage} />
                {artist.verified && (
                  <div style={styles.verifiedBadge}>
                    <Award size={16} />
                  </div>
                )}
              </div>
              <h3 style={styles.artistName}>{artist.name}</h3>
              <p style={styles.artistBio}>{artist.bio}</p>
              <div style={styles.artistStats}>
                <div style={styles.artistStatItem}>
                  <span style={styles.artistStatValue}>{artist.artworkCount}</span>
                  <span style={styles.artistStatLabel}>Artworks</span>
                </div>
                <div style={styles.artistStatItem}>
                  <span style={styles.artistStatValue}>{(artist.followers / 1000).toFixed(1)}K</span>
                  <span style={styles.artistStatLabel}>Followers</span>
                </div>
              </div>
              <motion.button
                style={styles.followButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Follow
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    paddingTop: '80px',
  },
  hero: {
    position: 'relative',
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(60px)',
    opacity: 0.3,
  },
  orb1: {
    width: '400px',
    height: '400px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    top: '10%',
    left: '5%',
  },
  orb2: {
    width: '500px',
    height: '500px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    bottom: '10%',
    right: '10%',
  },
  orb3: {
    width: '300px',
    height: '300px',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    top: '50%',
    right: '20%',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    alignItems: 'center',
  },
  heroText: {
    color: '#fff',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    lineHeight: 1.2,
    background: 'linear-gradient(90deg, #fff, #d4af37, #fff)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    padding: '1rem 2rem',
    borderRadius: '9999px',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
  },
  secondaryButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '9999px',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
  },
  heroImage: {},
  heroImageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  heroGridItem: {
    position: 'relative',
    borderRadius: '1rem',
    overflow: 'hidden',
    aspectRatio: '1',
    cursor: 'pointer',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  heroGridImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroGridOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '1rem',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  heroGridTitle: {
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  statsSection: {
    padding: '4rem 1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    margin: '1rem 0 0.5rem',
  },
  statLabel: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  section: {
    padding: '4rem 1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  viewAllButton: {
    background: 'transparent',
    color: '#d4af37',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid #d4af37',
    cursor: 'pointer',
  },
  artworkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
  },
  artworkCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  artworkImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  artworkOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
  },
  overlayButton: {
    background: '#d4af37',
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
  },
  overlayButtonSecondary: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '0.75rem',
  },
  artworkInfo: {
    padding: '1.5rem',
  },
  artworkTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  artworkArtist: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '1rem',
  },
  artworkFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artworkPrice: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#d4af37',
  },
  artworkStats: {
    display: 'flex',
    gap: '1rem',
  },
  artworkStat: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  artistsSection: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  artistsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
  },
  artistCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  artistAvatar: {
    position: 'relative',
    width: '100px',
    height: '100px',
    margin: '0 auto 1.5rem',
  },
  artistAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #d4af37',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    background: '#d4af37',
    color: '#1a1a2e',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #1a1a2e',
  },
  artistName: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  artistBio: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
  artistStats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '1.5rem',
    padding: '1rem 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  artistStatItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  artistStatValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#d4af37',
  },
  artistStatLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  followButton: {
    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
    color: '#1a1a2e',
    padding: '0.75rem 2rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(212, 175, 55, 0.2)',
    borderTop: '4px solid #d4af37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
  },
};
