# Featured Hero Carousel - Integration Examples

## 🎯 Quick Integration Guide

Here are three ways to integrate the **Featured Hero Carousel** into your blog:

---

## Option 1: Replace HeroSpotlight (Recommended for Maximum Impact)

### Benefits

- ✅ **More engaging** - Full carousel vs single hero
- ✅ **Showcases more content** - 5+ posts vs 1
- ✅ **Better interactivity** - User controls and navigation
- ✅ **Higher engagement** - Autoplay keeps content fresh

### Implementation

**File**: `/components/OptimizedHomepage.jsx`

```jsx
// At the top, import the new component
import {
  PostCard,
  Categories,
  PostWidget,
  FeaturedHeroCarousel, // Add this
  EnhancedFeaturedPostCard,
} from "../components";

// In the render section, replace HeroSpotlight:
<div>
  {/* Featured Hero Carousel - Shows 5 best posts */}
  <FeaturedHeroCarousel
    featuredPosts={data.featuredPosts}
    autoplayInterval={6000}
  />

  {/* Main content */}
  <div className="mb-12 mt-8">{/* Rest of your homepage */}</div>
</div>;
```

---

## Option 2: Use Both (Hero Carousel + Grid Carousel)

### Benefits

- ✅ **Best of both worlds** - Hero impact + more featured content
- ✅ **Maximum content exposure** - Shows even more featured posts
- ✅ **Engaging experience** - Multiple ways to discover content
- ✅ **Professional layout** - Like major news sites

### Implementation

**File**: `/components/OptimizedHomepage.jsx`

```jsx
import {
  PostCard,
  Categories,
  PostWidget,
  FeaturedHeroCarousel,
  EnhancedFeaturedPostCard,
} from "../components";
import { FeaturedPosts } from "../sections";

// In the render section:
<div>
  {/* Hero Carousel - Top 5 posts */}
  <FeaturedHeroCarousel
    featuredPosts={data.featuredPosts.slice(0, 5)}
    autoplayInterval={6000}
  />

  {/* Featured Posts Grid - More featured content */}
  <div className="mb-12">
    <FeaturedPosts />
  </div>

  {/* Main content */}
  <div className="mb-12 mt-8">{/* Latest articles, sidebar, etc. */}</div>
</div>;
```

**Result**:

```
┌─────────────────────────────────────┐
│   HERO CAROUSEL (Full-width)       │
│   Top 5 Featured Posts              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   FEATURED GRID CAROUSEL            │
│   [Card] [Card] [Card]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   LATEST ARTICLES                   │
│   Regular post list                 │
└─────────────────────────────────────┘
```

---

## Option 3: Conditional Display (Smart Layout)

### Benefits

- ✅ **Adaptive** - Shows hero on homepage only
- ✅ **Performance** - Loads only when needed
- ✅ **Flexible** - Easy to toggle on/off
- ✅ **Clean separation** - Different pages can have different heroes

### Implementation

**File**: `/components/OptimizedHomepage.jsx`

```jsx
import {
  PostCard,
  Categories,
  PostWidget,
  HeroSpotlight,
  FeaturedHeroCarousel,
  EnhancedFeaturedPostCard,
} from "../components";

// Add a prop to control which hero to show
export default function OptimizedHomepage({
  initialPosts,
  useHeroCarousel = true, // Default to new carousel
}) {
  // ... existing code ...

  return (
    <HomepageDataContext.Provider value={homepageData}>
      <>
        <HomeSeo featuredPosts={data.featuredPosts.slice(0, 5)} />
        <SchemaManager
          isHomePage
          posts={data.mainPosts.map((post) => post.node)}
        />

        <div>
          {/* Conditional Hero Display */}
          {useHeroCarousel ? (
            <FeaturedHeroCarousel
              featuredPosts={data.featuredPosts.slice(0, 5)}
              autoplayInterval={6000}
            />
          ) : (
            <HeroSpotlight
              featuredPosts={data.featuredPosts}
              isLoading={loading.featuredPosts}
              error={errors.featuredPosts}
            />
          )}

          {/* Main content */}
          <div className="mb-12 mt-8">{/* Rest of homepage */}</div>
        </div>
      </>
    </HomepageDataContext.Provider>
  );
}
```

**Usage in pages/index.jsx:**

```jsx
export default function Home({ initialPosts }) {
  return (
    <OptimizedHomepage
      initialPosts={initialPosts}
      useHeroCarousel={true} // Toggle here
    />
  );
}
```

---

## 🎨 Styling Options

### Adjust Height

In `FeaturedHeroCarousel.jsx`, line 117:

```jsx
// Current (recommended)
className = "relative w-full h-[85vh] min-h-[600px] max-h-[900px]";

// Shorter (more compact)
className = "relative w-full h-[70vh] min-h-[500px] max-h-[800px]";

// Full screen (dramatic)
className = "relative w-full h-[95vh] min-h-[700px] max-h-[1000px]";
```

### Adjust Spacing

Add margin classes to control spacing:

```jsx
<FeaturedHeroCarousel
  featuredPosts={data.featuredPosts}
  autoplayInterval={6000}
  className="mb-8" // Space below
/>
```

### Customize Autoplay

```jsx
<FeaturedHeroCarousel
  featuredPosts={data.featuredPosts}
  autoplayInterval={8000} // 8 seconds per slide
/>
```

---

## 🚀 Quick Start (Copy & Paste)

### 1. Update imports in OptimizedHomepage.jsx

```jsx
import {
  PostCard,
  Categories,
  PostWidget,
  FeaturedHeroCarousel, // Add this line
  EnhancedFeaturedPostCard,
} from "../components";
```

### 2. Replace HeroSpotlight

Find this code (around line 236):

```jsx
{
  /* Hero Spotlight Section */
}
<HeroSpotlight
  featuredPosts={data.featuredPosts}
  isLoading={loading.featuredPosts}
  error={errors.featuredPosts}
/>;
```

Replace with:

```jsx
{
  /* Featured Hero Carousel */
}
<FeaturedHeroCarousel
  featuredPosts={data.featuredPosts}
  autoplayInterval={6000}
/>;
```

### 3. Test

```bash
npm run dev
```

Visit `http://localhost:3000` and see your new hero carousel!

---

## 🎯 Recommended Setup

For the best user experience, we recommend:

```jsx
<div>
  {/* Hero Carousel - Top 5 featured posts */}
  <FeaturedHeroCarousel
    featuredPosts={data.featuredPosts.slice(0, 5)}
    autoplayInterval={6000}
  />

  {/* Optional: Small featured grid below */}
  <div className="container mx-auto px-6 my-12">
    <h2 className="text-3xl font-bold mb-6">More Featured Stories</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.featuredPosts.slice(5, 8).map((post, index) => (
        <EnhancedFeaturedPostCard
          key={post.slug}
          post={post}
          index={index}
          variant="compact"
        />
      ))}
    </div>
  </div>

  {/* Latest Articles */}
  <div className="mb-12 mt-8">{/* Your existing content */}</div>
</div>
```

This gives you:

1. ✅ **Big hero carousel** at the top (5 posts)
2. ✅ **Small featured grid** below (3 more posts)
3. ✅ **Latest articles** section (regular posts)

---

## 🐛 Troubleshooting

### Carousel Not Showing?

Check your data:

```jsx
console.log("Featured Posts:", data.featuredPosts);
console.log("Has featured posts:", data.featuredPosts?.length);
```

### Images Not Loading?

Ensure posts have valid image URLs:

```jsx
data.featuredPosts.forEach((post) => {
  console.log("Post:", post.title, "Image:", post.featuredImage?.url);
});
```

### Build Errors?

Make sure you've imported the component:

```jsx
import { FeaturedHeroCarousel } from "../components";
```

And exported it in `components/index.js`:

```jsx
export { default as FeaturedHeroCarousel } from "./FeaturedHeroCarousel";
```

---

## 📱 Mobile Considerations

The hero carousel automatically adjusts for mobile:

- ✅ **Reduced height** (70vh on mobile)
- ✅ **Touch-friendly controls** (larger buttons)
- ✅ **Optimized text** (responsive font sizes)
- ✅ **Better performance** (optimized animations)

No extra configuration needed!

---

## 🎯 Summary

**Recommended Integration:**

1. **Import** FeaturedHeroCarousel in OptimizedHomepage.jsx
2. **Replace** HeroSpotlight with FeaturedHeroCarousel
3. **Test** on localhost
4. **Enjoy** your new hero slider!

**Code to add:**

```jsx
import { FeaturedHeroCarousel } from "../components";

// Replace HeroSpotlight with:
<FeaturedHeroCarousel
  featuredPosts={data.featuredPosts}
  autoplayInterval={6000}
/>;
```

That's it! 🎉

---

## 📞 Need Help?

- **Demo page**: Visit `/demo/hero-carousel` to see it in action
- **Documentation**: Check `FEATURED_HERO_CAROUSEL_GUIDE.md`
- **Component**: Located at `components/FeaturedHeroCarousel.jsx`
