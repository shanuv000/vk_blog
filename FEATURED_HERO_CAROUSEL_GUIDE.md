# Featured Hero Carousel - Implementation Guide

## 🎯 Overview

The **Featured Hero Carousel** is a premium, full-screen slider that showcases your best content with maximum visual impact. It combines the dramatic presentation of a hero section with smooth carousel functionality.

## ✨ Key Features

### 🎨 Visual Excellence

- **Full-width hero layout** - Commanding presence on your homepage
- **High-quality image backgrounds** - Showcase featured images beautifully
- **Smooth transitions** - Professional slide animations with Framer Motion
- **Gradient overlays** - Perfect text readability on any image
- **Responsive design** - Looks stunning on all devices

### 🎮 Interactive Controls

- **Navigation arrows** - Previous/Next slide buttons
- **Dot indicators** - Visual progress and direct navigation
- **Autoplay toggle** - Play/Pause button for user control
- **Progress bar** - Shows time until next slide
- **Keyboard navigation** - Arrow keys and spacebar support
- **Slide counter** - Shows current position (e.g., "1 / 5")

### 🚀 Performance

- **Optimized images** - Uses Next.js Image optimization
- **Priority loading** - First slide loads immediately
- **Lazy loading** - Other slides load as needed
- **Smooth animations** - Hardware-accelerated transitions

### ♿ Accessibility

- **ARIA labels** - Screen reader friendly
- **Keyboard navigation** - Full keyboard support
- **Semantic HTML** - Proper heading hierarchy
- **Focus management** - Clear focus indicators

## 📦 Installation

The component is already created at:

```
/components/FeaturedHeroCarousel.jsx
```

## 🎯 Usage

### Basic Implementation

```jsx
import FeaturedHeroCarousel from "../components/FeaturedHeroCarousel";

// In your page component
function HomePage({ featuredPosts }) {
  return (
    <div>
      <FeaturedHeroCarousel
        featuredPosts={featuredPosts}
        autoplayInterval={6000}
      />
      {/* Rest of your content */}
    </div>
  );
}
```

### Props

| Prop               | Type     | Default | Description                    |
| ------------------ | -------- | ------- | ------------------------------ |
| `featuredPosts`    | `Array`  | `[]`    | Array of featured post objects |
| `autoplayInterval` | `Number` | `6000`  | Time between slides (ms)       |

### Post Object Structure

```javascript
{
  slug: "post-slug",
  title: "Post Title",
  excerpt: "Brief description of the post",
  createdAt: "2024-01-01T00:00:00Z",
  featuredImage: {
    url: "https://example.com/image.jpg"
  },
  categories: [
    { name: "Category Name" }
  ],
  author: {
    name: "Author Name",
    photo: { url: "https://example.com/avatar.jpg" }
  },
  content: { /* Rich text content */ }
}
```

## 🎨 Customization

### Adjust Height

Edit the section className in `FeaturedHeroCarousel.jsx`:

```jsx
// Current (85% viewport height)
className = "relative w-full h-[85vh] min-h-[600px] max-h-[900px]";

// Shorter (70%)
className = "relative w-full h-[70vh] min-h-[500px] max-h-[800px]";

// Taller (95%)
className = "relative w-full h-[95vh] min-h-[700px] max-h-[1000px]";
```

### Change Autoplay Speed

```jsx
<FeaturedHeroCarousel
  featuredPosts={posts}
  autoplayInterval={8000} // 8 seconds
/>
```

### Customize Colors

Edit the color classes:

```jsx
// Primary color (buttons, badges)
bg-primary → bg-blue-600
text-primary → text-blue-600

// Overlays
bg-black/90 → bg-gray-900/90
```

### Animation Timing

Adjust in the `slideVariants` object:

```javascript
slideVariants: {
  center: {
    transition: {
      duration: 0.7,  // Change to 0.5 for faster, 1.0 for slower
    }
  }
}
```

## 🔧 Integration Options

### Option 1: Replace HeroSpotlight

In your homepage component:

```jsx
// Before
import { HeroSpotlight } from '../components';

// After
import FeaturedHeroCarousel from '../components/FeaturedHeroCarousel';

// Replace
<HeroSpotlight featuredPosts={featuredPosts} />

// With
<FeaturedHeroCarousel featuredPosts={featuredPosts} />
```

### Option 2: Use Both (Recommended)

```jsx
import FeaturedHeroCarousel from "../components/FeaturedHeroCarousel";
import { FeaturedPosts } from "../sections";

function HomePage({ featuredPosts, allPosts }) {
  return (
    <div>
      {/* Hero carousel for top 3-5 posts */}
      <FeaturedHeroCarousel featuredPosts={featuredPosts.slice(0, 5)} />

      {/* Grid carousel for more posts */}
      <FeaturedPosts />

      {/* Rest of content */}
    </div>
  );
}
```

### Option 3: Homepage Only

```jsx
// pages/index.jsx
import FeaturedHeroCarousel from "../components/FeaturedHeroCarousel";

export default function Home() {
  const { featuredPosts } = useHomepageData();

  return (
    <>
      <FeaturedHeroCarousel featuredPosts={featuredPosts} />
      {/* Other homepage sections */}
    </>
  );
}
```

## 🎮 User Controls

### Navigation

- **Arrow Keys**: Left/Right to navigate
- **Spacebar**: Toggle autoplay
- **Mouse**: Click arrows or dots
- **Touch**: Swipe on mobile (if implemented)

### Buttons

- **← →** : Previous/Next slide
- **● ● ●**: Dot navigation (direct access)
- **▶ ❚❚**: Play/Pause autoplay
- **1 / 5**: Current position indicator

## 📱 Responsive Behavior

### Desktop (1024px+)

- Full hero experience
- All controls visible
- Large text sizes
- Side arrows positioned outside

### Tablet (768px - 1023px)

- Slightly reduced height
- Controls positioned inside
- Medium text sizes
- Touch-friendly buttons

### Mobile (< 768px)

- Optimized height (70vh)
- Simplified controls
- Readable text sizes
- Touch-optimized navigation

## 🎯 Best Practices

### Content Selection

- **Choose 3-5 posts** for the hero carousel
- **Use high-quality images** (min 1920x1080)
- **Write compelling excerpts** (2-3 sentences)
- **Update regularly** to keep content fresh

### Image Guidelines

- **Aspect ratio**: 16:9 or wider
- **Resolution**: 1920x1080 or higher
- **File size**: < 500KB (optimized)
- **Format**: JPG or WebP
- **Subject**: Centered or left-aligned

### Performance Tips

- **Limit to 5 slides** for optimal performance
- **Optimize images** before upload
- **Use CDN** for faster delivery
- **Enable lazy loading** for non-visible slides

## 🐛 Troubleshooting

### Carousel Not Showing

```javascript
// Check data
console.log("Posts:", featuredPosts);

// Verify posts have required fields
const validPosts = featuredPosts.filter((p) => p?.slug && p?.title);
console.log("Valid posts:", validPosts.length);
```

### Images Not Loading

```javascript
// Check image URLs
featuredPosts.forEach((post) => {
  console.log("Image:", post.featuredImage?.url);
});

// Fallback is automatically handled
```

### Autoplay Not Working

```javascript
// Check interval value
<FeaturedHeroCarousel
  autoplayInterval={6000} // Should be > 1000
/>

// Check if enough posts
// Autoplay requires > 1 post
```

## 🚀 Advanced Customization

### Add Swipe Support (Mobile)

Install react-swipeable:

```bash
npm install react-swipeable
```

Add to component:

```jsx
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: nextSlide,
  onSwipedRight: prevSlide,
});

// Apply to section
<section {...handlers}>
```

### Add Video Backgrounds

```jsx
{
  currentPost.videoUrl && (
    <video
      autoPlay
      muted
      loop
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src={currentPost.videoUrl} type="video/mp4" />
    </video>
  );
}
```

### Add Particle Effects

```bash
npm install react-tsparticles
```

## 📊 Performance Metrics

### Expected Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Optimization Checklist

- ✅ Images optimized and properly sized
- ✅ Priority loading for first slide
- ✅ Lazy loading for other slides
- ✅ CSS animations GPU-accelerated
- ✅ No layout shift on load

## 🎉 Result

You now have a stunning hero carousel that:

- ✨ Showcases your best content beautifully
- 🎮 Provides intuitive navigation controls
- 📱 Works perfectly on all devices
- 🚀 Loads fast and performs smoothly
- ♿ Is accessible to all users
- 🎨 Can be easily customized

## 🔗 Related Components

- **FeaturedPostCard** - Individual featured post cards
- **FeaturedPosts** - Grid carousel of featured posts
- **HeroSpotlight** - Alternative hero section
- **OptimizedImage** - Image optimization component

## 📞 Support

If you need help or have questions:

1. Check the troubleshooting section
2. Review the code comments
3. Test with demo data
4. Check browser console for errors

---

**Created**: November 16, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
