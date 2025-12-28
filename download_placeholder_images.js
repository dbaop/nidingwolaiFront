const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建images目录如果不存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 图像URL列表
const imageUrls = [
  // TabBar图标 (81x81)
  { url: 'https://dummyimage.com/81x81/FFB6C1/ffffff&text=H', name: 'home.png' },
  { url: 'https://dummyimage.com/81x81/FF69B4/ffffff&text=H', name: 'home-active.png' },
  { url: 'https://dummyimage.com/81x81/ADD8E6/ffffff&text=+', name: 'create.png' },
  { url: 'https://dummyimage.com/81x81/4682B4/ffffff&text=+', name: 'create-active.png' },
  { url: 'https://dummyimage.com/81x81/90EE90/ffffff&text=A', name: 'activity.png' },
  { url: 'https://dummyimage.com/81x81/32CD32/ffffff&text=A', name: 'activity-active.png' },
  { url: 'https://dummyimage.com/81x81/FFDAB9/ffffff&text=P', name: 'profile.png' },
  { url: 'https://dummyimage.com/81x81/FFA500/ffffff&text=P', name: 'profile-active.png' },
  
  // 分类图标 (80x80)
  { url: 'https://dummyimage.com/80x80/FF6B8B/ffffff&text=K歌', name: 'karaoke.png' },
  { url: 'https://dummyimage.com/80x80/4BCF99/ffffff&text=剧本杀', name: 'script.png' },
  { url: 'https://dummyimage.com/80x80/FFCE54/ffffff&text=桌游', name: 'boardgame.png' },
  { url: 'https://dummyimage.com/80x80/5D9CEC/ffffff&text=徒步', name: 'hiking.png' },
  { url: 'https://dummyimage.com/80x80/A0D468/ffffff&text=聚餐', name: 'dinner.png' },
  
  // 活动图片 (80x80)
  { url: 'https://dummyimage.com/80x80/FF6B8B/ffffff&text=K歌', name: 'karaoke1.png' },
  { url: 'https://dummyimage.com/80x80/4BCF99/ffffff&text=剧本杀', name: 'script1.png' },
  { url: 'https://dummyimage.com/80x80/FFCE54/ffffff&text=桌游', name: 'boardgame1.png' },
  { url: 'https://dummyimage.com/80x80/5D9CEC/ffffff&text=徒步', name: 'hiking1.png' },
  
  // 头像图片 (60x60)
  { url: 'https://dummyimage.com/60x60/FF6384/ffffff&text=U1', name: 'avatar1.png' },
  { url: 'https://dummyimage.com/60x60/36A2EB/ffffff&text=U2', name: 'avatar2.png' },
  { url: 'https://dummyimage.com/60x60/FFCD56/ffffff&text=U3', name: 'avatar3.png' },
  { url: 'https://dummyimage.com/60x60/4BC0C0/ffffff&text=U4', name: 'avatar4.png' },
  { url: 'https://dummyimage.com/60x60/9966FF/ffffff&text=U5', name: 'avatar5.png' },
  { url: 'https://dummyimage.com/60x60/FF9F40/ffffff&text=U6', name: 'avatar6.png' },
  { url: 'https://dummyimage.com/60x60/C9CBcf/ffffff&text=U7', name: 'avatar7.png' }
];

// 下载图像的函数
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(imagesDir, filename);
    
    // 检查文件是否已存在且非空
    if (fs.existsSync(imagePath) && fs.statSync(imagePath).size > 0) {
      console.log(`${filename} already exists and is not empty, skipping...`);
      resolve();
      return;
    }
    
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
        // 如果请求失败，删除部分下载的文件
        fs.unlink(imagePath, () => {});
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      // 如果请求失败，删除部分下载的文件
      fs.unlink(imagePath, () => {});
      reject(err);
    });
  });
}

// 下载所有图像
async function downloadAllImages() {
  console.log('Starting to download images...');
  
  for (const image of imageUrls) {
    try {
      await downloadImage(image.url, image.name);
    } catch (error) {
      console.error(`Error downloading ${image.name}:`, error.message);
    }
  }
  
  console.log('Finished downloading images.');
}

// 运行下载
downloadAllImages();