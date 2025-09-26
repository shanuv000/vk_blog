# Hero Spotlight Component

A modern, full-screen hero section with parallax effects, smooth animations, and glass morphism design elements for featured blog content.

## Features

### 🎨 Visual Design
- **Full-bleed background image** with subtle parallax scrolling
- **Gradient overlay** for optimal text readability
- **Glass morphism effects** on auxiliary cards and UI elements
- **Responsive typography** with text shadows for enhanced legibility
- **Texture overlay** for additional visual depth

### ✨ Interactive Elements
- **Subtle 3D tilt effect** on mouse movement
- **Smooth scroll parallax** background image animation
- **Hover animations** on all interactive elements
- **Animated scroll indicator** with bounce effect
- **Staggered entrance animations** for content elements

### 📱 Content Structure
- **Dominant hero post** with full-screen treatment
- **Category pill** with icon and glass morphism styling
- **Large headline** with custom typography and shadows
- **1-2 line excerpt/dek** for content preview
- **Reading time chip** with clock icon for credibility
- **Call-to-action button** with gradient styling and hover effects
- **Two auxiliary "next up" posts** as stacked mini-cards on the right

### 🚀 Performance Optimizations
- **Lazy loading** for non-critical images
- **Optimized image component** with fallbacks
- **Reduced motion support** for accessibility
- **High contrast mode support**
- **Efficient animation libraries** (Framer Motion)

## Usage

```jsx
import { HeroSpotlight } from '../components';

// In your page component
<HeroSpotlight featuredPosts={featuredPosts} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `featuredPosts` | `Array` | `[]` | Array of featured post objects |

### Post Object Structure

```javascript
{
  slug: "post-slug",
  title: "Post Title",
  excerpt: "Post excerpt or description",
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
  content: { /* Rich text content object */ }
}
```

## Dependencies

- **Framer Motion** (`framer-motion`) - For smooth animations and parallax effects
- **React Icons** (`react-icons/fa`) - For UI icons
- **Moment.js** (`moment`) - For date formatting
- **Next.js Image** - For optimized image loading

## Styling

The component uses CSS modules (`HeroSpotlight.module.css`) for enhanced styling:

- Custom gradient overlays
- Glass morphism effects
- Parallax animation optimizations
- Responsive design breakpoints
- Accessibility support (reduced motion, high contrast)

## Accessibility Features

- **Semantic HTML** structure with proper headings
- **Alt text** for all images
- **Keyboard navigation** support
- **Screen reader** friendly content
- **Reduced motion** preference support
- **High contrast mode** compatibility

## Browser Support

- Modern browsers with CSS Grid support
- Chrome/Edge 57+
- Firefox 52+
- Safari 10.1+

## Performance Notes

- Images are optimized with Next.js Image component
- Animations use `transform` and `opacity` for GPU acceleration
- Parallax effects are throttled for smooth performance
- Lazy loading implemented for below-fold content

## Customization

### Color Scheme
Primary colors can be customized through Tailwind CSS variables:
- `primary` - Main brand color
- `primary-dark` - Darker variant for hover states

### Animation Speed
Animation durations can be modified in the component:
- Container animations: `0.8s`
- Staggered children delay: `0.2s`
- Parallax scroll response: Adjustable in `useTransform` ranges

### Layout
- Hero takes full viewport height (`min-h-screen`)
- Content uses CSS Grid for responsive layout
- Auxiliary posts stack on mobile, side-by-side on desktop

## Integration with CMS

The component works seamlessly with:
- **Hygraph** (formerly GraphCMS)
- **Contentful**
- **Strapi**
- Any headless CMS providing structured content

Just ensure your CMS provides the required post object structure.