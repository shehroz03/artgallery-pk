import { auth } from '../firebase';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { notificationService } from './notificationService';

const db = getFirestore();

export interface CartItem {
  artworkId: string;
  quantity: number;
  addedAt: string;
}

export const saveCartToFirestore = async (cartItems: any[], isAddingItem: boolean = false, artworkTitle?: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, cannot save cart');
      return;
    }

    const cartData = cartItems.map(item => ({
      artworkId: item.artwork.id,
      quantity: item.quantity,
      addedAt: new Date().toISOString(),
    }));

    console.log('Saving cart to Firestore:', cartData.length, 'items for user', user.uid);
    await setDoc(doc(db, 'carts', user.uid), {
      userId: user.uid,
      items: cartData,
      updatedAt: new Date().toISOString(),
    });
    console.log('Cart saved successfully');

    // Create notification when item is added to cart
    if (isAddingItem && artworkTitle) {
      console.log('🔔 Creating cart notification for:', artworkTitle);
      const notificationId = await notificationService.createNotification(
        user.uid,
        'cart',
        'Added to Cart',
        `"${artworkTitle}" has been added to your cart.`,
        { artworkId: cartItems[cartItems.length - 1]?.artwork?.id }
      );
      console.log('✅ Cart notification created:', notificationId);
    }
  } catch (error) {
    console.error('Error saving cart to Firestore:', error);
    throw error;
  }
};

export const getCartFromFirestore = async (): Promise<string[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in, cannot get cart');
      return [];
    }

    console.log('Fetching cart for user:', user.uid);
    const cartDoc = await getDoc(doc(db, 'carts', user.uid));
    if (cartDoc.exists()) {
      const data = cartDoc.data();
      const artworkIds = data.items?.map((item: CartItem) => item.artworkId) || [];
      console.log('Found cart in Firestore:', artworkIds.length, 'items');
      return artworkIds;
    }
    console.log('No cart found in Firestore');
    return [];
  } catch (error) {
    console.error('Error getting cart from Firestore:', error);
    return [];
  }
};

export const clearCartInFirestore = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(doc(db, 'carts', user.uid));
  } catch (error) {
    console.error('Error clearing cart in Firestore:', error);
  }
};
