const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to create a placeholder image
function createPlaceholderImage(filename, text, backgroundColor = '#6200ee', textColor = 'white') {
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, 400, 400);

  // Add text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 200, 200);

  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(imagesDir, filename), buffer);
}

// Create images for each artifact
createPlaceholderImage('kampilan.jpg', 'Kampilan Sword', '#4CAF50');
createPlaceholderImage('mactan-map.jpg', 'Battle Map', '#2196F3');
createPlaceholderImage('katipunan-flag.jpg', 'Katipunan Flag', '#F44336');
createPlaceholderImage('cedula.jpg', 'Cedula', '#FFC107');
createPlaceholderImage('declaration.jpg', 'Declaration Document', '#9C27B0');
createPlaceholderImage('ph-flag.jpg', 'Philippine Flag', '#FF5722');

console.log('Placeholder images generated successfully!'); 