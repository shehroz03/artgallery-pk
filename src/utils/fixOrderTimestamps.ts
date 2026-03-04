import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

/**
 * CRITICAL FIX: Updates all orders in database that are missing proper createdAt timestamps
 * This script should be run ONCE to fix existing orders
 * 
 * Run this in browser console:
 * import('./utils/fixOrderTimestamps.js').then(m => m.fixAllOrderTimestamps())
 */
export async function fixAllOrderTimestamps() {
  try {
    console.log('🔧 Starting to fix order timestamps...');
    
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    console.log(`📦 Found ${snapshot.docs.length} total orders`);
    
    let fixed = 0;
    let alreadyGood = 0;
    let failed = 0;
    
    for (const orderDoc of snapshot.docs) {
      try {
        const data = orderDoc.data();
        const orderId = orderDoc.id.substring(0, 8);
        
        // Check if createdAt exists and is valid
        if (!data.createdAt || typeof data.createdAt === 'string') {
          // Order needs fixing
          const fallbackDate = data.updatedAt || Timestamp.now();
          
          await updateDoc(doc(db, 'orders', orderDoc.id), {
            createdAt: fallbackDate,
            updatedAt: Timestamp.now()
          });
          
          console.log(`✅ Fixed order ${orderId}: Set createdAt from ${data.createdAt ? 'string' : 'null'} to proper Timestamp`);
          fixed++;
        } else {
          alreadyGood++;
        }
      } catch (error) {
        console.error(`❌ Failed to fix order ${orderDoc.id}:`, error);
        failed++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Fixed: ${fixed} orders`);
    console.log(`✔️  Already OK: ${alreadyGood} orders`);
    console.log(`❌ Failed: ${failed} orders`);
    console.log('\n🎉 Done! Refresh the page to see stable timestamps.');
    
    return { fixed, alreadyGood, failed };
  } catch (error) {
    console.error('❌ Error fixing timestamps:', error);
    throw error;
  }
}

/**
 * Fix a single order's timestamp (for testing)
 */
export async function fixSingleOrder(orderId: string) {
  try {
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, {
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Updated order ${orderId}`);
  } catch (error) {
    console.error(`❌ Error updating order ${orderId}:`, error);
    throw error;
  }
}
