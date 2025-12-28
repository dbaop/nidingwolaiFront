const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建images目录如果不存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 图像规格定义
const imageSpecs = [
  // TabBar图标 (81x81)
  { name: 'home.png', width: 81, height: 81, bg: 'ffb6c1', text: 'H' },
  { name: 'home-active.png', width: 81, height: 81, bg: 'ff69b4', text: 'H' },
  { name: 'create.png', width: 81, height: 81, bg: 'add8e6', text: '+' },
  { name: 'create-active.png', width: 81, height: 81, bg: '4682b4', text: '+' },
  { name: 'activity.png', width: 81, height: 81, bg: '90ee90', text: 'A' },
  { name: 'activity-active.png', width: 81, height: 81, bg: '32cd32', text: 'A' },
  { name: 'profile.png', width: 81, height: 81, bg: 'ffdab9', text: 'P' },
  { name: 'profile-active.png', width: 81, height: 81, bg: 'ffa500', text: 'P' },
  
  // 分类图标 (80x80)
  { name: 'karaoke.png', width: 80, height: 80, bg: 'ff6b8b', text: 'K歌' },
  { name: 'script.png', width: 80, height: 80, bg: '4bcf99', text: '剧本杀' },
  { name: 'boardgame.png', width: 80, height: 80, bg: 'ffce54', text: '桌游' },
  { name: 'hiking.png', width: 80, height: 80, bg: '5d9cec', text: '徒步' },
  { name: 'dinner.png', width: 80, height: 80, bg: 'a0d468', text: '聚餐' },
  { name: 'badminton.png', width: 80, height: 80, bg: 'ff9f68', text: '羽毛球' },
  
  // 活动图片 (80x80)
  { name: 'karaoke1.png', width: 80, height: 80, bg: 'ff6b8b', text: 'K歌' },
  { name: 'script1.png', width: 80, height: 80, bg: '4bcf99', text: '剧本杀' },
  { name: 'boardgame1.png', width: 80, height: 80, bg: 'ffce54', text: '桌游' },
  { name: 'hiking1.png', width: 80, height: 80, bg: '5d9cec', text: '徒步' },
  { name: 'badminton1.png', width: 80, height: 80, bg: 'ff9f68', text: '羽毛球' },
  
  // 头像图片 (60x60)
  { name: 'avatar1.png', width: 60, height: 60, bg: 'ff6384', text: 'U1' },
  { name: 'avatar2.png', width: 60, height: 60, bg: '36a2eb', text: 'U2' },
  { name: 'avatar3.png', width: 60, height: 60, bg: 'ffcd56', text: 'U3' },
  { name: 'avatar4.png', width: 60, height: 60, bg: '4bc0c0', text: 'U4' },
  { name: 'avatar5.png', width: 60, height: 60, bg: '9966ff', text: 'U5' },
  { name: 'avatar6.png', width: 60, height: 60, bg: 'ff9f40', text: 'U6' },
  { name: 'avatar7.png', width: 60, height: 60, bg: 'c9cbcf', text: 'U7' },
  
  // 其他图标
  { name: 'about.png', width: 40, height: 40, bg: 'dcdcdc', text: '?' },
  { name: 'arrow-right.png', width: 20, height: 20, bg: 'c8c8c8', text: '>' },
  { name: 'avatar.png', width: 60, height: 60, bg: '969696', text: 'AV' },
  { name: 'edit.png', width: 30, height: 30, bg: '64c864', text: 'E' },
  { name: 'empty.png', width: 40, height: 40, bg: 'f0f0f0', text: '∅' },
  { name: 'favorites.png', width: 30, height: 30, bg: 'ff69b4', text: '♥' },
  { name: 'feedback.png', width: 30, height: 30, bg: 'ffa500', text: 'F' },
  { name: 'help.png', width: 30, height: 30, bg: '87cefa', text: '?' },
  { name: 'location.png', width: 25, height: 25, bg: 'dc143c', text: 'L' },
  { name: 'my-activities.png', width: 40, height: 40, bg: '32cd32', text: 'MA' },
  { name: 'reviews.png', width: 30, height: 30, bg: '9370db', text: 'R' },
  { name: 'search.png', width: 30, height: 30, bg: 'ffb6c1', text: 'S' },
  { name: 'settings.png', width: 30, height: 30, bg: 'a9a9a9', text: '⚙' },
  { name: 'time.png', width: 25, height: 25, bg: '87ceeb', text: 'T' },
  { name: 'wallet.png', width: 30, height: 30, bg: 'ffd700', text: '$' }
];

// 使用Placehold.it服务生成图像URL
function generateImageUrl(spec) {
  // 对于中文文本，我们使用英文替代
  const textMap = {
    'K歌': 'KTV',
    '剧本杀': 'Script',
    '桌游': 'Board',
    '徒步': 'Hike',
    '聚餐': 'Dine',
    '羽毛球': 'Badminton'
  };
  
  const displayText = textMap[spec.text] || spec.text;
  return `https://placehold.co/${spec.width}x${spec.height}/${spec.bg}/FFFFFF?text=${encodeURIComponent(displayText)}`;
}

// 下载图像的函数
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(imagesDir, filename);
    
    // 删除现有的小文件（可能是之前生成的无效文件）
    if (fs.existsSync(imagePath)) {
      const stats = fs.statSync(imagePath);
      if (stats.size <= 50) {  // 如果文件小于等于50字节，认为是无效文件
        fs.unlinkSync(imagePath);
        console.log(`Removed invalid file: ${filename}`);
      } else {
        console.log(`${filename} already exists with sufficient size, skipping...`);
        resolve();
        return;
      }
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
  
  for (const spec of imageSpecs) {
    try {
      const url = generateImageUrl(spec);
      await downloadImage(url, spec.name);
    } catch (error) {
      console.error(`Error downloading ${spec.name}:`, error.message);
    }
  }
  
  console.log('Finished downloading images.');
}

// 运行下载
downloadAllImages();