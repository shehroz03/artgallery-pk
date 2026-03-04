# ArtGallery.Pk - Luxury E-Commerce Art Platform

A fully animated, responsive React web application for buying, selling, and managing art. Features three comprehensive panels (Buyer, Seller, Admin) with a stunning VIP AR Try-On Studio.

## 🎨 Key Features

### Buyer Panel
- **Animated Homepage**: Floating orbs, hero section, trending artworks, featured artists
- **Art Marketplace**: Infinite scroll, advanced filters, animated grid/list views
- **VIP AR Try-On Studio** ⭐:
  - Upload your wall/room photo
  - Select any painting and place it on your wall
  - Drag, scale, and rotate paintings
  - Realistic 3D gold ornate frames
  - Shadow and depth effects
  - Side-by-side comparison mode
  - Add to cart directly from AR preview
- **Shopping Cart**: Animated checkout flow with order success animation
- **Wishlist**: Save favorite artworks
- **Profile**: Order history, user stats, account management
- **Responsive Navigation**: Mobile-first design

### Seller Panel (Purple/Pink Gradients)
- **Dashboard**: Animated sales and artwork statistics
- **Revenue Charts**: Monthly revenue visualization
- **Quick Actions**: Upload, analytics, gallery management
- **Recent Sales**: Real-time sales tracking
- Ready for expansion with forms, uploads, and detailed analytics

### Admin Panel (Amber/Orange Gradients)
- **Platform Overview**: 6+ key metrics with animations
- **Activity Feed**: Real-time platform activity
- **Quick Management**: User, artwork, order management shortcuts
- **Platform Statistics**: Conversion rates, engagement metrics
- **Moderation Tools**: Ready for full platform control

## 🎯 Design System

### Pure CSS (No Tailwind)
- Custom design tokens in `styles/globals.css`
- Consistent color palette for each panel
- Glassmorphism effects throughout
- 3D card effects with depth and shadows

### Animation Framework
- Framer Motion (motion/react) for all animations
- Smooth page transitions
- Micro-interactions on all interactive elements
- Staggered animations for lists
- Floating orb animations on homepage

### Color Palettes
- **Buyer**: Blue/Teal gradients (#667eea, #764ba2)
- **Seller**: Purple/Pink gradients (#f093fb, #f5576c)
- **Admin**: Amber/Orange gradients (#fa709a, #fee140)
- **Accent**: Gold (#d4af37, #ffd700)

## 📁 Project Structure

```
/
├── App.tsx                          # Main application with routing
├── types/
│   └── index.ts                     # TypeScript interfaces
├── data/
│   └── mockData.ts                  # Mock artworks, artists, orders
├── components/
│   ├── shared/
│   │   └── Navigation.tsx           # Main navigation component
│   ├── buyer/
│   │   ├── BuyerHome.tsx           # Animated homepage
│   │   ├── Marketplace.tsx         # Art browsing with filters
│   │   ├── ARStudio.tsx            # ⭐ AR Try-On Studio
│   │   ├── Cart.tsx                # Shopping cart
│   │   ├── Wishlist.tsx            # Saved artworks
│   │   └── BuyerProfile.tsx        # User profile
│   ├── seller/
│   │   └── SellerDashboard.tsx     # Seller panel
│   └── admin/
│       └── AdminDashboard.tsx      # Admin panel
└── styles/
    └── globals.css                  # Global styles and design tokens
```

## 🚀 Technologies

- **React** with TypeScript
- **Motion (motion/react)** for animations (Framer Motion successor)
- **Pure CSS** with custom design system
- **HTML Canvas** for AR frame rendering
- **Unsplash** for high-quality artwork images

## 🎭 AR Try-On Studio

The standout feature! Buyers can:
1. Upload a photo of their wall/room
2. Browse and select paintings from the marketplace
3. Place paintings on the wall using canvas rendering
4. Adjust position, scale, and rotation with sliders
5. View realistic gold ornate 3D frames with shadows
6. Compare multiple paintings side-by-side
7. Add their favorite placement directly to cart

**Technical Implementation:**
- HTML5 Canvas for rendering
- Real-time frame generation with gradients
- Shadow and depth effects for realism
- Smooth control sliders for adjustments
- Modal artwork selector

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints for tablets and desktop
- Adaptive navigation (hamburger menu on mobile)
- Touch-friendly interactions
- Optimized for all screen sizes

## 🎬 Animations

- **Homepage**: Floating orbs, staggered card reveals
- **Transitions**: Smooth page changes with Motion
- **Hover Effects**: Scale, shadow, and glow on cards
- **Loading States**: Skeleton screens and shimmer effects
- **Success States**: Celebration animations on checkout
- **Scroll Animations**: Elements fade in as you scroll

## 💼 Developer Notes

### Backend Integration Ready
- All components use mock data from `data/mockData.ts`
- Replace with API calls to your backend
- TypeScript interfaces defined in `types/index.ts`
- State management ready for Redux/Context API

### Expansion Points
- **Seller Panel**: Add upload forms, detailed analytics
- **Admin Panel**: Full CRUD operations, user management
- **Payment Integration**: Ready for Stripe/PayPal
- **Real AR**: Can integrate AR.js or WebXR for device AR
- **Authentication**: Add login/signup flows

### Design Tokens
All design tokens are centralized in `styles/globals.css`:
- Color variables for each panel
- Spacing scale
- Border radius scale
- Shadow scales
- Animation timings
- Z-index layers

### Component Export Ready
- Clean, semantic HTML structure
- Named and grouped components
- Reusable component patterns
- Ready for export via:
  - Anima plugin
  - Locofy.ai
  - Codia AI
  - Builder.io

## 🎨 Mock Data

### Artworks
- 6 curated artworks with real images
- Categories: Abstract, Portrait, Landscape, Modern
- Full metadata: dimensions, medium, price, stats

### Artists
- 4 featured artists with profiles
- Verified badges
- Follower counts and artwork counts

### Orders
- 3 sample orders with tracking
- Status badges (delivered, shipped, processing)

## 🔧 Customization

### Change Color Scheme
Edit variables in `styles/globals.css`:
```css
--color-buyer-gradient: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
```

### Add New Artwork
Add to `data/mockData.ts`:
```typescript
{
  id: '7',
  title: 'Your Artwork',
  artist: 'Artist Name',
  price: 50000,
  image: 'your-image-url',
  // ... other fields
}
```

### Modify AR Frame Style
Edit `components/buyer/ARStudio.tsx` canvas rendering:
- Change gradient colors
- Adjust frame width
- Modify shadow effects

## 🌟 WOW Factors

1. **AR Try-On Studio**: Industry-leading feature for art e-commerce
2. **Fluid Animations**: Every interaction feels premium
3. **Glassmorphism**: Modern, sophisticated UI
4. **Three Complete Panels**: Full platform in one app
5. **Mobile-First**: Perfect on all devices
6. **Pure CSS**: No framework dependencies
7. **Production Ready**: Clean, scalable code

## 📝 License

This is a demo project for showcasing React development skills.
All artwork images are sourced from Unsplash and are subject to their licensing.

---

**Built with ❤️ for ArtGallery.Pk**

*Ready for React export and scalable frontend development*
