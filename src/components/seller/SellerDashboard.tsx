import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, ShoppingBag, Upload, BarChart3, Eye, Users, Trash2, Edit } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { addArtwork, clearDemoData, getArtworks, updateArtwork, deleteArtwork, getArtworksByArtist } from '../../utils/artworksStore';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Artwork } from '../../types';
import { createArtwork, updateArtworkInDB, deleteArtwork as deleteArtworkFromDB, fetchArtworks } from '../../services/artworkService';
import { auth } from '../../firebase';
import { fetchAllOrders, Order } from '../../services/orderService';

interface SellerDashboardProps {
  onOpenAuth?: (mode: 'seller-login' | 'seller-signup') => void;
  onLogout?: () => void;
}

export function SellerDashboard({ onOpenAuth, onLogout }: SellerDashboardProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', price: '', imageFile: null as File | null, category: '', medium: '', description: '', quantity: '' });
  const [uploading, setUploading] = useState(false);
  const [sellerArtworks, setSellerArtworks] = useState<Artwork[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGalleryPreview, setShowGalleryPreview] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const skipNextReloadRef = useRef(false);

  // NOTE: Do NOT clear localStorage on mount — artworks are stored there as fallback
  // when Firestore is unavailable

  useEffect(() => {
    const loadSellerData = async () => {
      // Skip reload if we just deleted something locally
      if (skipNextReloadRef.current) {
        console.log('🚫 Skipping reload - skipNextReload flag is true');
        skipNextReloadRef.current = false;
        return;
      }

      console.log('🔄 Loading seller data...');

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const artistId = currentUser?.uid;

      if (!artistId) {
        setSellerArtworks([]);
        return;
      }

      // ✅ STEP 1: Load from localStorage immediately (instant display, works offline)
      const localArtworks = getArtworks();
      const localSellerArtworks = localArtworks.filter(art =>
        art.sellerId === artistId || art.artistId === artistId
      ).map(art => ({
        ...art,
        image: art.imageUrl || art.image,
        sellerId: art.sellerId || art.artistId || artistId,
      }));

      if (localSellerArtworks.length > 0) {
        console.log('✅ Loaded from localStorage:', localSellerArtworks.length, 'artworks');
        setSellerArtworks(localSellerArtworks);
        setActiveListings(localSellerArtworks.length);
        setTotalSales(localSellerArtworks.length);
        setTotalRevenue(localSellerArtworks.reduce((sum, art) => sum + (art.price || 0), 0));
      }

      // ✅ STEP 2: Try to sync from Firestore (updates display if available)
      try {
        const allArtworks = await fetchArtworks({ limit: 100 });
        const dbSellerArtworks = allArtworks.filter(art =>
          art.sellerId === artistId || art.artistId === artistId
        ).map(art => ({
          ...art,
          image: art.imageUrl || art.image,
          sellerId: art.sellerId || art.artistId || artistId,
        }));

        if (dbSellerArtworks.length > 0) {
          console.log('✅ Synced from Firestore:', dbSellerArtworks.length, 'artworks');
          // Merge: DB artworks take priority, but keep local-only ones too
          const dbIds = new Set(dbSellerArtworks.map(a => a.id));
          const localOnly = localSellerArtworks.filter(a => !dbIds.has(a.id));
          const merged = [...dbSellerArtworks, ...localOnly];
          setSellerArtworks(merged);
          setActiveListings(merged.length);
          setTotalSales(merged.length);
          setTotalRevenue(merged.reduce((sum, art) => sum + (art.price || 0), 0));
        } else if (localSellerArtworks.length === 0) {
          // No artworks anywhere
          setSellerArtworks([]);
          setActiveListings(0);
          setTotalSales(0);
          setTotalRevenue(0);
        }
      } catch (error) {
        // Firestore unavailable — localStorage data already shown above ✅
        console.warn('⚠️ Firestore unavailable, showing localStorage artworks:', error);
      }
    };

    loadSellerData();
    window.addEventListener('artworks-updated', loadSellerData);
    return () => window.removeEventListener('artworks-updated', loadSellerData);
  }, []);

  const openUpload = () => setShowUpload(true);
  const closeUpload = () => setShowUpload(false);

  const handleViewAnalytics = () => {
    setShowAnalytics(true);
  };

  const handlePreviewGallery = () => {
    setShowGalleryPreview(true);
  };

  const handleManageOrders = async () => {
    setShowOrders(true);
    setLoadingOrders(true);
    try {
      // Fetch ALL orders (not just buyer's orders)
      const allOrders = await fetchAllOrders();

      // Filter orders that contain seller's artworks
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const sellerId = currentUser?.uid;

      const sellerOrders = allOrders.filter(order =>
        order.items.some((item: any) => {
          // Check if any item in the order belongs to this seller
          const artwork = sellerArtworks.find(a => a.id === item.artworkId);
          return artwork !== undefined;
        })
      );

      console.log('📦 Total orders:', allOrders.length);
      console.log('🎨 Seller artworks:', sellerArtworks.length);
      console.log('✅ Orders with seller artworks:', sellerOrders.length);

      setOrders(sellerOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setForm({
      title: artwork.title,
      price: artwork.price.toString(),
      imageFile: null,
      category: artwork.category,
      medium: artwork.medium,
      description: artwork.description || '',
      quantity: '1'
    });
    setShowEdit(true);
  };

  const handleUpdateSubmit = async () => {
    if (!editingArtwork) return;

    try {
      setUploading(true);
      let imageUrl = editingArtwork.image;

      // Convert new image to base64 if selected
      if (form.imageFile) {
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(form.imageFile!);
        });
      }

      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        alert('Please login again to update artwork');
        setUploading(false);
        return;
      }

      const updatedData: Partial<Artwork> = {
        title: form.title || editingArtwork.title,
        artist: editingArtwork.artist,
        artistId: editingArtwork.artistId || currentUserId,
        sellerId: editingArtwork.sellerId || currentUserId, // Always set sellerId
        price: Number(form.price) || editingArtwork.price,
        image: imageUrl,
        imageUrl: imageUrl, // For database compatibility
        category: form.category || editingArtwork.category,
        medium: form.medium || editingArtwork.medium,
        description: form.description || editingArtwork.description,
        style: editingArtwork.style || 'Contemporary',
        dimensions: editingArtwork.dimensions || { width: 100, height: 80, unit: 'cm' },
        year: editingArtwork.year || new Date().getFullYear(),
        featured: editingArtwork.featured || false,
        trending: editingArtwork.trending || false,
        likes: editingArtwork.likes || 0,
        views: editingArtwork.views || 0,
      };

      console.log('🔄 Updating artwork with data:', updatedData);
      console.log('📝 Current user:', currentUserId);
      console.log('📝 Artwork sellerId (before):', editingArtwork.sellerId);
      console.log('📝 Artwork sellerId (after):', updatedData.sellerId);

      // Update locally first
      updateArtwork(editingArtwork.id, updatedData);

      // Update in database
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          const result = await updateArtworkInDB(editingArtwork.id, updatedData, token);

          if (result.success) {
            console.log('✅ Artwork updated in database');
            // Trigger event to refresh artworks in other components
            window.dispatchEvent(new Event('artworks-updated'));
            alert('Artwork updated successfully');
          } else {
            console.warn('⚠️ Artwork updated locally but not in database:', result.error);
            alert('Artwork updated locally (database update failed)');
          }
        }
      } catch (dbError) {
        console.error('Failed to update in database:', dbError);
        alert('Artwork updated locally (database update failed)');
      }
      setForm({ title: '', price: '', imageFile: null, category: '', medium: '', description: '', quantity: '' });
      setShowEdit(false);
      setEditingArtwork(null);
    } catch (err: any) {
      alert(`Failed to update artwork: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteArtwork = async (artworkId: string, artworkTitle: string) => {
    if (confirm(`Are you sure you want to delete "${artworkTitle}"? This action cannot be undone.`)) {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert('❌ Please login again to delete artwork');
          return;
        }

        const token = await user.getIdToken(true); // Force refresh token
        const result = await deleteArtworkFromDB(artworkId, token);

        if (result.success) {
          console.log('✅ Artwork deleted from database, updating UI...');
          // Set flag to skip next reload from event BEFORE any operations
          console.log('🚩 Setting skipNextReload flag to TRUE');
          skipNextReloadRef.current = true;
          // Delete from local storage (this will trigger event immediately)
          deleteArtwork(artworkId);
          // Update UI immediately - this prevents re-fetch from showing deleted item
          setSellerArtworks(prev => {
            const updated = prev.filter(art => art.id !== artworkId);
            console.log(`📊 Updated artworks count: ${prev.length} → ${updated.length}`);
            setActiveListings(updated.length);
            setTotalSales(updated.length);
            const revenue = updated.reduce((sum, art) => sum + (art.price || 0), 0);
            setTotalRevenue(revenue);
            return updated;
          });
          // No need to dispatch event - deleteArtwork() already does it!
          // The skipNextReload flag will prevent that reload
          alert('✅ Artwork deleted successfully');
        } else {
          alert(`❌ Failed to delete artwork: ${result.error}`);
        }
      } catch (dbError: any) {
        console.error('Failed to delete from database:', dbError);

        if (dbError.message?.includes('permission') || dbError.message?.includes('Missing or insufficient')) {
          alert('❌ Permission denied: This artwork cannot be deleted because it lacks proper ownership information. Please contact admin.');
        } else {
          alert(`❌ Failed to delete artwork: ${dbError.message}`);
        }
      }
    }
  };

  const closeEdit = () => {
    setShowEdit(false);
    setEditingArtwork(null);
    setForm({ title: '', price: '', imageFile: null, category: '', medium: '', description: '', quantity: '' });
  };

  const handleUploadSubmit = async () => {
    // ✅ VALIDATION: Check required fields
    if (!form.title || !form.price || !form.category || !form.medium) {
      alert('❌ Please fill in all required fields:\n\n• Title\n• Price\n• Category\n• Medium');
      return;
    }

    if (Number(form.price) <= 0) {
      alert('❌ Price must be greater than 0');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = '';

      // Upload image to Cloudinary
      if (form.imageFile) {
        try {
          imageUrl = await uploadToCloudinary(form.imageFile);
          console.log('✅ Image uploaded to Cloudinary:', imageUrl);
        } catch (error) {
          console.error('❌ Cloudinary upload failed:', error);
          alert('Image upload failed. Please try again.');
          setUploading(false);
          return;
        }
      } else {
        alert('❌ Please select an image to upload');
        setUploading(false);
        return;
      }

      const id = Date.now().toString();
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const artist = currentUser?.name || 'Unknown Seller';
      const artistId = currentUser?.uid || 'seller-guest';

      const artwork: Artwork = {
        id,
        title: form.title,
        artist,
        artistId,
        sellerId: artistId,
        price: Number(form.price),
        image: imageUrl,
        imageUrl: imageUrl,
        category: form.category,
        style: 'Contemporary',
        medium: form.medium,
        dimensions: { width: 100, height: 80, unit: 'cm' },
        year: new Date().getFullYear(),
        description: form.description || 'No description provided',
        featured: false,
        trending: false,
        likes: 0,
        views: 0,
      };

      console.log('📝 Creating artwork with sellerId:', artistId);

      // ✅ STEP 1: Always save locally first (image is on Cloudinary — guaranteed success)
      addArtwork(artwork);

      // ✅ STEP 2: Try to sync to Firestore in background (non-blocking)
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        let user = auth.currentUser;
        if (!user) {
          user = await new Promise<any>((resolve) => {
            const timer = setTimeout(() => { unsubscribe(); resolve(null); }, 3000);
            const unsubscribe = onAuthStateChanged(auth, (u) => {
              clearTimeout(timer);
              unsubscribe();
              resolve(u);
            });
          });
        }

        if (user) {
          const token = await user.getIdToken();
          const result = await createArtwork(artwork, token);
          if (result.success && result.artwork) {
            console.log('✅ Artwork synced to Firestore with id:', result.artwork.id);
            // Replace temp local entry with real DB id
            deleteArtwork(artwork.id);
            addArtwork({ ...artwork, id: result.artwork.id, imageUrl: result.artwork.imageUrl || imageUrl });
          } else {
            console.warn('⚠️ Firestore sync failed (artwork saved locally):', result.error);
          }
        } else {
          console.warn('⚠️ Not logged into Firebase — artwork saved locally only');
        }
      } catch (dbErr: any) {
        // Non-fatal — image is safe on Cloudinary, artwork saved in localStorage
        console.warn('⚠️ Firestore error (artwork saved locally):', dbErr.message);
      }

      // ✅ Always show success
      window.dispatchEvent(new Event('artworks-updated'));
      alert('✅ Artwork uploaded successfully!');
      setForm({ title: '', price: '', imageFile: null, category: '', medium: '', description: '', quantity: '' });
      closeUpload();
    } catch (err: any) {
      alert(`Failed to upload artwork: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @media (max-width: 768px) {
            .seller-header {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            
            .seller-stats-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            
            .seller-artworks-grid {
              grid-template-columns: 1fr !important;
            }
            
            .seller-title {
              font-size: 1.75rem !important;
            }
            
            .seller-modal {
              width: 95% !important;
              max-height: 90vh !important;
              overflow-y: auto !important;
            }
            
            /* Upload Modal Mobile Styles */
            .upload-modal {
              width: 95vw !important;
              padding: 1.5rem !important;
              max-height: 90vh !important;
            }
            
            .upload-modal h2 {
              font-size: 1.5rem !important;
            }
            
            .upload-modal input,
            .upload-modal textarea {
              font-size: 16px !important; /* Prevents zoom on iOS */
            }
            
            .modal-actions-mobile {
              flex-direction: column !important;
            }
            
            .modal-actions-mobile button {
              width: 100% !important;
              flex: none !important;
            }
            
            /* Artwork Card Mobile Styles */
            .artwork-card-mobile {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 1rem !important;
            }
            
            .artwork-card-mobile img {
              width: 100% !important;
              height: 200px !important;
              object-fit: cover !important;
            }
            
            .artwork-info-mobile {
              text-align: left !important;
            }
            
            .artwork-info-mobile h4 {
              font-size: 1.125rem !important;
            }
            
            .artwork-actions-mobile {
              width: 100% !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-between !important;
            }
            
            .artwork-actions-mobile .price {
              font-size: 1.125rem !important;
              margin-bottom: 0 !important;
            }
            
            .artwork-buttons-mobile {
              display: flex !important;
              gap: 0.5rem !important;
            }
            
            .artwork-buttons-mobile button {
              padding: 0.5rem 0.75rem !important;
              font-size: 0.75rem !important;
              min-width: 60px !important;
            }
            
            /* Analytics and Other Modals Mobile Styles */
            .analytics-modal-content,
            .gallery-modal-content,
            .orders-modal-content {
              width: 95vw !important;
              max-width: 95vw !important;
              padding: 1.5rem !important;
              max-height: 90vh !important;
              overflow-y: auto !important;
            }
            
            .analytics-modal-content h2,
            .gallery-modal-content h2,
            .orders-modal-content h2 {
              font-size: 1.5rem !important;
              margin-bottom: 1rem !important;
            }
            
            .analytics-grid-mobile {
              grid-template-columns: 1fr !important;
              gap: 0.75rem !important;
            }
            
            .gallery-grid-mobile {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.75rem !important;
            }
          }
        `}
      </style>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="seller-title">Seller Dashboard</h1>
          <p style={styles.subtitle}>Manage your art business</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {onLogout && (
            <motion.button
              style={styles.loginButton}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
            >
              Logout
            </motion.button>
          )}
          <motion.button
            style={styles.uploadButton}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(245, 87, 108, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={openUpload}
          >
            <Upload size={20} />
            Upload New Artwork
          </motion.button>
        </div>
      </div>

      {showUpload && (
        <div style={styles.modalOverlay} onClick={closeUpload}>
          <div style={styles.modal} className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Upload New Artwork</h2>
            <p style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(0,0,0,0.6)' }}>Provide details for the new artwork to appear immediately in the marketplace.</p>
            <form onSubmit={(e) => { e.preventDefault(); handleUploadSubmit(); }} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Title</label>
                <input style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ethereal Dreams" />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Price (PKR)</label>
                <input style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 45000" />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Description</label>
                <textarea style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8', minHeight: 60 }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your artwork, inspiration, etc." />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Quantity</label>
                <input type="number" min={1} style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 1" />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 600, marginBottom: 8 }}>Artwork Image</label>
                <label htmlFor="artwork-image-upload" style={{
                  display: 'inline-block',
                  background: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #bbb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1.2rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  marginBottom: 6,
                  width: 'fit-content',
                }}>
                  {form.imageFile ? 'Change Image' : 'Choose Image'}
                  <input
                    id="artwork-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                  />
                </label>
                {form.imageFile && (
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 13, color: '#444' }}>{form.imageFile.name}</span>
                    <img src={URL.createObjectURL(form.imageFile)} alt="Preview" style={{ marginTop: 8, maxWidth: '100%', maxHeight: 180, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  </div>
                )}
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Category</label>
                <input style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Abstract, Landscape, Portrait" />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Medium</label>
                <input style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} placeholder="e.g. Oil, Acrylic, Digital" />
              </div>
              <div style={styles.modalActions} className="modal-actions-mobile">
                <button
                  type="button"
                  onClick={closeUpload}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    background: '#f5f5f5',
                    color: '#333',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    flex: '1',
                    minWidth: '120px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    background: '#1a73e8',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    opacity: uploading ? 0.6 : 1,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    flex: '1',
                    minWidth: '120px'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editingArtwork && (
        <div style={styles.modalOverlay} onClick={closeEdit}>
          <div style={styles.modal} className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Edit Artwork</h2>
            <p style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(0,0,0,0.6)' }}>Update your artwork details</p>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateSubmit(); }} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Title</label>
                <input style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ethereal Dreams" />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Price (PKR)</label>
                <input style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 45000" />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Description</label>
                <textarea style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8', minHeight: 60 }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your artwork" />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 600, marginBottom: 8 }}>Change Image (Optional)</label>
                <label htmlFor="edit-artwork-image" style={{
                  display: 'inline-block',
                  background: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #bbb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1.2rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  marginBottom: 6,
                  width: 'fit-content',
                }}>
                  {form.imageFile ? 'Change Image' : 'Upload New Image'}
                  <input
                    id="edit-artwork-image"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                  />
                </label>
                {form.imageFile ? (
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 13, color: '#444' }}>{form.imageFile.name}</span>
                    <img src={URL.createObjectURL(form.imageFile)} alt="Preview" style={{ marginTop: 8, maxWidth: '100%', maxHeight: 180, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  </div>
                ) : (
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>Current image:</span>
                    <img src={editingArtwork.image} alt="Current" style={{ marginTop: 8, maxWidth: '100%', maxHeight: 180, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  </div>
                )}
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Category</label>
                <input style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Abstract, Landscape" />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontWeight: 700, color: '#1a73e8', marginBottom: 4 }}>Medium</label>
                <input style={{ ...styles.input, background: '#f7faff', border: '1.5px solid #1a73e8' }} value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })} placeholder="e.g. Oil, Acrylic" />
              </div>
              <div style={styles.modalActions} className="modal-actions-mobile">
                <button
                  type="button"
                  onClick={closeEdit}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #ddd',
                    background: '#f5f5f5',
                    color: '#333',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    flex: '1',
                    minWidth: '120px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    background: '#1a73e8',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    opacity: uploading ? 0.6 : 1,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    flex: '1',
                    minWidth: '120px'
                  }}
                >
                  {uploading ? 'Updating...' : 'Update Artwork'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {[
          {
            title: 'Total Revenue',
            value: totalRevenue >= 1000000
              ? `PKR ${(totalRevenue / 1000000).toFixed(2)}M`
              : totalRevenue >= 1000
                ? `PKR ${(totalRevenue / 1000).toFixed(1)}K`
                : `PKR ${totalRevenue}`,
            change: `${activeListings} artworks`,
            icon: DollarSign,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
          {
            title: 'Total Artworks',
            value: totalSales.toString(),
            change: 'uploaded',
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          },
          {
            title: 'Active Listings',
            value: activeListings.toString(),
            change: 'live now',
            icon: Package,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          },
          {
            title: 'Total Views',
            value: sellerArtworks.reduce((sum, art) => sum + (art.views || 0), 0).toString(),
            change: 'impressions',
            icon: Eye,
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              ...styles.statCard,
              background: stat.gradient,
            }}
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
          >
            <div style={styles.statIcon}>
              <stat.icon size={28} />
            </div>
            <div style={styles.statContent}>
              <p style={styles.statTitle}>{stat.title}</p>
              <h3 style={styles.statValue}>{stat.value}</h3>
              <p style={styles.statChange}>{stat.change} this month</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Analytics */}
      <div style={styles.chartsSection} className="seller-charts-section">
        {/* Your Artworks List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={styles.chartCard}
        >
          <div style={styles.chartHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <h3 style={styles.chartTitle}>Your Artworks</h3>
                <p style={styles.chartSubtitle}>All uploaded artworks ({sellerArtworks.length})</p>
              </div>
              <Package size={24} style={{ color: '#d4af37' }} />
            </div>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sellerArtworks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No artworks uploaded yet</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Click "Upload New Artwork" to get started</p>
              </div>
            ) : (
              sellerArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="artwork-card-mobile"
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.75rem',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={artwork.image || ''}
                    alt={artwork.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback-icon';
                        fallback.style.cssText = 'width: 80px; height: 80px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem;';
                        fallback.textContent = '🎨';
                        parent.appendChild(fallback);
                      }
                    }}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '0.5rem',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                  <div className="artwork-info-mobile" style={{ flex: 1 }}>
                    <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.25rem' }}>{artwork.title}</h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {artwork.category} • {artwork.medium}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                      <span>👁️ {artwork.views || 0} views</span>
                      <span>❤️ {artwork.likes || 0} likes</span>
                    </div>
                  </div>
                  <div className="artwork-actions-mobile" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <p className="price" style={{ color: '#d4af37', fontSize: '1.25rem', fontWeight: 700 }}>
                      PKR {artwork.price.toLocaleString()}
                    </p>
                    <div className="artwork-buttons-mobile" style={{ display: 'flex', gap: '0.5rem' }}>
                      <motion.button
                        onClick={() => handleEditArtwork(artwork)}
                        style={{
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                        style={{
                          background: 'linear-gradient(135deg, #e94560 0%, #ff7a7a 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={styles.quickActions}
        >
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={styles.actionsList}>
            {[
              { icon: Upload, label: 'Upload Artwork', color: '#667eea', onClick: openUpload },
              { icon: BarChart3, label: 'View Analytics', color: '#f093fb', onClick: handleViewAnalytics },
              { icon: Eye, label: 'Preview Gallery', color: '#4facfe', onClick: handlePreviewGallery },
              { icon: Users, label: 'Manage Orders', color: '#43e97b', onClick: handleManageOrders },
            ].map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.actionButton}
                whileHover={{
                  x: 10,
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
              >
                <div
                  style={{
                    ...styles.actionIcon,
                    background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)`,
                  }}
                >
                  <action.icon size={20} />
                </div>
                <span style={styles.actionLabel}>{action.label}</span>
              </motion.button>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...styles.actionButton, flex: 1 }} onClick={openUpload}>
                <div style={{ ...styles.actionIcon, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}><Upload size={18} /></div>
                <span style={styles.actionLabel}>Upload Artwork</span>
              </button>
              <button style={{ ...styles.actionButton, background: 'rgba(233,69,96,0.12)', border: '1px solid rgba(233,69,96,0.2)' }} onClick={() => { if (confirm('Clear demo artworks?')) { clearDemoData(); alert('Demo data cleared'); } }}>
                <div style={{ ...styles.actionIcon, background: 'linear-gradient(135deg, #e94560, #ff7a7a)' }}><Trash2 size={18} /></div>
                <span style={styles.actionLabel}>Clear Demo Data</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.recentSales}
      >
        <h3 style={styles.sectionTitle}>Analytics Summary</h3>
        <div style={styles.salesTable}>
          {sellerArtworks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              <BarChart3 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No analytics data available</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Upload artworks to see analytics</p>
            </div>
          ) : (
            sellerArtworks.slice(0, 5).map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.saleRow}
                whileHover={{ x: 5, background: 'rgba(255, 255, 255, 0.08)' }}
              >
                <div style={styles.saleInfo}>
                  <p style={styles.saleArtwork}>{artwork.title}</p>
                  <p style={styles.saleBuyer}>{artwork.category} • {artwork.year}</p>
                </div>
                <div style={styles.saleDetails}>
                  <p style={styles.saleAmount}>PKR {artwork.price.toLocaleString()}</p>
                  <p style={styles.saleDate}>👁️ {artwork.views || 0} views • ❤️ {artwork.likes || 0} likes</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div style={styles.quickActionModal} onClick={() => setShowAnalytics(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="analytics-modal-content"
            style={styles.quickActionModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#f093fb', marginBottom: '1.5rem', fontSize: '1.8rem' }}>📊 Analytics Dashboard</h2>
            <div className="analytics-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(102, 126, 234, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#667eea', marginBottom: '0.5rem' }}>👁️</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{sellerArtworks.reduce((sum, art) => sum + (art.views || 0), 0)}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Total Views</div>
              </div>
              <div style={{ background: 'rgba(240, 147, 251, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#f093fb', marginBottom: '0.5rem' }}>❤️</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{sellerArtworks.reduce((sum, art) => sum + (art.likes || 0), 0)}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Total Likes</div>
              </div>
              <div style={{ background: 'rgba(79, 172, 254, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#4facfe', marginBottom: '0.5rem' }}>🎨</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{sellerArtworks.length}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Artworks</div>
              </div>
            </div>
            <button onClick={() => setShowAnalytics(false)} style={{ ...styles.uploadButton, width: '100%', marginTop: '1rem' }}>Close</button>
          </motion.div>
        </div>
      )}

      {/* Gallery Preview Modal */}
      {showGalleryPreview && (
        <div style={styles.quickActionModal} onClick={() => setShowGalleryPreview(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="gallery-modal-content"
            style={{ ...styles.quickActionModalContent, maxWidth: '900px', maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#4facfe', marginBottom: '1.5rem', fontSize: '1.8rem' }}>🖼️ Gallery Preview</h2>
            <div className="gallery-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {sellerArtworks.map((artwork) => (
                <div key={artwork.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={artwork.image} alt={artwork.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.25rem' }}>{artwork.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>PKR {artwork.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            {sellerArtworks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                <Eye size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No artworks to preview</p>
              </div>
            )}
            <button onClick={() => setShowGalleryPreview(false)} style={{ ...styles.uploadButton, width: '100%', marginTop: '1rem' }}>Close</button>
          </motion.div>
        </div>
      )}

      {/* Manage Orders Modal */}
      {showOrders && (
        <div style={styles.quickActionModal} onClick={() => setShowOrders(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="orders-modal-content"
            style={styles.quickActionModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#43e97b', marginBottom: '1.5rem', fontSize: '1.8rem' }}>📦 Manage Orders</h2>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No orders yet</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Orders will appear here when customers purchase your artworks</p>
              </div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '1rem' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{
                    background: 'rgba(67, 233, 123, 0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(67, 233, 123, 0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ color: '#43e97b', marginBottom: '0.5rem' }}>Order #{order.id.slice(-8)}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                          Buyer: {order.buyerEmail || order.buyerId}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#43e97b', fontSize: '1.2rem', fontWeight: 'bold' }}>
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          background: order.paymentStatus === 'completed' ? 'rgba(67, 233, 123, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                          color: order.paymentStatus === 'completed' ? '#43e97b' : '#ffc107'
                        }}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                      <h4 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Items:</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          gap: '1rem',
                          marginBottom: '0.75rem',
                          alignItems: 'center'
                        }}>
                          {item.artworkImage && (
                            <img
                              src={item.artworkImage}
                              alt={item.artworkTitle}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{item.artworkTitle}</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowOrders(false)} style={{ ...styles.uploadButton, width: '100%', marginTop: '1rem' }}>Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    paddingTop: '80px',
    background: 'linear-gradient(135deg, #2d1b69 0%, #5a3d8a 100%)',
    padding: '80px 1.5rem 2rem',
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  uploadButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '9999px',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)',
  },
  loginButton: {
    background: 'transparent',
    color: '#d4af37',
    border: '2px solid rgba(212, 175, 55, 0.15)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  statsGrid: {
    maxWidth: '1400px',
    margin: '0 auto 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    padding: '2rem',
    borderRadius: '1rem',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
  },
  statIcon: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statChange: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 500,
  },
  chartsSection: {
    maxWidth: '1400px',
    margin: '0 auto 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  chartCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  chartTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.25rem',
  },
  chartSubtitle: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '1rem',
    height: '250px',
  },
  chartBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  chartBarFill: {
    width: '100%',
    background: 'linear-gradient(to top, #d4af37, #ffd700)',
    borderRadius: '0.5rem 0.5rem 0 0',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '0.5rem',
  },
  chartBarValue: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#1a1a2e',
  },
  chartBarLabel: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quickActions: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '1.5rem',
  },
  actionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  actionButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#fff',
  },
  actionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  actionLabel: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  recentSales: {
    maxWidth: '1400px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  salesTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  saleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '0.75rem',
    transition: 'all 0.3s ease',
  },
  saleInfo: {},
  saleArtwork: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '0.25rem',
  },
  saleBuyer: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  saleDetails: {
    textAlign: 'right',
  },
  saleAmount: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#d4af37',
    marginBottom: '0.25rem',
  },
  saleDate: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '600px',
    width: '90vw',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  // Quick Actions Modal styles
  quickActionModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
    padding: '1rem',
  },
  quickActionModalContent: {
    background: 'linear-gradient(135deg, #2d1b69 0%, #5a3d8a 100%)',
    borderRadius: '1.5rem',
    padding: '2rem',
    maxWidth: '600px',
    width: '90vw',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
  },
  modalContent: {
    background: 'linear-gradient(135deg, #2d1b69 0%, #5a3d8a 100%)',
    borderRadius: '1.5rem',
    padding: '2rem',
    maxWidth: '600px',
    width: '90vw',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
  },
  formGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '2px solid #1a73e8',
    fontSize: '1rem',
    outline: 'none',
    marginTop: '0.5rem',
    background: '#f0f7ff',
    color: '#1a1a2e',
    fontWeight: 500,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
  },
};
