import { auth, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { notificationService } from './notificationService';

export interface OrderItem {
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  price: number;
  quantity: number;
  sellerId?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const ordersRef = collection(db, 'orders');
    
    // Try with composite index first
    try {
      const q = query(
        ordersRef, 
        where('buyerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Order[];

      console.log('✅ Orders fetched with Firestore index:', orders.length);
      return orders;
    } catch (indexError: any) {
      // Fallback: If index is still building, fetch without orderBy and sort in memory
      if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
        console.log('⏳ Index building... Using memory sorting as fallback');
        
        const q = query(ordersRef, where('buyerId', '==', user.uid));
        const snapshot = await getDocs(q);
        let orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        })) as Order[];

        // Sort in memory
        orders.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        console.log('✅ Orders fetched with memory sorting:', orders.length);
        return orders;
      }
      throw indexError;
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
};

// Fetch ALL orders (for sellers/admins)
export const fetchAllOrders = async (): Promise<Order[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const ordersRef = collection(db, 'orders');
    
    // Get all orders without filtering by buyerId
    try {
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Order[];

      console.log('✅ All orders fetched:', orders.length);
      return orders;
    } catch (indexError: any) {
      // Fallback: fetch all and sort in memory
      if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
        console.log('⏳ Using memory sorting for all orders');
        
        const snapshot = await getDocs(ordersRef);
        let orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        })) as Order[];

        orders.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        return orders;
      }
      throw indexError;
    }
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  items: Array<{
    artworkId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress?: any;
  paymentMethod?: string;
}): Promise<Order> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newOrder = {
      buyerId: user.uid,
      buyerEmail: user.email,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'payfast',
      paymentStatus: 'pending' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    
    // Create notification for order placed
    const itemCount = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    await notificationService.createNotification(
      user.uid,
      'order',
      'Order Placed Successfully',
      `Your order with ${itemCount} item(s) worth PKR ${orderData.totalAmount.toLocaleString()} has been placed successfully.`,
      { 
        orderId: docRef.id,
        amount: orderData.totalAmount,
        itemCount 
      }
    );

    return {
      id: docRef.id,
      ...newOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
