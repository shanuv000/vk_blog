// Script to test placeholder image loading
const fs = require('fs');
const path = require('path');

// Check if placeholder images exist
const placeholderFeaturedPath = path.join(process.cwd(), 'public/images/placeholder-featured.jpg');
const placeholderAvatarPath = path.join(process.cwd(), 'public/images/placeholder-avatar.jpg');

console.log('Testing placeholder image availability:');

// Check featured image placeholder
try {
  const featuredStats = fs.statSync(placeholderFeaturedPath);
  if (featuredStats.isFile()) {
    console.log('✅ Featured image placeholder exists:', placeholderFeaturedPath);
    console.log('   Size:', Math.round(featuredStats.size / 1024), 'KB');
    
    // Check if it's a valid image file or just a placeholder text file
    if (featuredStats.size < 1000) {
      console.warn('⚠️ Warning: Featured image placeholder is very small, might be a text file instead of an image');
      
      // Read the first few bytes to check
      const buffer = Buffer.alloc(100);
      const fd = fs.openSync(placeholderFeaturedPath, 'r');
      fs.readSync(fd, buffer, 0, 100, 0);
      fs.closeSync(fd);
      
      const content = buffer.toString().trim();
      if (content.startsWith('<!--')) {
        console.error('❌ Error: Featured image placeholder is a text file, not an image!');
        console.log('   Content:', content.substring(0, 50) + '...');
        console.log('   Please replace with a real image file.');
      }
    }
  }
} catch (err) {
  console.error('❌ Featured image placeholder does not exist or cannot be accessed:', err.message);
}

// Check avatar placeholder
try {
  const avatarStats = fs.statSync(placeholderAvatarPath);
  if (avatarStats.isFile()) {
    console.log('✅ Avatar placeholder exists:', placeholderAvatarPath);
    console.log('   Size:', Math.round(avatarStats.size / 1024), 'KB');
    
    // Check if it's a valid image file or just a placeholder text file
    if (avatarStats.size < 1000) {
      console.warn('⚠️ Warning: Avatar placeholder is very small, might be a text file instead of an image');
      
      // Read the first few bytes to check
      const buffer = Buffer.alloc(100);
      const fd = fs.openSync(placeholderAvatarPath, 'r');
      fs.readSync(fd, buffer, 0, 100, 0);
      fs.closeSync(fd);
      
      const content = buffer.toString().trim();
      if (content.startsWith('<!--')) {
        console.error('❌ Error: Avatar placeholder is a text file, not an image!');
        console.log('   Content:', content.substring(0, 50) + '...');
        console.log('   Please replace with a real image file.');
      }
    }
  }
} catch (err) {
  console.error('❌ Avatar placeholder does not exist or cannot be accessed:', err.message);
}

console.log('\nRecommendations:');
console.log('1. Make sure to replace the placeholder text files with actual image files');
console.log('2. Suggested sizes: 800x450px for featured images, 100x100px for avatars');
console.log('3. Use JPG or WebP format for better compression');
console.log('4. Keep file sizes under 100KB for optimal performance');
