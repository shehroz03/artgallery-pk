// Type definitions for ArtGallery.Pk

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  sellerId?: string; // Firebase UID of the seller (for permissions)
  price: number;
  image: string;
  imageUrl?: string; // Alternative field name from database
  category: string;
  style: string;
  medium: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  year: number;
  description: string;
  featured: boolean;
  trending: boolean;
  likes: number;
  views: number;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  country: string;
  artworkCount: number;
  followers: number;
  verified: boolean;
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  artworks: Artwork[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'admin';
}

export interface ARPlacement {
  artworkId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface SellerStats {
  totalSales: number;
  revenue: number;
  artworksSold: number;
  activeListings: number;
  pendingOrders: number;
  monthlyGrowth: number;
}

export interface AdminStats {
  totalUsers: number;
  totalArtworks: number;
  totalOrders: number;
  revenue: number;
  activeUsers: number;
  pendingApprovals: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'sale' | 'upload' | 'user' | 'order';
  description: string;
  timestamp: string;
  user: string;
}
