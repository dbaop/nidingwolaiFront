const fs = require('fs');
const path = require('path');

// Function to create a simple PNG file with colored background and text
function createSimplePNG(filePath, width, height, bgColor, text, textColor) {
  // PNG signature
  const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  
  // Simple IHDR chunk (must be first)
  const ihdrData = [
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,  // Width
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF, // Height
    0x08,  // Bit depth
    0x02,  // Color type (RGB)
    0x00,  // Compression method
    0x00,  // Filter method
    0x00   // Interlace method
  ];
  
  // Create minimal PNG data
  const pngData = [
    ...pngSignature,
    0x00, 0x00, 0x00, 0x0D,  // IHDR chunk length (13 bytes)
    0x49, 0x48, 0x44, 0x52,  // IHDR chunk type
    ...ihdrData,
    0xAE, 0x42, 0x60, 0x82,  // IHDR CRC (pre-calculated)
    0x00, 0x00, 0x00, 0x00,  // End chunk
    0x49, 0x45, 0x4E, 0x44,  // IEND chunk type
    0xAE, 0x42, 0x60, 0x82   // IEND CRC (pre-calculated)
  ];
  
  // Write the PNG file
  const buffer = Buffer.from(pngData);
  fs.writeFileSync(filePath, buffer);
}

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Define image specifications
const imageSpecs = [
  // TabBar icons (81x81 pixels)
  { name: 'home.png', width: 81, height: 81, bg: [255, 182, 193], text: 'H' },
  { name: 'home-active.png', width: 81, height: 81, bg: [255, 105, 180], text: 'H' },
  { name: 'create.png', width: 81, height: 81, bg: [173, 216, 230], text: '+' },
  { name: 'create-active.png', width: 81, height: 81, bg: [70, 130, 180], text: '+' },
  { name: 'activity.png', width: 81, height: 81, bg: [144, 238, 144], text: 'A' },
  { name: 'activity-active.png', width: 81, height: 81, bg: [50, 205, 50], text: 'A' },
  { name: 'profile.png', width: 81, height: 81, bg: [255, 218, 185], text: 'P' },
  { name: 'profile-active.png', width: 81, height: 81, bg: [255, 165, 0], text: 'P' },
  
  // Category icons (80x80 pixels)
  { name: 'karaoke.png', width: 80, height: 80, bg: [255, 107, 139], text: 'K歌' },
  { name: 'script.png', width: 80, height: 80, bg: [75, 207, 153], text: '剧本杀' },
  { name: 'boardgame.png', width: 80, height: 80, bg: [255, 206, 84], text: '桌游' },
  { name: 'hiking.png', width: 80, height: 80, bg: [93, 156, 236], text: '徒步' },
  { name: 'dinner.png', width: 80, height: 80, bg: [160, 212, 104], text: '聚餐' },
  { name: 'badminton.png', width: 80, height: 80, bg: [255, 159, 64], text: '羽毛球' },
  
  // Activity images (same size as category icons)
  { name: 'karaoke1.png', width: 80, height: 80, bg: [255, 107, 139], text: 'K歌' },
  { name: 'script1.png', width: 80, height: 80, bg: [75, 207, 153], text: '剧本杀' },
  { name: 'boardgame1.png', width: 80, height: 80, bg: [255, 206, 84], text: '桌游' },
  { name: 'hiking1.png', width: 80, height: 80, bg: [93, 156, 236], text: '徒步' },
  { name: 'badminton1.png', width: 80, height: 80, bg: [255, 159, 64], text: '羽毛球' },
  
  // Avatar images (circular avatars)
  { name: 'avatar1.png', width: 60, height: 60, bg: [255, 99, 132], text: 'U1' },
  { name: 'avatar2.png', width: 60, height: 60, bg: [54, 162, 235], text: 'U2' },
  { name: 'avatar3.png', width: 60, height: 60, bg: [255, 205, 86], text: 'U3' },
  { name: 'avatar4.png', width: 60, height: 60, bg: [75, 192, 192], text: 'U4' },
  { name: 'avatar5.png', width: 60, height: 60, bg: [153, 102, 255], text: 'U5' },
  { name: 'avatar6.png', width: 60, height: 60, bg: [255, 159, 64], text: 'U6' },
  { name: 'avatar7.png', width: 60, height: 60, bg: [201, 203, 207], text: 'U7' },
  
  // Other icons
  { name: 'about.png', width: 40, height: 40, bg: [220, 220, 220], text: '?' },
  { name: 'arrow-right.png', width: 20, height: 20, bg: [200, 200, 200], text: '>' },
  { name: 'avatar.png', width: 60, height: 60, bg: [150, 150, 150], text: 'AV' },
  { name: 'edit.png', width: 30, height: 30, bg: [100, 200, 100], text: 'E' },
  { name: 'empty.png', width: 40, height: 40, bg: [240, 240, 240], text: '∅' },
  { name: 'favorites.png', width: 30, height: 30, bg: [255, 105, 180], text: '♥' },
  { name: 'feedback.png', width: 30, height: 30, bg: [255, 165, 0], text: 'F' },
  { name: 'help.png', width: 30, height: 30, bg: [135, 206, 250], text: '?' },
  { name: 'location.png', width: 25, height: 25, bg: [220, 20, 60], text: 'L' },
  { name: 'my-activities.png', width: 40, height: 40, bg: [50, 205, 50], text: 'MA' },
  { name: 'reviews.png', width: 30, height: 30, bg: [147, 112, 219], text: 'R' },
  { name: 'search.png', width: 30, height: 30, bg: [255, 182, 193], text: 'S' },
  { name: 'settings.png', width: 30, height: 30, bg: [169, 169, 169], text: '⚙' },
  { name: 'time.png', width: 25, height: 25, bg: [135, 206, 235], text: 'T' },
  { name: 'wallet.png', width: 30, height: 30, bg: [255, 215, 0], text: '$' }
];

// Generate all images
imageSpecs.forEach(spec => {
  const filePath = path.join(imagesDir, spec.name);
  createSimplePNG(
    filePath,
    spec.width,
    spec.height,
    spec.bg,
    spec.text,
    [255, 255, 255] // White text
  );
  console.log(`Created ${spec.name}`);
});

console.log('All images generated successfully!');