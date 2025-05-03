// API route to generate a default image when the original image is not available
// This helps avoid 404 errors for missing images

import { createCanvas } from 'canvas';

export default async function handler(req, res) {
  // Set cache headers to improve performance
  res.setHeader('Cache-Control', 'public, immutable, max-age=31536000');
  res.setHeader('Content-Type', 'image/png');

  try {
    // Get image type from query parameter (avatar or featured)
    const { type = 'featured' } = req.query;
    
    // Set dimensions based on image type
    const width = type === 'avatar' ? 100 : 800;
    const height = type === 'avatar' ? 100 : 450;
    
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    if (type === 'avatar') {
      // Avatar style - circular with gradient
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      
      // Create gradient for avatar
      const gradient = ctx.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2, width/2
      );
      gradient.addColorStop(0, '#FF4500');
      gradient.addColorStop(1, '#FF8C00');
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(width/2, height/2, width/2 - 5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw placeholder icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('U', width/2, height/2);
    } else {
      // Featured image style - gradient background with text
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#FF4500');
      gradient.addColorStop(1, '#FF8C00');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('urTechy Blogs', width/2, height/2 - 20);
      
      ctx.font = '24px Arial';
      ctx.fillText('Image not available', width/2, height/2 + 30);
    }
    
    // Convert canvas to buffer and send as response
    const buffer = canvas.toBuffer('image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating default image:', error);
    res.status(500).send('Error generating image');
  }
}
