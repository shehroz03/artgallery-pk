/**
 * artworkService.ts
 * ✅ localStorage-first architecture — works 100% without Firebase.
 * 🔥 Firebase Firestore is attempted as optional background sync.
 */

import { Artwork } from '../types';
import { getArtworks, addArtwork as saveLocal, updateArtwork as updateLocal, deleteArtwork as deleteLocal } from '../utils/artworksStore';

// ─────────────────────────────────────────────
// FETCH ARTWORKS — localStorage first, Firestore optional
// ─────────────────────────────────────────────
export async function fetchArtworks(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
}): Promise<Artwork[]> {

  // ✅ STEP 1: Always get local artworks first (instant, always works)
  let localArtworks = getArtworks();

  // Apply filters on local data
  if (filters?.category && filters.category !== 'all') {
    localArtworks = localArtworks.filter(a =>
      a.category?.toLowerCase() === filters.category!.toLowerCase()
    );
  }
  if (filters?.minPrice !== undefined) {
    localArtworks = localArtworks.filter(a => a.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    localArtworks = localArtworks.filter(a => a.price <= filters.maxPrice!);
  }
  if (filters?.limit) {
    localArtworks = localArtworks.slice(0, filters.limit);
  }

  // ✅ STEP 2: Try Firestore in background (non-blocking optional sync)
  try {
    const { db } = await import('../firebase');
    const { collection, getDocs, query, where, orderBy, limit: firestoreLimit, Query, DocumentData } = await import('firebase/firestore');

    const artworksRef = collection(db, 'artworks');
    let q: any = artworksRef;

    if (filters?.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.sortBy) {
      q = query(q, orderBy(filters.sortBy, 'desc'));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }
    if (filters?.limit) {
      q = query(q, firestoreLimit(filters.limit));
    }

    const snapshot = await getDocs(q);
    const dbArtworks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Artwork));

    if (dbArtworks.length > 0) {
      // Merge: DB artworks + local-only artworks
      const dbIds = new Set(dbArtworks.map(a => a.id));
      const localOnly = localArtworks.filter(a => !dbIds.has(a.id));
      return [...dbArtworks, ...localOnly];
    }
  } catch {
    // Firestore unavailable — return local artworks (already loaded above)
    console.warn('⚠️ Firestore unavailable, using localStorage artworks');
  }

  return localArtworks;
}

// ─────────────────────────────────────────────
// FETCH SINGLE ARTWORK BY ID
// ─────────────────────────────────────────────
export async function fetchArtworkById(id: string): Promise<Artwork | null> {
  // Check localStorage first
  const local = getArtworks().find(a => a.id === id);
  if (local) return local;

  // Try Firestore
  try {
    const { db } = await import('../firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    const artworkRef = doc(db, 'artworks', id);
    const snap = await getDoc(artworkRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Artwork;
    }
  } catch {
    console.warn('⚠️ Firestore unavailable for fetchArtworkById');
  }

  return null;
}

// ─────────────────────────────────────────────
// CREATE ARTWORK — localStorage first, Firestore optional
// ─────────────────────────────────────────────
export async function createArtwork(
  artworkData: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>,
  _authToken?: string
): Promise<{ success: boolean; artwork?: Artwork; error?: string }> {

  // ✅ Always save locally first
  const localId = 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  const localArtwork: Artwork = {
    ...artworkData,
    id: localId,
    views: artworkData.views ?? 0,
    likes: artworkData.likes ?? 0,
    createdAt: now,
    updatedAt: now,
  } as Artwork;

  saveLocal(localArtwork);
  console.log('✅ Artwork saved locally:', localId);

  // 🔥 Try Firestore in background (non-blocking)
  try {
    const { db } = await import('../firebase');
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    const { auth } = await import('../firebase');
    const { onAuthStateChanged } = await import('firebase/auth');

    // Wait for auth state
    let user = auth.currentUser;
    if (!user) {
      user = await new Promise<import('firebase/auth').User | null>((resolve) => {
        const timer = setTimeout(() => { unsubscribe(); resolve(auth.currentUser); }, 3000);
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          clearTimeout(timer); unsubscribe(); resolve(u);
        });
      });
    }

    if (user) {
      const firestoreData = {
        ...artworkData,
        sellerId: user.uid,
        status: 'active',
        views: 0,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'artworks'), firestoreData);
      console.log('✅ Artwork synced to Firestore:', docRef.id);

      // Update local entry with Firestore ID to avoid duplicates
      updateLocal(localId, { id: docRef.id });
    }
  } catch (e) {
    console.warn('⚠️ Firestore sync failed (artwork saved locally):', e);
  }

  return { success: true, artwork: localArtwork };
}

// ─────────────────────────────────────────────
// UPDATE ARTWORK
// ─────────────────────────────────────────────
export async function updateArtworkInDB(
  artworkId: string,
  updates: Partial<Artwork>,
  _authToken?: string
): Promise<{ success: boolean; error?: string }> {

  // ✅ Always update locally
  updateLocal(artworkId, updates);

  // 🔥 Try Firestore in background
  try {
    const { db } = await import('../firebase');
    const { updateDoc, doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
    const artworkRef = doc(db, 'artworks', artworkId);
    const docSnap = await getDoc(artworkRef);

    if (!docSnap.exists()) {
      await setDoc(artworkRef, { ...updates, id: artworkId, updatedAt: serverTimestamp() });
    } else {
      await updateDoc(artworkRef, { ...updates, updatedAt: serverTimestamp() });
    }
  } catch {
    console.warn('⚠️ Firestore update failed (updated locally)');
  }

  return { success: true };
}

// ─────────────────────────────────────────────
// DELETE ARTWORK
// ─────────────────────────────────────────────
export async function deleteArtwork(
  artworkId: string,
  _authToken?: string
): Promise<{ success: boolean; error?: string }> {

  // ✅ Always delete locally
  deleteLocal(artworkId);

  // 🔥 Try Firestore in background
  try {
    const { db } = await import('../firebase');
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'artworks', artworkId));
  } catch {
    console.warn('⚠️ Firestore delete failed (deleted locally)');
  }

  return { success: true };
}

// ─────────────────────────────────────────────
// TOGGLE LIKE — localStorage only
// ─────────────────────────────────────────────
export async function toggleArtworkLike(
  artworkId: string,
  _authToken?: string
): Promise<{ success: boolean; liked?: boolean; error?: string }> {

  const artworks = getArtworks();
  const artwork = artworks.find(a => a.id === artworkId);
  if (!artwork) return { success: false, error: 'Artwork not found' };

  const newLikes = (artwork.likes || 0) + 1;
  updateLocal(artworkId, { likes: newLikes });

  return { success: true, liked: true };
}
