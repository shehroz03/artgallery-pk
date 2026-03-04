import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  location?: string;
  avatar?: string;
  memberSince?: string;
  totalOrders?: number;
  totalSpent?: number;
}

// Helper: generate a local UID when Firebase is unavailable
function generateLocalUid(): string {
  return 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

export const authService = {

  // ✅ Email/Password Sign Up — localStorage first, Firebase optional
  async signUp(email: string, password: string, name: string, role: 'buyer' | 'seller' | 'admin'): Promise<AuthUser> {
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Check if user already exists locally
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existing = users.find((u: any) => u.email === email);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    let uid = generateLocalUid();

    // Try Firebase Auth (optional — if fails, local account still works)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      uid = userCredential.user.uid;
      console.log('✅ Firebase Auth signup successful');

      // Try Firestore save (optional)
      try {
        await Promise.race([
          setDoc(doc(db, 'users', uid), {
            email, displayName: name, role, phone: '',
            address: { country: 'Pakistan', city: '', postalCode: '' },
            photoURL: 'https://i.pravatar.cc/150?img=33',
            createdAt: new Date().toISOString(), memberSince: currentDate,
            totalOrders: 0, totalSpent: 0,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
      } catch { /* Firestore optional */ }
    } catch (firebaseError: any) {
      console.warn('⚠️ Firebase Auth failed, using local account:', firebaseError.message);
      // Continue with local UID — app still works offline
    }

    // Always save to localStorage
    const newUser = {
      uid, email, name, role, password,
      phone: '', location: 'Pakistan',
      avatar: 'https://i.pravatar.cc/150?img=33',
      memberSince: currentDate, totalOrders: 0, totalSpent: 0
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    return {
      uid, email, name, role, phone: '', location: 'Pakistan',
      avatar: 'https://i.pravatar.cc/150?img=33', memberSince: currentDate,
      totalOrders: 0, totalSpent: 0
    };
  },

  // ✅ Email/Password Sign In — Firebase first, localStorage fallback
  async signIn(email: string, password: string, role: 'buyer' | 'seller' | 'admin'): Promise<AuthUser> {
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let storedUser = users.find((u: any) => u.email === email);

    // Try Firebase Auth first
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Firebase Auth login successful');

      if (!storedUser) {
        storedUser = {
          uid: firebaseUser.uid, email, name: firebaseUser.displayName || 'User',
          role, password, phone: '', location: 'Pakistan',
          avatar: firebaseUser.photoURL || 'https://i.pravatar.cc/150?img=33',
          memberSince: currentDate, totalOrders: 0, totalSpent: 0
        };
        users.push(storedUser);
        localStorage.setItem('users', JSON.stringify(users));
      } else if (storedUser.role !== role) {
        throw new Error('This account is registered as a ' + storedUser.role + '. Please use the correct login portal.');
      }

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: storedUser.name || firebaseUser.displayName || 'User',
        role, phone: storedUser.phone || '',
        location: storedUser.location || 'Pakistan',
        avatar: storedUser.avatar || 'https://i.pravatar.cc/150?img=33',
        memberSince: storedUser.memberSince || currentDate,
        totalOrders: storedUser.totalOrders || 0,
        totalSpent: storedUser.totalSpent || 0
      };
    } catch (firebaseError: any) {
      console.warn('⚠️ Firebase Auth failed, checking local accounts:', firebaseError.message);
    }

    // Fallback: check localStorage credentials
    if (!storedUser) {
      throw new Error('No account found with this email. Please sign up first.');
    }
    if (storedUser.password && storedUser.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }
    if (storedUser.role !== role) {
      throw new Error('This account is registered as a ' + storedUser.role + '. Please use the correct login portal.');
    }

    console.log('✅ Local login successful for:', email);
    return {
      uid: storedUser.uid, email: storedUser.email || email,
      name: storedUser.name, role,
      phone: storedUser.phone || '', location: storedUser.location || 'Pakistan',
      avatar: storedUser.avatar || 'https://i.pravatar.cc/150?img=33',
      memberSince: storedUser.memberSince || currentDate,
      totalOrders: storedUser.totalOrders || 0, totalSpent: storedUser.totalSpent || 0
    };
  },

  // Google Sign In
  async signInWithGoogle(role: 'buyer' | 'seller' | 'admin'): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let storedUser = users.find((u: any) => u.email === user.email);

      if (!storedUser) {
        storedUser = {
          uid: user.uid, email: user.email, name: user.displayName || 'User',
          role, password: '', phone: '', location: 'Pakistan',
          avatar: user.photoURL || 'https://i.pravatar.cc/150?img=33',
          memberSince: currentDate, totalOrders: 0, totalSpent: 0
        };
        users.push(storedUser);
        localStorage.setItem('users', JSON.stringify(users));
      }

      return {
        uid: user.uid, email: user.email || '',
        name: user.displayName || storedUser.name || 'User',
        role: storedUser.role || role,
        phone: storedUser.phone || '', location: storedUser.location || 'Pakistan',
        avatar: user.photoURL || storedUser.avatar || 'https://i.pravatar.cc/150?img=33',
        memberSince: storedUser.memberSince || currentDate,
        totalOrders: storedUser.totalOrders || 0, totalSpent: storedUser.totalSpent || 0
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Google sign-in failed');
    }
  },

  // Logout
  async logout(): Promise<void> {
    try { await signOut(auth); } catch { /* Firebase optional */ }
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  },
};
