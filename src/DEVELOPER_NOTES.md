# Developer Integration Notes

## Backend Integration Guide

### API Endpoints to Implement

#### Artworks
```typescript
GET    /api/artworks              // List all artworks with filters
GET    /api/artworks/:id          // Get single artwork
POST   /api/artworks              // Upload new artwork (seller)
PUT    /api/artworks/:id          // Update artwork (seller)
DELETE /api/artworks/:id          // Delete artwork (seller/admin)
GET    /api/artworks/featured     // Get featured artworks
GET    /api/artworks/trending     // Get trending artworks
```

#### Cart & Orders
```typescript
GET    /api/cart                  // Get user's cart
POST   /api/cart/items            // Add item to cart
PUT    /api/cart/items/:id        // Update quantity
DELETE /api/cart/items/:id        // Remove from cart
POST   /api/orders                // Create order (checkout)
GET    /api/orders                // Get user's orders
GET    /api/orders/:id            // Get order details
```

#### Wishlist
```typescript
GET    /api/wishlist              // Get user's wishlist
POST   /api/wishlist              // Add to wishlist
DELETE /api/wishlist/:artworkId   // Remove from wishlist
```

#### Users & Auth
```typescript
POST   /api/auth/register         // User registration
POST   /api/auth/login            // User login
POST   /api/auth/logout           // User logout
GET    /api/users/profile         // Get user profile
PUT    /api/users/profile         // Update profile
```

#### Seller Dashboard
```typescript
GET    /api/seller/stats          // Get seller statistics
GET    /api/seller/sales          // Get recent sales
GET    /api/seller/revenue        // Get revenue data
```

#### Admin Dashboard
```typescript
GET    /api/admin/stats           // Get platform statistics
GET    /api/admin/users           // List all users
GET    /api/admin/activity        // Get recent activity
PUT    /api/admin/artworks/:id/approve  // Approve artwork
```

## State Management Migration

### Option 1: Context API (Recommended for this scale)
```typescript
// contexts/AppContext.tsx
import { createContext, useContext, useState } from 'react';

interface AppContextType {
  cartItems: CartItem[];
  addToCart: (artwork: Artwork) => void;
  // ... other methods
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // ... implementation
  return <AppContext.Provider value={{ cartItems, addToCart }}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
```

### Option 2: Redux Toolkit
```typescript
// store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart: (state, action: PayloadAction<Artwork>) => {
      // ... implementation
    },
  },
});
```

## API Service Layer

Create an API service to centralize all backend calls:

```typescript
// services/api.ts
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = {
  // Artworks
  getArtworks: async (filters?: ArtworkFilters) => {
    const response = await fetch(`${API_BASE}/api/artworks?${new URLSearchParams(filters)}`);
    return response.json();
  },
  
  // Cart
  addToCart: async (artworkId: string) => {
    const response = await fetch(`${API_BASE}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artworkId }),
    });
    return response.json();
  },
  
  // Add more methods...
};
```

## Environment Variables

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_STRIPE_KEY=your_stripe_key
REACT_APP_UNSPLASH_ACCESS_KEY=your_unsplash_key
```

## Image Upload for AR Studio

### Client Side
```typescript
// In ARStudio.tsx
const uploadWallImage = async (file: File) => {
  const formData = new FormData();
  formData.append('wall', file);
  
  const response = await fetch(`${API_BASE}/api/upload/wall`, {
    method: 'POST',
    body: formData,
  });
  
  const { imageUrl } = await response.json();
  setWallImage(imageUrl);
};
```

### Server Side (Node.js + Multer)
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload/wall', upload.single('wall'), (req, res) => {
  // Store image in cloud storage (S3, Cloudinary, etc.)
  const imageUrl = uploadToCloud(req.file);
  res.json({ imageUrl });
});
```

## Authentication Implementation

### JWT Token Storage
```typescript
// utils/auth.ts
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};
```

### Protected Routes
```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const token = getAuthToken();
  const userRole = getUserRole(token);
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}
```

## Payment Integration (Stripe)

### Client Side
```typescript
// components/buyer/Checkout.tsx

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
    });
    
    if (!error) {
      // Send paymentMethod.id to backend
      await processPayment(paymentMethod.id);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay Now</button>
    </form>
  );
}
```

### Server Side
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/payment/process', async (req, res) => {
  const { paymentMethodId, amount } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'pkr',
    payment_method: paymentMethodId,
    confirm: true,
  });
  
  res.json({ success: true, paymentIntent });
});
```

## Real-time Features (Socket.io)

For real-time notifications:

```typescript
// utils/socket.ts
import io from 'socket.io-client';

export const socket = io(process.env.REACT_APP_API_URL!);

// In SellerDashboard.tsx
useEffect(() => {
  socket.on('new_sale', (sale) => {
    // Show notification
    toast.success(`New sale: ${sale.artwork}`);
  });
  
  return () => socket.off('new_sale');
}, []);
```

## Database Schema Suggestions

### MongoDB (Mongoose)
```javascript
// models/Artwork.js
const artworkSchema = new Schema({
  title: { type: String, required: true },
  artist: { type: Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  style: String,
  medium: String,
  dimensions: {
    width: Number,
    height: Number,
    unit: String,
  },
  description: String,
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});
```

### PostgreSQL (Prisma)
```prisma
model Artwork {
  id          String   @id @default(uuid())
  title       String
  artistId    String
  artist      User     @relation(fields: [artistId], references: [id])
  price       Float
  image       String
  category    String
  style       String?
  medium      String?
  description String?
  featured    Boolean  @default(false)
  trending    Boolean  @default(false)
  likes       Int      @default(0)
  views       Int      @default(0)
  status      Status   @default(PENDING)
  createdAt   DateTime @default(now())
}
```

## Performance Optimization

### Image Optimization
- Use lazy loading for images
- Implement progressive image loading
- Compress images before upload
- Use WebP format with fallbacks

### Code Splitting
```typescript
// Lazy load components
const SellerDashboard = lazy(() => import('./components/seller/SellerDashboard'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

// In App.tsx
<Suspense fallback={<LoadingSpinner />}>
  <SellerDashboard />
</Suspense>
```

### Caching Strategy
- Implement React Query for data caching
- Use service workers for offline support
- Cache static assets with proper headers

## SEO Optimization

```typescript
// Use react-helmet for meta tags
import { Helmet } from 'react-helmet';

function BuyerHome() {
  return (
    <>
      <Helmet>
        <title>ArtGallery.Pk - Discover Pakistani Art</title>
        <meta name="description" content="Browse and buy authentic Pakistani artworks" />
        <meta property="og:image" content="https://artgallery.pk/og-image.jpg" />
      </Helmet>
      {/* ... component */}
    </>
  );
}
```

## Testing

### Unit Tests (Jest + React Testing Library)
```typescript
// __tests__/Cart.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Cart } from '../components/buyer/Cart';

test('adds item to cart', () => {
  const mockAddToCart = jest.fn();
  render(<Cart cartItems={[]} onAddToCart={mockAddToCart} />);
  
  // Test implementation
});
```

### E2E Tests (Cypress)
```javascript
// cypress/e2e/checkout.cy.js
describe('Checkout Flow', () => {
  it('completes a purchase', () => {
    cy.visit('/marketplace');
    cy.get('[data-testid="artwork-card"]').first().click();
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="checkout-button"]').click();
    // ... continue flow
  });
});
```

## Deployment

### Vercel (Recommended)
```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "env": {
    "REACT_APP_API_URL": "@api-url"
  }
}
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring & Analytics

- Google Analytics for user tracking
- Sentry for error tracking
- LogRocket for session replay
- Hotjar for user behavior analysis

---

**Questions?** Refer to component-specific comments or create an issue.
