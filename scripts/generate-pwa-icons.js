const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// PWA icon sizes
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Additional icons for shortcuts and notifications
const additionalIcons = [
  { size: 72, name: 'badge-72x72.png' },
  { size: 96, name: 'shortcut-book.png' },
  { size: 96, name: 'shortcut-bookings.png' },
  { size: 96, name: 'action-view.png' },
  { size: 96, name: 'action-close.png' }
];

const inputPath = path.join(__dirname, '../public/logos/NewLogoNoBackground.png');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Source logo not found:', inputPath);
      console.log('Please ensure the logo file exists at:', inputPath);
      return;
    }

    console.log('📱 Generating PWA icons from:', inputPath);

    // Generate main PWA icons
    for (const icon of iconSizes) {
      const outputPath = path.join(outputDir, icon.name);
      
      await sharp(inputPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generate additional icons
    for (const icon of additionalIcons) {
      const outputPath = path.join(outputDir, icon.name);
      
      await sharp(inputPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    console.log('🎉 All PWA icons generated successfully!');
    console.log(`📁 Icons saved to: ${outputDir}`);

  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons();



