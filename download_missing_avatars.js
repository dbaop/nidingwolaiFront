const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建images目录如果不存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 仅下载缺失的头像文件
const avatarUrls = [
  { url: 'https://dummyimage.com/60x60/36A2EB/ffffff&text=U2', name: 'avatar2.png' },
  { url: 'https://dummyimage.com/60x60/9966FF/ffffff&text=U5', name: 'avatar5.png' }
];

// 下载图像的函数
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(imagesDir, filename);
    
    const file = fs.createWriteStream(imagePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
      } else {
        fs.unlink(imagePath, () => {});
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(imagePath, () => {});
      reject(err);
    });
  });
}

// 下载缺失的头像
async function downloadMissingAvatars() {
  console.log('Starting to download missing avatars...');
  
  for (const avatar of avatarUrls) {
    try {
      await downloadImage(avatar.url, avatar.name);
    } catch (error) {
      console.error(`Error downloading ${avatar.name}:`, error.message);
    }
  }
  
  console.log('Finished downloading missing avatars.');
}

downloadMissingAvatars();