import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  country: string;
  artworkCount: number;
  followers: number;
  verified: boolean;
  createdAt?: string;
}

// Add artist to database
export const addArtist = async (artistData: Omit<Artist, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'artists'), {
      ...artistData,
      createdAt: new Date().toISOString(),
    });
    console.log('✅ Artist added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding artist:', error);
    throw error;
  }
};

// Fetch all artists
export const fetchArtists = async (): Promise<Artist[]> => {
  try {
    const artistsRef = collection(db, 'artists');
    
    try {
      // Try with orderBy
      const q = query(artistsRef, orderBy('followers', 'desc'));
      const snapshot = await getDocs(q);
      
      const artists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Artist[];
      
      console.log('✅ Artists fetched:', artists.length);
      return artists;
    } catch (indexError: any) {
      // Fallback: fetch all and sort in memory
      if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
        console.log('⏳ Using memory sorting for artists');
        
        const snapshot = await getDocs(artistsRef);
        let artists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Artist[];
        
        // Sort by followers
        artists.sort((a, b) => (b.followers || 0) - (a.followers || 0));
        
        console.log('✅ Artists fetched with memory sorting:', artists.length);
        return artists;
      }
      throw indexError;
    }
  } catch (error) {
    console.error('❌ Error fetching artists:', error);
    throw error;
  }
};

// Fetch single artist by ID
export const fetchArtistById = async (artistId: string): Promise<Artist | null> => {
  try {
    const docRef = doc(db, 'artists', artistId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Artist;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching artist:', error);
    throw error;
  }
};

// Search artists by name
export const searchArtists = async (searchTerm: string): Promise<Artist[]> => {
  try {
    const artistsRef = collection(db, 'artists');
    const snapshot = await getDocs(artistsRef);
    
    const artists = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Artist))
      .filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return artists;
  } catch (error) {
    console.error('❌ Error searching artists:', error);
    throw error;
  }
};

// Initialize artists from mock data
export const initializeArtists = async (mockArtists: any[]): Promise<void> => {
  try {
    console.log('🎨 Initializing artists in database...');
    
    // Check if artists already exist
    const existingArtists = await fetchArtists();
    if (existingArtists.length > 0) {
      console.log('✅ Artists already initialized:', existingArtists.length);
      return;
    }
    
    // Add each artist
    for (const artist of mockArtists) {
      await addArtist({
        name: artist.name,
        avatar: artist.avatar,
        bio: artist.bio,
        country: artist.country,
        artworkCount: artist.artworkCount,
        followers: artist.followers,
        verified: artist.verified,
      });
    }
    
    console.log('✅ All artists initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing artists:', error);
    throw error;
  }
};
