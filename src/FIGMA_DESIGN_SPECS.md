# ArtGallery.Pk - Figma Design Specifications
## Ultra-Animated 3D Luxury VIP Gallery Style

---

## 🎨 Design Philosophy

**Core Concept**: Ultra-premium, immersive 3D gallery experience with fluid animations at every touchpoint. Every element should feel alive, luxurious, and interactive.

**Visual Language**: Glassmorphism + 3D depth + Vibrant gradients + Floating elements + Glow effects

---

## 📐 Layout & Grid System

### Desktop Grid
- **Max Width**: 1400px
- **Columns**: 12-column grid
- **Gutter**: 32px
- **Margin**: 64px (left/right)

### Tablet Grid
- **Max Width**: 768px
- **Columns**: 8-column grid
- **Gutter**: 24px
- **Margin**: 32px

### Mobile Grid
- **Max Width**: 375px
- **Columns**: 4-column grid
- **Gutter**: 16px
- **Margin**: 16px

---

## 🎭 Color System

### Buyer Panel Theme
```
Primary Background: Linear Gradient (135°)
  - Start: #0f2027
  - Middle: #203a43
  - End: #2c5364

Accent Gradient: Linear Gradient (135°)
  - Start: #667eea
  - End: #764ba2

Glow Color: #667eea with 40% opacity blur

Glass Background: rgba(255, 255, 255, 0.08)
Glass Border: rgba(255, 255, 255, 0.18)
Glass Shadow: 0 8px 32px rgba(31, 38, 135, 0.37)
```

### Seller Panel Theme
```
Primary Background: Linear Gradient (135°)
  - Start: #2d1b69
  - Middle: #5a3d8a
  - End: #8e44ad

Accent Gradient: Linear Gradient (135°)
  - Start: #f093fb
  - End: #f5576c

Glow Color: #f093fb with 40% opacity blur

Glass Background: rgba(255, 255, 255, 0.1)
Glass Border: rgba(255, 255, 255, 0.2)
```

### Admin Panel Theme
```
Primary Background: Linear Gradient (135°)
  - Start: #3d2817
  - Middle: #6b4423
  - End: #8b5a2b

Accent Gradient: Linear Gradient (135°)
  - Start: #fa709a
  - End: #fee140

Glow Color: #fa709a with 40% opacity blur

Glass Background: rgba(255, 255, 255, 0.12)
Glass Border: rgba(255, 255, 255, 0.22)
```

### Universal Gold Accent
```
Gold Gradient: Linear Gradient (90°)
  - Start: #d4af37
  - Middle: #ffd700
  - End: #d4af37

Gold Glow: 0 0 40px rgba(212, 175, 55, 0.6)
```

---

## 📝 Typography

### Font Family
- **Primary**: Inter / SF Pro Display
- **Headings**: Poppins (Bold/ExtraBold)
- **Body**: Inter (Regular/Medium)

### Type Scale
```
Hero Title: 72px / 700 / -2% letter-spacing / 1.1 line-height
H1: 48px / 700 / -1% letter-spacing / 1.2 line-height
H2: 40px / 600 / -1% letter-spacing / 1.3 line-height
H3: 32px / 600 / 0% letter-spacing / 1.4 line-height
H4: 24px / 500 / 0% letter-spacing / 1.5 line-height
H5: 20px / 500 / 0% letter-spacing / 1.5 line-height
Body Large: 18px / 400 / 0% / 1.7 line-height
Body: 16px / 400 / 0% / 1.7 line-height
Body Small: 14px / 400 / 0% / 1.6 line-height
Caption: 12px / 500 / 0.5% / 1.5 line-height
```

### Mobile Type Scale (< 768px)
```
Hero Title: 48px
H1: 36px
H2: 28px
H3: 24px
H4: 20px
```

---

## 🎪 3D Effects & Transforms

### Card 3D Transform (Default)
```
transform: perspective(1000px) rotateX(0deg) rotateY(0deg)
transform-style: preserve-3d
transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1)
```

### Card 3D Transform (Hover)
```
transform: perspective(1000px) rotateX(-5deg) rotateY(5deg) translateZ(20px)
box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4)
```

### Floating Animation (Keyframes)
```
@keyframes float-3d {
  0% {
    transform: translateY(0px) translateZ(0px) rotateX(0deg);
  }
  50% {
    transform: translateY(-20px) translateZ(10px) rotateX(5deg);
  }
  100% {
    transform: translateY(0px) translateZ(0px) rotateX(0deg);
  }
}
Duration: 6-8s
Easing: ease-in-out
Iteration: infinite
```

### Perspective Shadow (3D Depth)
```
Multiple Layers:
Layer 1: 0 10px 20px rgba(0, 0, 0, 0.2)
Layer 2: 0 20px 40px rgba(0, 0, 0, 0.15)
Layer 3: 0 40px 80px rgba(0, 0, 0, 0.1)

For elevated elements:
Layer 4: 0 60px 120px rgba(0, 0, 0, 0.08)
```

---

## ✨ Glassmorphism Components

### Glass Card - Light
```
Background: rgba(255, 255, 255, 0.08)
Border: 1px solid rgba(255, 255, 255, 0.18)
Backdrop Filter: blur(12px) saturate(180%)
Border Radius: 24px
Box Shadow: 0 8px 32px rgba(31, 38, 135, 0.37)
```

### Glass Card - Medium
```
Background: rgba(255, 255, 255, 0.12)
Border: 1px solid rgba(255, 255, 255, 0.25)
Backdrop Filter: blur(16px) saturate(200%)
Border Radius: 24px
Box Shadow: 0 12px 40px rgba(31, 38, 135, 0.45)
```

### Glass Card - Heavy
```
Background: rgba(255, 255, 255, 0.15)
Border: 1px solid rgba(255, 255, 255, 0.3)
Backdrop Filter: blur(20px) saturate(220%)
Border Radius: 24px
Box Shadow: 0 16px 48px rgba(31, 38, 135, 0.5)
```

---

## 🌟 Glow Effects

### Gold Glow (Premium Elements)
```
box-shadow: 
  0 0 20px rgba(212, 175, 55, 0.4),
  0 0 40px rgba(212, 175, 55, 0.3),
  0 0 60px rgba(212, 175, 55, 0.2)

Animation: pulse-glow 3s ease-in-out infinite
```

### Accent Glow (Panel-Specific)
```
Buyer: 0 0 30px rgba(102, 126, 234, 0.5)
Seller: 0 0 30px rgba(240, 147, 251, 0.5)
Admin: 0 0 30px rgba(250, 112, 154, 0.5)

Animation: glow-pulse 2s ease-in-out infinite
```

### Hover Glow Amplification
```
Multiply glow radius by 1.5x
Increase opacity by 20%
Add transition: all 0.4s ease
```

---

## 🎬 Animation Specifications

### Page Transitions
```
Type: Fade + Scale + 3D Rotate
Entry:
  - opacity: 0 → 1
  - scale: 0.95 → 1
  - rotateX: 10deg → 0deg
  Duration: 600ms
  Easing: cubic-bezier(0.23, 1, 0.32, 1)

Exit:
  - opacity: 1 → 0
  - scale: 1 → 0.95
  - rotateY: 0deg → -10deg
  Duration: 400ms
  Easing: cubic-bezier(0.4, 0, 1, 1)
```

### Card Entrance Animation (Staggered)
```
Initial State:
  - opacity: 0
  - translateY: 40px
  - rotateX: -15deg
  - scale: 0.9

Final State:
  - opacity: 1
  - translateY: 0px
  - rotateX: 0deg
  - scale: 1

Stagger Delay: 100ms per card
Duration: 700ms
Easing: cubic-bezier(0.16, 1, 0.3, 1) (spring-like)
```

### Button Hover Animation
```
Default State:
  - scale: 1
  - shadow: 0 4px 15px rgba(0, 0, 0, 0.2)

Hover State:
  - scale: 1.05
  - translateY: -2px
  - shadow: 0 12px 30px rgba(0, 0, 0, 0.3)
  - glow: active

Active/Tap State:
  - scale: 0.97
  - translateY: 0px

Transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) (bounce)
```

### Card Flip Animation
```
Front Face:
  - rotateY: 0deg
  - opacity: 1
  - z-index: 2

Back Face:
  - rotateY: 180deg
  - opacity: 0
  - z-index: 1

On Flip:
  - Duration: 800ms
  - Easing: cubic-bezier(0.4, 0, 0.2, 1)
  - transform-style: preserve-3d
  - backface-visibility: hidden
```

### Floating Orbs (Background)
```
Movement Pattern: Figure-8 / Circular
Animation:
  - translateX: -30px → 30px
  - translateY: -40px → 40px
  - scale: 0.9 → 1.1
  - opacity: 0.3 → 0.6 → 0.3
Duration: 12-20s (vary per orb)
Easing: ease-in-out
Blur: 60-80px
```

---

## 🖼️ AR Try-On Studio Specifications

### Canvas Container
```
Background: Deep gradient with subtle grid pattern
Perspective: 2000px
Border: 2px solid gold gradient with glow
Border Radius: 32px
Shadow: Multi-layered depth shadow
Size: Responsive (max 1200x800px)
```

### Painting Frame 3D Rendering
```
Frame Specifications:
- Width: 20px base (scales with painting)
- Material: Ornate gold with gradient
- Gradient: Linear (135°)
  - #b8941e → #d4af37 → #ffd700 → #d4af37 → #b8941e
- Inner Bevel: 2px darker gold (#8b6914)
- Texture: Subtle noise overlay (5% opacity)

Shadow Layers (for realism):
1. Contact Shadow: 0 2px 8px rgba(0,0,0,0.4)
2. Soft Shadow: 0 8px 24px rgba(0,0,0,0.3)
3. Ambient Shadow: 0 16px 48px rgba(0,0,0,0.2)
4. Light Source Shadow: -5px 10px 30px rgba(0,0,0,0.15)

3D Effect:
- Inner shadow on frame (depth illusion)
- Highlight on top-left edge
- Darker shade on bottom-right edge
```

### Painting Transform Controls
```
Control Panel Style:
- Position: Floating overlay (top-right)
- Background: Glass-heavy with 80% backdrop blur
- Border: Gold gradient with glow
- Shadow: Elevated (z-index: 100)

Slider Design:
- Track: Glass with inner shadow
- Thumb: Gold gradient sphere with glow
- Active State: Enlarged thumb + glow pulse
- Values: Real-time display with smooth transitions

Icons:
- Move: Animated crosshair
- Scale: Expanding/contracting squares
- Rotate: Spinning circular arrow
- All with micro-animations on interaction
```

### Wall Photo Upload Zone
```
Default State:
- Dashed border: 3px with gold gradient
- Border Animation: Dash offset animation (marching ants)
- Background: Glass-light
- Icon: Large upload icon (64px) with float animation
- Text: Gradient gold with subtle glow

Hover State:
- Border: Solid gold with glow
- Background: Slight brightening
- Scale: 1.02
- Icon: Bounce animation

Drag Over State:
- Border: Animated rainbow gradient
- Background: Pulse effect
- Scale: 1.05
- Glow: Intensified
```

### Comparison Mode Grid
```
Layout: 2x2 or 2x3 grid
Each Cell:
- Glass card with painting preview
- Gold border on selection
- Hover: 3D tilt + glow
- Click: Expand animation
- Labels: Floating badges with price

Selection Indicator:
- Animated checkmark with gold fill
- Glow pulse effect
- Scale animation on check/uncheck
```

---

## 🏠 Homepage Hero Specifications

### Floating Orbs (Background Layer)
```
Orb 1:
- Size: 400px
- Gradient: Buyer accent gradient
- Position: Top-left (10%, 5%)
- Animation: float-3d (8s)
- Blur: 70px
- Opacity: 0.3

Orb 2:
- Size: 500px
- Gradient: Seller accent gradient
- Position: Bottom-right (85%, 80%)
- Animation: float-3d (10s, reverse)
- Blur: 80px
- Opacity: 0.25

Orb 3:
- Size: 350px
- Gradient: Admin accent gradient
- Position: Center-right (75%, 50%)
- Animation: float-3d (12s, alternate)
- Blur: 65px
- Opacity: 0.35

Add 3-5 smaller orbs for depth
```

### Hero Content Layout
```
Container: 2-column grid (text left, visual right)
Text Column:
- Max width: 600px
- Vertical center alignment
- Glass background (subtle)
- Padding: 60px

Visual Column:
- 2x2 grid of featured artworks
- Each card: 3D transform on hover
- Staggered entrance animation
- Parallax scroll effect
- Gap: 16px
```

### Hero Title
```
Font: Poppins Bold, 72px
Animated Gradient Background:
- Linear gradient moving left to right
- Colors: White → Gold → White → Gold
- Background size: 200% 100%
- Animation: gradient-shift 5s linear infinite
- Text fill: Transparent
- Background clip: Text
- Shadow: 0 4px 20px rgba(212, 175, 55, 0.4)
```

### CTA Buttons
```
Primary Button:
- Background: Gold gradient
- Shadow: Multi-layer with glow
- Icon: Animated (rotate/pulse)
- Hover: Scale + glow intensify + 3D tilt
- Ripple effect on click

Secondary Button:
- Background: Glass-medium
- Border: Glass border with glow
- Hover: Border glow intensify + slight scale
- Icon: Slide animation
```

---

## 🛍️ Marketplace Gallery Specifications

### Artwork Cards (Grid View)
```
Default State:
- Size: 320px width, auto height
- Background: Glass-light
- Border Radius: 20px
- Border: 1px glass border
- Shadow: Soft depth shadow
- Transform: perspective(1000px)

Hover State:
- Transform: rotateX(-8deg) rotateY(5deg) translateZ(30px)
- Shadow: Elevated multi-layer
- Glow: Accent color glow
- Image: Scale 1.05
- Overlay: Fade in controls

Image Container:
- Aspect Ratio: 4:3
- Object Fit: Cover
- Border Radius: 20px 20px 0 0
- Overflow: Hidden
- Relative position for overlay

Overlay Controls:
- Background: rgba(0,0,0,0.8) with backdrop blur
- Buttons: Floating with glass background
- Entrance: Slide up + fade in (300ms)
- Buttons: Quick View, Add to Wishlist
- Button Hover: Scale + glow
```

### List View Layout
```
Card Structure: Horizontal flex
- Image: 300px width, fixed
- Content: Flex-grow
- Height: 250px

Image Section:
- 3D tilt on hover
- Border Radius: 20px 0 0 20px

Content Section:
- Padding: 32px
- Display: Flex column, space-between
- Background: Glass-light gradient

Hover Animation:
- Slide right 10px
- Glow on left border
- Content fade-in stagger
```

### Filter Sidebar
```
Background: Glass-medium
Width: 280px (desktop), slide-in drawer (mobile)
Border Radius: 24px
Shadow: Elevated depth

Slide-in Animation (Mobile):
- translateX: -100% → 0%
- Duration: 400ms
- Easing: cubic-bezier(0.25, 0.8, 0.25, 1)

Filter Categories:
- Accordion style
- Animated chevron rotation
- Smooth height transition

Filter Options:
- Custom checkboxes with gold accent
- Hover: Scale + glow
- Check animation: Checkmark draw (SVG path)

Price Range Slider:
- Track: Glass with inner glow
- Filled track: Gold gradient
- Thumbs: Gold spheres with shadow
- Real-time value display with floating label
```

---

## 👤 Profile & Dashboard Specifications

### Profile Card (3D Glass Card)
```
Layout: Glass-heavy card with 3D transform
Transform: perspective(1500px) rotateY(-5deg)
Shadow: Multi-layer elevated
Border: Gold gradient (1px)
Border Radius: 32px

Avatar:
- Size: 120px
- Border: 4px gold gradient
- Shadow: 0 8px 24px rgba(212,175,55,0.4)
- Hover: Rotate 360° + scale 1.1 (1s ease)

Badge:
- Position: Absolute (bottom-right of avatar)
- Background: Gold gradient
- Size: 36px
- Icon: Award/verified
- Animation: Pulse glow + rotate (4s)

Info Sections:
- Glass-light background
- Border top: Gold accent (1px)
- Icon + Label layout
- Hover: Slight scale + glow
```

### Order History Cards
```
Card Layout: Timeline style
Connector: Gold gradient line (2px)
Status Indicator: Animated dot with pulse

Card Design:
- Background: Glass-light
- Border left: 4px status color
- Shadow: Soft depth
- Border Radius: 16px

Status Badge:
- Floating top-right
- Glass background
- Status color text + border
- Pulse animation for active orders

Artwork Thumbnails:
- Size: 60x60px
- Border Radius: 12px
- Border: 2px gold on hover
- Hover: Scale 1.2 + z-index up + tooltip

Expand Animation:
- Click to expand full details
- Height: auto transition
- Content: Staggered fade-in
- Icon: Rotate 180°
```

### Stats Cards (Dashboard)
```
Layout: 4-column grid (responsive)
Card Size: Equal height, min 200px

Card Design:
- Background: Vibrant gradient (panel-specific)
- Border Radius: 20px
- Padding: 32px
- Shadow: Elevated + glow
- Transform: perspective(1000px)

Icon Container:
- Size: 70px
- Background: rgba(255,255,255,0.2) with blur
- Border Radius: 16px
- Centered icon (32px)
- Float animation

Value Display:
- Font: 48px bold
- Color: White
- Count-up animation on load
- Duration: 2s with easing

Change Indicator:
- Position: Below value
- Color: Success/warning
- Icon: Arrow up/down with animation
- Glow on positive change

Hover Effect:
- Scale: 1.05
- Rotate: -2deg
- Shadow: Intensify
- Glow: Amplify
- Lift: translateZ(20px)
```

---

## 🎯 Interactive Components (Smart Animate)

### Navigation Bar
```
Default State:
- Background: Glass-medium with blur
- Border bottom: Glass border with glow
- Shadow: Soft
- Backdrop filter: 12px blur

Scroll State (scrolled down):
- Background: Increase opacity
- Shadow: Increase depth
- Height: Reduce by 10px
- Transition: all 0.4s ease

Logo:
- Animated gradient text
- Hover: Scale 1.05 + glow pulse

Nav Links:
- Hover: Underline slide-in animation
- Active: Gold color + glow
- Transition: color 0.3s, transform 0.3s

Icons (Cart, Wishlist, etc.):
- Badge: Bounce animation on update
- Hover: Scale 1.15 + glow
- Active: Pulse animation

Mobile Menu:
- Slide from right with blur backdrop
- Staggered link entrance
- Backdrop: Dark with heavy blur
```

### Modal System
```
Backdrop:
- Background: rgba(0,0,0,0.9)
- Backdrop filter: blur(10px)
- Animation: Fade in (300ms)

Modal Container:
- Background: Glass-heavy
- Border: Gold gradient (2px)
- Border Radius: 32px
- Shadow: Ultra-elevated
- Max width: 900px

Entry Animation:
- Scale: 0.8 → 1
- Opacity: 0 → 1
- RotateX: 10deg → 0deg
- Duration: 500ms
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

Exit Animation:
- Scale: 1 → 0.9
- Opacity: 1 → 0
- RotateY: 0deg → 10deg
- Duration: 300ms

Close Button:
- Position: Top-right
- Background: Glass with red tint
- Hover: Rotate 90° + scale 1.1 + glow
```

### Dropdown Menus
```
Container:
- Background: Glass-heavy
- Border Radius: 16px
- Shadow: Elevated
- Border: Glass border with glow

Entry Animation:
- Origin: Top
- Scale: 0.95 → 1
- Opacity: 0 → 1
- TranslateY: -10px → 0px
- Duration: 250ms

Items:
- Staggered entrance (50ms delay each)
- Hover: Background brightens + slide right 5px
- Active: Gold accent + glow

Chevron Icon:
- Rotate: 0deg → 180deg on open
- Duration: 300ms
- Easing: ease-in-out
```

### Toast Notifications
```
Container:
- Position: Fixed top-right
- Stack: Multiple toasts with gap
- Z-index: 9999

Toast Design:
- Background: Glass-heavy
- Border left: 4px status color
- Border Radius: 16px
- Shadow: Elevated + glow
- Width: 360px
- Padding: 20px

Entry Animation:
- TranslateX: 100% → 0%
- Opacity: 0 → 1
- Scale: 0.9 → 1
- Duration: 400ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1)

Exit Animation:
- TranslateX: 0% → 100%
- Opacity: 1 → 0
- Scale: 1 → 0.8
- Duration: 300ms

Progress Bar:
- Width: 100% → 0%
- Background: Gold gradient
- Height: 3px
- Duration: 5s (auto-dismiss)

Icon:
- Size: 24px
- Animated entrance (scale + rotate)
- Color: Status color with glow
```

### Search Bar
```
Default State:
- Width: 200px
- Background: Glass-light
- Border: Glass border
- Border Radius: 9999px

Focus State:
- Width: 350px (expand animation)
- Border: Gold gradient with glow
- Shadow: Elevated
- Backdrop blur: Increase
- Duration: 400ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

Icon:
- Position: Absolute left
- Color: Gold
- Animation: Spin on active search (loading state)

Clear Button:
- Scale: 0 → 1 when text present
- Hover: Rotate 90° + scale 1.2
- Background: Glass with red tint
```

---

## 📱 Mobile Responsive Specifications

### Breakpoints
```
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
Large Desktop: > 1400px
```

### Mobile Adaptations

#### Navigation
- Hamburger menu: 3-line icon with animation
- Menu animation: Slide from right with backdrop
- Links: Full-width buttons
- Icons: Larger touch targets (48x48px min)

#### Cards
- Grid: 1 column (mobile), 2 columns (tablet)
- Reduced 3D effects (performance)
- Simplified shadows
- Touch-friendly hover states

#### AR Studio
- Stack layout (canvas top, controls bottom)
- Gesture controls: Pinch to zoom, drag to move
- Simplified control panel
- Larger interactive elements

#### Typography
- Scale down 30% on mobile
- Increase line-height slightly
- Reduce letter-spacing

#### Animations
- Reduce complexity on mobile
- Disable heavy blur effects if needed
- Use GPU-accelerated transforms only

---

## 🎨 Component Library (Figma)

### Naming Conventions

```
Format: [Category]/[Component]/[Variant]/[State]

Examples:
- Buttons/Primary/Large/Default
- Buttons/Primary/Large/Hover
- Cards/Artwork/Grid/Default
- Cards/Artwork/Grid/Hover
- Navigation/Desktop/Light/Default
- Modals/AR-Studio/Full/Open
```

### Component Organization

```
📁 00-Foundation
   ├── Colors
   ├── Typography
   ├── Shadows
   ├── Grid
   └── Spacing

📁 01-Atoms
   ├── Buttons
   ├── Icons
   ├── Inputs
   ├── Badges
   └── Avatars

📁 02-Molecules
   ├── Cards
   ├── Form-Groups
   ├── Navigation-Items
   └── Stats-Displays

📁 03-Organisms
   ├── Navigation-Bar
   ├── Footer
   ├── Gallery-Grid
   └── Dashboard-Section

📁 04-Templates
   ├── Buyer-Home
   ├── Marketplace
   ├── AR-Studio
   ├── Seller-Dashboard
   └── Admin-Dashboard

📁 05-Animations
   ├── Transitions
   ├── Hover-States
   ├── Loading-States
   └── Micro-Interactions
```

### Auto-Layout Settings
- Use Auto-layout for all components
- Responsive resizing: Hug/Fill appropriately
- Padding: Use variables for consistency
- Gap: Use spacing scale

---

## ⚡ Performance Considerations

### Optimization Notes for Developers

1. **Blur Effects**: Use sparingly on mobile, GPU-accelerate
2. **3D Transforms**: Apply `will-change` property
3. **Animations**: Use `transform` and `opacity` only
4. **Images**: Lazy load, use WebP, compress
5. **Gradients**: Consider static fallbacks for low-end devices
6. **Shadows**: Limit shadow layers on mobile
7. **Backdrop Filter**: Provide fallback for unsupported browsers

---

## 🔌 Export Guidelines

### For Anima/Locofy/Builder.io/Codia

1. **Layer Naming**:
   - Use clear, descriptive names
   - No special characters
   - Follow BEM naming: block__element--modifier

2. **Grouping**:
   - Group related elements
   - Name groups semantically (header, hero-section, card-grid)

3. **Components**:
   - Create master components for reusable elements
   - Use variants for states
   - Document props and usage

4. **Constraints**:
   - Set proper constraints (left, right, top, bottom, center)
   - Use Auto-layout for flexible components

5. **Interactions**:
   - Prototype all interactive states
   - Use Smart Animate for transitions
   - Document gestures and triggers

6. **Annotations**:
   - Add notes for complex animations
   - Document timing and easing functions
   - Specify conditional logic

---

## 📋 Developer Handoff Checklist

- [ ] All screens designed at 3 breakpoints
- [ ] All interactive states prototyped
- [ ] Components organized and named
- [ ] Design tokens documented
- [ ] Animation specs included
- [ ] Accessibility notes added
- [ ] Asset export settings configured
- [ ] Responsive behavior documented
- [ ] Edge cases considered
- [ ] Developer notes for each complex component

---

## 🎬 Animation Timing Reference

```
Micro-interactions: 150-300ms
Component transitions: 300-600ms
Page transitions: 400-800ms
Complex animations: 800-1200ms

Easing Functions:
- Entrance: cubic-bezier(0.16, 1, 0.3, 1) - Spring-like
- Exit: cubic-bezier(0.4, 0, 1, 1) - Sharp
- Hover: cubic-bezier(0.34, 1.56, 0.64, 1) - Bounce
- Standard: cubic-bezier(0.4, 0, 0.2, 1) - Ease in-out
```

---

## 🌈 Gradient Library

### Buyer Panel Gradients
```
BG-1: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)
BG-2: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Accent: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)
```

### Seller Panel Gradients
```
BG-1: linear-gradient(135deg, #2d1b69 0%, #5a3d8a 50%, #8e44ad 100%)
BG-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
Accent: linear-gradient(90deg, #ee9ca7 0%, #ffdde1 100%)
```

### Admin Panel Gradients
```
BG-1: linear-gradient(135deg, #3d2817 0%, #6b4423 50%, #8b5a2b 100%)
BG-2: linear-gradient(135deg, #fa709a 0%, #fee140 100%)
Accent: linear-gradient(90deg, #ff9a56 0%, #ffa756 100%)
```

---

**This specification document should be used as the foundation for creating the Figma design. Every detail has been crafted to ensure a luxury, animated, 3D gallery experience that's ready for React export.**

**Next Steps for Figma Designer:**
1. Set up design system with tokens
2. Create component library with variants
3. Build screens with Smart Animate
4. Prototype all interactions
5. Add developer notes
6. Export via preferred plugin
