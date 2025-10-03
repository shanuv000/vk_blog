# Quick Styling Reference

## 🎨 Common Component Styles

### Modern Card
```jsx
<div className="bg-secondary rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 p-6">
  {/* Content */}
</div>
```

### Primary Button
```jsx
<button className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-primary-dark hover:shadow-glow-sm">
  Click Me
</button>
```

### Secondary Button
```jsx
<button className="inline-flex items-center gap-2 bg-secondary-light text-text-primary px-5 py-2.5 rounded-lg font-medium border border-border transition-all duration-200 hover:bg-secondary hover:border-border-light">
  Click Me
</button>
```

### Section Header
```jsx
<header className="mb-8 text-center">
  <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary">
    <span className="text-gradient">Your Title</span>
  </h2>
  <div className="mt-2 w-24 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full mx-auto"></div>
  <p className="mt-4 text-text-secondary text-base">Your subtitle</p>
</header>
```

### Image with Overlay
```jsx
<div className="relative overflow-hidden rounded-xl">
  <img src="..." alt="..." className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
</div>
```

### Badge
```jsx
<span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs px-2.5 py-1 rounded-md font-semibold">
  Badge Text
</span>
```

### Glass Card
```jsx
<div className="bg-black/60 backdrop-blur-sm border border-border rounded-xl p-4">
  {/* Content */}
</div>
```

## 🎯 Color Classes

### Text Colors
```css
text-text-primary     /* #F5F5F5 - Main text */
text-text-secondary   /* #A0A0A0 - Muted text */
text-text-tertiary    /* #707070 - Subtle text */
text-primary          /* #E50914 - Brand red */
text-gradient         /* Gradient from primary colors */
```

### Background Colors
```css
bg-secondary-dark     /* #0A0A0A - Page background */
bg-secondary          /* #141414 - Card background */
bg-secondary-light    /* #232323 - Elevated surfaces */
bg-primary            /* #E50914 - Primary red */
bg-primary-dark       /* #B81D24 - Darker red */
```

### Border Colors
```css
border-border         /* rgba(255,255,255,0.1) - Default */
border-border-light   /* rgba(255,255,255,0.05) - Subtle */
```

## 📐 Spacing & Sizing

### Padding Classes
```css
p-4      /* 1rem - Small */
p-5      /* 1.25rem - Medium */
p-6      /* 1.5rem - Large */
px-5 py-2.5  /* Button padding */
```

### Margin Classes
```css
mb-6     /* Bottom margin - Medium */
mb-8     /* Bottom margin - Large */
mt-4     /* Top margin - Small */
gap-6    /* Grid/Flex gap */
```

### Rounded Corners
```css
rounded-lg    /* 0.5rem - Standard */
rounded-xl    /* 0.75rem - Large */
rounded-full  /* Full round - Pills, avatars */
```

## 🎭 Effects & Transitions

### Hover Effects
```css
/* Lift on hover */
hover:-translate-y-1

/* Scale on hover */
hover:scale-105

/* Shadow on hover */
hover:shadow-card-hover

/* Color change */
hover:text-primary
hover:bg-primary-dark
```

### Transitions
```css
transition-all duration-200        /* Standard */
transition-colors duration-200     /* Colors only */
transition-transform duration-300  /* Transform only */
```

### Shadows
```css
shadow-card              /* Default card shadow */
shadow-card-hover        /* Elevated card shadow */
shadow-glow             /* Primary color glow */
shadow-glow-sm          /* Small glow */
```

## 📱 Responsive Classes

### Display
```css
hidden lg:block          /* Hide on mobile, show on desktop */
grid md:grid-cols-2      /* 1 col mobile, 2 cols tablet+ */
lg:grid-cols-3          /* 3 cols on large screens */
```

### Text Sizes
```css
text-base md:text-lg lg:text-xl     /* Responsive text */
text-2xl md:text-3xl lg:text-4xl    /* Responsive heading */
```

### Spacing
```css
p-4 md:p-6 lg:p-8       /* Responsive padding */
gap-4 md:gap-6 lg:gap-8 /* Responsive gap */
```

## 🎬 Minimal Animations

### Fade In (use sparingly)
```jsx
<div className="animate-fadeIn">
  {/* Content fades in */}
</div>
```

### Pulse (for live indicators)
```jsx
<div className="animate-pulse">
  {/* Pulses gently */}
</div>
```

## 🔤 Typography

### Headings
```jsx
<h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-text-primary">
  Main Heading
</h1>

<h2 className="text-2xl md:text-4xl font-heading font-bold text-text-primary">
  Section Heading
</h2>

<h3 className="text-xl md:text-3xl font-heading font-bold text-text-primary">
  Subsection
</h3>
```

### Body Text
```jsx
<p className="text-base text-text-secondary leading-relaxed">
  Body paragraph text
</p>
```

### Small Text
```jsx
<span className="text-sm text-text-secondary">
  Small text or caption
</span>
```

## 🎨 Layout Patterns

### Two Column (Content + Sidebar)
```jsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <div className="lg:col-span-8">
    {/* Main content */}
  </div>
  <div className="lg:col-span-4">
    {/* Sidebar */}
  </div>
</div>
```

### Grid of Cards
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

### Flex Row with Space Between
```jsx
<div className="flex items-center justify-between">
  <div>{/* Left content */}</div>
  <div>{/* Right content */}</div>
</div>
```

### Centered Container
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

## ✨ Special Effects

### Backdrop Blur (Glass Effect)
```css
bg-black/60 backdrop-blur-sm
```

### Gradient Text
```css
text-gradient  /* Uses custom class */
/* Or manually: */
bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent
```

### Ring (Focus/Border)
```css
ring-2 ring-border        /* Outline ring */
ring-2 ring-primary       /* Primary color ring */
```

### Line Clamp (Truncate Text)
```css
line-clamp-2    /* Show 2 lines max */
line-clamp-3    /* Show 3 lines max */
```

## 🎯 Best Practices

1. **Use consistent spacing**: Stick to p-4, p-5, p-6 for padding
2. **Limit animations**: Only use on hover or important interactions
3. **Keep transitions fast**: 150-200ms for best UX
4. **Use semantic colors**: text-primary for brand, text-text-primary for content
5. **Responsive first**: Always add md: and lg: breakpoints
6. **Accessibility**: Always include focus states and ARIA labels

## 🚀 Performance Tips

- ✅ Use `transition-colors` instead of `transition-all` when possible
- ✅ Avoid animating expensive properties (width, height)
- ✅ Use `transform` and `opacity` for smooth animations
- ✅ Keep animation duration < 300ms
- ✅ Add `will-change` only when necessary

---

**Quick Copy-Paste Components** - Ready to use!
