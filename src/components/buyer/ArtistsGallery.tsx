import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Award, Heart, MapPin, Search, Loader } from 'lucide-react';
import { fetchArtists, Artist } from '../../services/artistService';

export function ArtistsGallery() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified'>('all');

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    setLoading(true);
    try {
      const fetchedArtists = await fetchArtists();
      setArtists(fetchedArtists);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'verified' && artist.verified);
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .artists-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          
          .artists-title {
            font-size: 1.75rem !important;
          }
          
          .artists-search-container {
            flex-direction: column !important;
            gap: 1rem !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={styles.title}>Featured Artists</h1>
          <p style={styles.subtitle}>Discover talented artists from Pakistan and around the world</p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.searchBar}
        >
          <div style={styles.searchInput}>
            <Search size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterButtons}>
            <button
              onClick={() => setFilter('all')}
              style={{
                ...styles.filterButton,
                background: filter === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)',
              }}
            >
              All Artists
            </button>
            <button
              onClick={() => setFilter('verified')}
              style={{
                ...styles.filterButton,
                background: filter === 'verified' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)',
              }}
            >
              <Award size={16} />
              Verified Only
            </button>
          </div>
        </motion.div>
      </div>

      {/* Artists Grid */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
            <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)' }}>Loading artists...</p>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={64} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)' }}>No artists found</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                style={styles.card}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
              >
                {/* Avatar */}
                <div style={styles.avatarContainer}>
                  <img src={artist.avatar} alt={artist.name} style={styles.avatar} />
                  {artist.verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                      style={styles.verifiedBadge}
                    >
                      <Award size={16} />
                    </motion.div>
                  )}
                </div>

                {/* Artist Info */}
                <div style={styles.artistInfo}>
                  <h3 style={styles.artistName}>{artist.name}</h3>
                  <div style={styles.location}>
                    <MapPin size={14} />
                    <span>{artist.country}</span>
                  </div>
                  <p style={styles.bio}>{artist.bio}</p>
                </div>

                {/* Stats */}
                <div style={styles.stats}>
                  <div style={styles.stat}>
                    <Users size={18} style={{ color: '#667eea' }} />
                    <div>
                      <p style={styles.statValue}>{artist.followers.toLocaleString()}</p>
                      <p style={styles.statLabel}>Followers</p>
                    </div>
                  </div>
                  <div style={styles.stat}>
                    <Heart size={18} style={{ color: '#f093fb' }} />
                    <div>
                      <p style={styles.statValue}>{artist.artworkCount}</p>
                      <p style={styles.statLabel}>Artworks</p>
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                <motion.button
                  style={styles.followButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Follow Artist
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    paddingTop: '80px',
    paddingBottom: '3rem',
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '2rem',
  },
  searchBar: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: '2rem',
  },
  searchInput: {
    flex: '1',
    minWidth: '300px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'white',
    fontSize: '1rem',
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterButton: {
    padding: '0.75rem 1.5rem',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: '1.5rem',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid rgba(102,126,234,0.3)',
    objectFit: 'cover',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    padding: '0.5rem',
    border: '3px solid #1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  artistInfo: {
    marginBottom: '1.5rem',
    width: '100%',
  },
  artistName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem',
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  bio: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  stats: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    width: '100%',
    justifyContent: 'center',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  followButton: {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};
