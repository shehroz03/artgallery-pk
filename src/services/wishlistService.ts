import { auth } from '../firebase';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { notificationService } from './notificationService';

const db = getFirestore();

export const saveWishlistToFirestore = async (wishlistItems: any[], isAddingItem: boolean = false, artworkTitle?: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, cannot save wishlist');
      return;
    }

    const wishlistData = wishlistItems.map(item => ({
      artworkId: item.id,
      addedAt: new Date().toISOString(),
      // Store image reference for easier loading
      imageUrl: item.imageUrl || item.image,
      title: item.title,
    }));

    console.log('Saving wishlist to Firestore:', wishlistData.length, 'items for user', user.uid);
    await setDoc(doc(db, 'wishlists', user.uid), {
      userId: user.uid,
      items: wishlistData,
      updatedAt: new Date().toISOString(),
    });
    console.log('Wishlist saved successfully with image URLs');

    // Create notification when item is added
    if (isAddingItem && artworkTitle) {
      console.log('🔔 Creating wishlist notification for:', artworkTitle);
      const notificationId = await notificationService.createNotification(
        user.uid,
        'wishlist',
        'Added to Wishlist',
        `"${artworkTitle}" has been added to your wishlist.`,
        { artworkId: wishlistItems[wishlistItems.length - 1]?.id }
      );
      console.log('✅ Wishlist notification created:', notificationId);
    }
  } catch (error) {
    console.error('Error saving wishlist to Firestore:', error);
    throw error;
  }
};

export const getWishlistFromFirestore = async (): Promise<string[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, cannot get wishlist');
      return [];
    }

    console.log('Fetching wishlist for user:', user.uid);
    const wishlistDoc = await getDoc(doc(db, 'wishlists', user.uid));
    if (wishlistDoc.exists()) {
      const data = wishlistDoc.data();
      const artworkIds = data.items?.map((item: any) => item.artworkId) || [];
      console.log('Found wishlist in Firestore:', artworkIds.length, 'items');
      return artworkIds;
    }
    console.log('No wishlist found in Firestore');
    return [];
  } catch (error) {
    console.error('Error getting wishlist from Firestore:', error);
    return [];
  }
};

export const clearWishlistInFirestore = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(doc(db, 'wishlists', user.uid));
  } catch (error) {
    console.error('Error clearing wishlist in Firestore:', error);
  }
};
