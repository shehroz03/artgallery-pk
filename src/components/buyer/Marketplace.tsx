import { motion } from 'framer-motion';
import { Grid, List, Heart, Eye, ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getArtworks, updateArtwork } from '../../utils/artworksStore';
import { Artwork } from '../../types';
import { fetchArtworks } from '../../services/artworkService';

interface MarketplaceProps {
  onAddToCart: (artwork: Artwork) => void;
  onAddToWishlist: (artwork: Artwork) => void;
  externalSearchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export function Marketplace({ onAddToCart, onAddToWishlist, externalSearchQuery = '', onSearchQueryChange }: MarketplaceProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]); // Cache all artworks
  const [viewedArtworks, setViewedArtworks] = useState<Set<string>>(new Set());
  const [_loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const handleViewArtwork = (artwork: Artwork) => {
    if (!viewedArtworks.has(artwork.id)) {
      updateArtwork(artwork.id, { views: (artwork.views || 0) + 1 });
      setViewedArtworks(prev => new Set(prev).add(artwork.id));
    }
  };

  // Load all artworks — localStorage first (instant), then merge with Firestore
  useEffect(() => {
    async function loadAllArtworks() {
      setLoading(true);

      // ✅ STEP 1: Load from localStorage immediately for instant display
      const localArtworks = getArtworks().map((artwork: any) => ({
        ...artwork,
        image: artwork.imageUrl || artwork.image,
      }));

      if (localArtworks.length > 0) {
        console.log('✅ Loaded from localStorage:', localArtworks.length, 'artworks');
        setAllArtworks(localArtworks);
        setArtworks(localArtworks);
        setLoading(false);
        setInitialLoad(false);
      }

      // ✅ STEP 2: Try Firestore and merge (non-blocking)
      try {
        const dbArtworks = await fetchArtworks({ limit: 100 });
        const formattedDb = dbArtworks.map((artwork: any) => ({
          ...artwork,
          image: artwork.imageUrl || artwork.image,
        }));

        if (formattedDb.length > 0) {
          // Merge: DB artworks + local-only artworks (not yet synced)
          const dbIds = new Set(formattedDb.map((a: any) => a.id));
          const localOnly = localArtworks.filter((a: any) => !dbIds.has(a.id));
          const merged = [...formattedDb, ...localOnly];

          // Deduplicate
          const unique = Array.from(
            merged.reduce((map: any, artwork: any) => {
              map.set(artwork.id, artwork);
              return map;
            }, new Map()).values()
          ) as Artwork[];

          console.log('✅ Merged with Firestore:', unique.length, 'artworks');
          setAllArtworks(unique);
          setArtworks(unique);
        }
      } catch (error) {
        // Firestore unavailable — localStorage artworks already shown ✅
        console.warn('⚠️ Firestore unavailable, showing localStorage artworks');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    }

    if (initialLoad) {
      loadAllArtworks();
    }
  }, [initialLoad]);

  // Apply filters client-side from cached data
  useEffect(() => {
    if (!initialLoad && allArtworks.length > 0) {
      let filtered = [...allArtworks];

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(artwork =>
          artwork.title.toLowerCase().includes(query) ||
          artwork.artist.toLowerCase().includes(query) ||
          artwork.category.toLowerCase().includes(query) ||
          artwork.description?.toLowerCase().includes(query)
        );
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(artwork =>
          artwork.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      filtered = filtered.filter(artwork =>
        artwork.price >= priceRange[0] && artwork.price <= priceRange[1]
      );

      setArtworks(filtered);
    }
  }, [selectedCategory, priceRange, searchQuery, allArtworks, initialLoad]);

  // Sync with external search query
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // ✅ Listen for artwork updates — refresh from localStorage + Firestore merge
  useEffect(() => {
    const handler = () => {
      const localArtworks = getArtworks().map((artwork: any) => ({
        ...artwork,
        image: artwork.imageUrl || artwork.image,
      }));

      // Show local artworks immediately
      setAllArtworks(localArtworks);
      setArtworks(localArtworks);

      // Try to merge with Firestore in background
      fetchArtworks().then((dbArtworks) => {
        if (dbArtworks.length > 0) {
          const formattedDb = dbArtworks.map((artwork: any) => ({
            ...artwork,
            image: artwork.imageUrl || artwork.image,
          }));
          const dbIds = new Set(formattedDb.map((a: any) => a.id));
          const localOnly = localArtworks.filter((a: any) => !dbIds.has(a.id));
          const merged = [...formattedDb, ...localOnly];
          setAllArtworks(merged);
          setArtworks(merged);
        }
      }).catch(() => { /* Firestore optional */ });
    };
    window.addEventListener('artworks-updated', handler);
    return () => window.removeEventListener('artworks-updated', handler);
  }, []);

  const categories = ['All', 'Abstract', 'Portrait', 'Landscape', 'Modern', 'Minimalist'];
  const styles = ['Contemporary', 'Realism', 'Expressionism', 'Minimalist'];

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesCategory = selectedCategory === 'all' || artwork.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPrice = artwork.price >= priceRange[0] && artwork.price <= priceRange[1];
    const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  // Apply sorting
  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return (b.likes + b.views) - (a.likes + a.views);
      case 'newest':
        return b.year - a.year;
      case 'featured':
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  return (
    <div style={stylesObj.container}>
      <style>
        {`
          @media (max-width: 768px) {
            .marketplace-header {
              padding: 1rem !important;
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            
            .marketplace-title {
              font-size: 1.75rem !important;
            }
            
            .marketplace-subtitle {
              font-size: 0.875rem !important;
            }
            
            .marketplace-header-actions {
              width: 100% !important;
              flex-direction: column !important;
              gap: 0.75rem !important;
            }
            
            .marketplace-controls {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            
            .marketplace-content aside {
              position: fixed !important;
              top: 60px !important;
              left: 0 !important;
              width: 100% !important;
              height: calc(100vh - 60px) !important;
              z-index: 999 !important;
              overflow-y: auto !important;
              background: #1a1a2e !important;
              border-right: none !important;
              padding: 1rem !important;
            }
            
            .marketplace-content {
              display: block !important;
            }
            
            .marketplace-main {
              width: 100% !important;
              padding: 1rem !important;
            }
            
            .marketplace-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            
            .marketplace-search {
              width: 100% !important;
            }
            
            .marketplace-results-header {
              flex-direction: column !important;
              gap: 0.5rem !important;
              align-items: flex-start !important;
            }
            
            .marketplace-sort {
              width: 100% !important;
            }
            
            .marketplace-view-toggle {
              display: none !important;
            }
            
            .marketplace-filter-toggle {
              width: 100% !important;
              justify-content: center !important;
            }
            
            .marketplace-overlay {
              display: block !important;
            }
            
            .marketplace-close-btn {
              display: block !important;
            }
          }
          
          select option:hover {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3)) !important;
            color: #667eea !important;
          }
        `}
      </style>
      <div style={stylesObj.header} className="marketplace-header">
        <div>
          <h1 style={stylesObj.title} className="marketplace-title">Art Marketplace</h1>
          <p style={stylesObj.subtitle} className="marketplace-subtitle">Discover {artworks.length}+ curated artworks</p>
        </div>

        <div style={stylesObj.headerActions} className="marketplace-header-actions">
          <div style={stylesObj.searchBar} className="marketplace-search">
            <Search size={20} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
            <input
              type="text"
              placeholder="Search artworks or artists..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearchQueryChange) {
                  onSearchQueryChange(e.target.value);
                }
              }}
              style={stylesObj.searchInput}
            />
          </div>

          <div style={stylesObj.viewToggle} className="marketplace-view-toggle">
            <motion.button
              style={{
                ...stylesObj.viewButton,
                ...(viewMode === 'grid' ? stylesObj.viewButtonActive : {}),
              }}
              whileTap={{ scale: 0.95 }}
              onTap={() => setViewMode('grid')}
            >
              <Grid size={20} />
            </motion.button>
            <motion.button
              style={{
                ...stylesObj.viewButton,
                ...(viewMode === 'list' ? stylesObj.viewButtonActive : {}),
              }}
              whileTap={{ scale: 0.95 }}
              onTap={() => setViewMode('list')}
            >
              <List size={20} />
            </motion.button>
          </div>

          <div className="marketplace-filter-toggle">
            <motion.button
              style={stylesObj.filterToggle}
              whileTap={{ scale: 0.95 }}
              onTap={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} />
              Filters
            </motion.button>
          </div>
        </div>
      </div>

      <div style={stylesObj.content} className="marketplace-content">
        {/* Filters Sidebar */}
        {showFilters && (
          <>
            {/* Mobile overlay */}
            <div
              style={{
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 998,
              }}
              className="marketplace-overlay"
              onClick={() => setShowFilters(false)}
            />
            <motion.aside
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              style={stylesObj.sidebar}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 }}>Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    padding: '0.25rem',
                    display: 'none',
                  }}
                  className="marketplace-close-btn"
                >
                  ×
                </button>
              </div>
              <div style={stylesObj.filterSection}>
                <h3 style={stylesObj.filterTitle}>Categories</h3>
                <div style={stylesObj.filterOptions}>
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      style={{
                        ...stylesObj.categoryButton,
                        ...(selectedCategory === category.toLowerCase() ? stylesObj.categoryButtonActive : {}),
                      }}
                      whileHover={{ x: 5 }}
                      onTap={() => setSelectedCategory(category.toLowerCase())}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div style={stylesObj.filterSection}>
                <h3 style={stylesObj.filterTitle}>Price Range</h3>
                <div style={stylesObj.priceRange}>
                  <span style={stylesObj.priceLabel}>PKR {priceRange[0].toLocaleString()}</span>
                  <span style={stylesObj.priceLabel}>PKR {priceRange[1].toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  style={stylesObj.slider}
                />
              </div>

              <div style={stylesObj.filterSection}>
                <h3 style={stylesObj.filterTitle}>Style</h3>
                <div style={stylesObj.filterOptions}>
                  {styles.map((style) => (
                    <label key={style} style={stylesObj.checkboxLabel}>
                      <input type="checkbox" style={stylesObj.checkbox} />
                      <span>{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}

        {/* Artworks Grid/List */}
        <div style={stylesObj.main} className="marketplace-main">
          <div style={stylesObj.resultsHeader} className="marketplace-results-header">
            <p style={stylesObj.resultsText}>
              Showing {filteredArtworks.length} artworks
            </p>
            <select
              style={stylesObj.sortSelect}
              className="marketplace-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option style={stylesObj.sortOption} value="featured">Sort by: Featured</option>
              <option style={stylesObj.sortOption} value="price-low">Price: Low to High</option>
              <option style={stylesObj.sortOption} value="price-high">Price: High to Low</option>
              <option style={stylesObj.sortOption} value="popular">Most Popular</option>
              <option style={stylesObj.sortOption} value="newest">Newest</option>
            </select>
          </div>

          <div
            style={
              viewMode === 'grid'
                ? stylesObj.artworkGrid
                : stylesObj.artworkList
            }
            className={viewMode === 'grid' ? 'marketplace-grid' : ''}
          >
            {filteredArtworks.length === 0 ? (
              <div style={stylesObj.noResults}>
                <p style={stylesObj.noResultsText}>No artworks match your search</p>
                <p style={stylesObj.noResultsSubtext}>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              sortedArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={
                    viewMode === 'grid'
                      ? stylesObj.artworkCard
                      : stylesObj.artworkListItem
                  }
                  whileHover={{ y: -5, boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)' }}
                >
                  <div
                    style={
                      viewMode === 'grid'
                        ? stylesObj.artworkImageContainer
                        : stylesObj.artworkListImageContainer
                    }
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      style={stylesObj.artworkImage}
                    />
                    <div style={stylesObj.artworkOverlay}>
                      <motion.button
                        style={stylesObj.iconButton}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onTap={() => onAddToWishlist(artwork)}
                      >
                        <Heart size={20} />
                      </motion.button>
                      <motion.button
                        style={stylesObj.iconButton}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onTap={() => handleViewArtwork(artwork)}
                      >
                        <Eye size={20} />
                      </motion.button>
                    </div>
                  </div>

                  <div style={stylesObj.artworkInfo}>
                    <div style={stylesObj.artworkMeta}>
                      <span style={stylesObj.categoryBadge}>{artwork.category}</span>
                      {artwork.featured && (
                        <span style={stylesObj.featuredBadge}>Featured</span>
                      )}
                    </div>
                    <h3 style={stylesObj.artworkTitle}>{artwork.title}</h3>
                    <p style={stylesObj.artworkArtist}>{artwork.artist}</p>
                    <p style={stylesObj.artworkDescription}>{artwork.description}</p>

                    <div style={stylesObj.artworkDetails}>
                      <div style={stylesObj.artworkDimensions}>
                        {artwork.dimensions.width} × {artwork.dimensions.height} {artwork.dimensions.unit}
                      </div>
                      <div style={stylesObj.artworkStats}>
                        <span><Heart size={14} /> {artwork.likes}</span>
                        <span><Eye size={14} /> {artwork.views}</span>
                      </div>
                    </div>

                    <div style={stylesObj.artworkFooter}>
                      <span style={stylesObj.artworkPrice}>
                        PKR {artwork.price.toLocaleString()}
                      </span>
                      <motion.button
                        style={stylesObj.addToCartButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onTap={() => {
                          onAddToCart(artwork);
                          alert(`Added "${artwork.title}" to cart!`);
                        }}
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )))}
          </div>

          {/* Load More */}
          <motion.div
            style={stylesObj.loadMore}
            whileHover={{ scale: 1.02 }}
          >
            <button style={stylesObj.loadMoreButton}>Load More Artworks</button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const stylesObj: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    paddingTop: '80px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  header: {
    padding: '2rem 1.5rem',
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  headerActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '9999px',
    padding: '0.75rem 1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: '300px',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
  },
  viewToggle: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '0.25rem',
    borderRadius: '0.5rem',
  },
  viewButton: {
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  viewButtonActive: {
    background: 'rgba(212, 175, 55, 0.2)',
    color: '#d4af37',
  },
  filterToggle: {
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
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 1.5rem 2rem',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  filterSection: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '1.5rem',
  },
  filterTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '1rem',
  },
  filterOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  categoryButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.95)',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s ease',
  },
  categoryButtonActive: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
    color: '#667eea',
    border: '1px solid rgba(102, 126, 234, 0.5)',
  },
  priceRange: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  priceLabel: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.15)',
    outline: 'none',
    cursor: 'pointer',
    accentColor: '#667eea',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.95)',
    cursor: 'pointer',
    transition: 'color 0.3s ease',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#667eea',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  sortSelect: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    outline: 'none',
  },
  sortOption: {
    background: '#1a1a2e',
    color: 'rgba(255, 255, 255, 0.9)',
    padding: '0.5rem',
  },
  artworkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  },
  artworkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
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
  artworkListItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '2rem',
  },
  artworkImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    overflow: 'hidden',
  },
  artworkListImageContainer: {
    position: 'relative',
    width: '300px',
    height: '100%',
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
    top: '1rem',
    right: '1rem',
    display: 'flex',
    gap: '0.5rem',
  },
  iconButton: {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  artworkInfo: {
    padding: '1.5rem',
  },
  artworkMeta: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  categoryBadge: {
    background: 'rgba(212, 175, 55, 0.2)',
    color: '#d4af37',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  featuredBadge: {
    background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
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
    marginBottom: '0.75rem',
  },
  artworkDescription: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '1rem',
    lineHeight: 1.6,
  },
  artworkDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  artworkDimensions: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  artworkStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  artworkFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artworkPrice: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#d4af37',
  },
  addToCartButton: {
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
  },
  loadMore: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  loadMoreButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    padding: '1rem 3rem',
    borderRadius: '9999px',
    fontSize: '1rem',
    fontWeight: 600,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  noResultsText: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '0.5rem',
  },
  noResultsSubtext: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
};
