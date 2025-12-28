const fs = require('fs');
const path = require('path');
const https = require('https');

// 确保images目录存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 图片下载函数
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`下载完成: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // 删除部分下载的文件
      console.error(`下载失败 ${filename}:`, err.message);
      reject(err);
    });
  });
}

// 需要下载的图片列表
const images = [
  // TabBar图标
  { url: 'https://via.placeholder.com/64x64/FF6B8B/FFFFFF?text=Home', filename: 'home.png' },
  { url: 'https://via.placeholder.com/64x64/FF6B8B/FFFFFF?text=Home+', filename: 'home-active.png' },
  { url: 'https://via.placeholder.com/64x64/CCCCCC/333333?text=Create', filename: 'create.png' },
  { url: 'https://via.placeholder.com/64x64/FF6B8B/FFFFFF?text=Create+', filename: 'create-active.png' },
  { url: 'https://via.placeholder.com/64x64/CCCCCC/333333?text=Activity', filename: 'activity.png' },
  { url: 'https://via.placeholder.com/64x64/FF6B8B/FFFFFF?text=Activity+', filename: 'activity-active.png' },
  { url: 'https://via.placeholder.com/64x64/CCCCCC/333333?text=Profile', filename: 'profile.png' },
  { url: 'https://via.placeholder.com/64x64/FF6B8B/FFFFFF?text=Profile+', filename: 'profile-active.png' },
  
  // 分类图标
  { url: 'https://via.placeholder.com/80x80/FF6B8B/FFFFFF?text=K歌', filename: 'karaoke.png' },
  { url: 'https://via.placeholder.com/80x80/4ECDC4/FFFFFF?text=剧本杀', filename: 'script.png' },
  { url: 'https://via.placeholder.com/80x80/45B7D1/FFFFFF?text=桌游', filename: 'boardgame.png' },
  { url: 'https://via.placeholder.com/80x80/96CEB4/FFFFFF?text=徒步', filename: 'hiking.png' },
  { url: 'https://via.placeholder.com/80x80/FFEAA7/333333?text=羽毛球', filename: 'badminton.png' },
  { url: 'https://via.placeholder.com/80x80/DDA0DD/FFFFFF?text=聚餐', filename: 'dinner.png' },
  
  // 活动图片
  { url: 'https://via.placeholder.com/300x200/FF6B8B/FFFFFF?text=K歌活动', filename: 'karaoke1.png' },
  { url: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=剧本杀活动', filename: 'script1.png' },
  { url: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=桌游活动', filename: 'boardgame1.png' },
  { url: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=徒步活动', filename: 'hiking1.png' },
  { url: 'https://via.placeholder.com/300x200/FFEAA7/333333?text=羽毛球活动', filename: 'badminton1.png' },
  
  // 头像
  { url: 'https://via.placeholder.com/100x100/FF6B8B/FFFFFF?text=头像1', filename: 'avatar1.png' },
  { url: 'https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=头像2', filename: 'avatar2.png' },
  { url: 'https://via.placeholder.com/100x100/45B7D1/FFFFFF?text=头像3', filename: 'avatar3.png' },
  { url: 'https://via.placeholder.com/100x100/96CEB4/FFFFFF?text=头像4', filename: 'avatar4.png' },
  { url: 'https://via.placeholder.com/100x100/FFEAA7/333333?text=头像5', filename: 'avatar5.png' },
  { url: 'https://via.placeholder.com/100x100/DDA0DD/FFFFFF?text=头像6', filename: 'avatar6.png' },
  { url: 'https://via.placeholder.com/100x100/F4A460/FFFFFF?text=头像7', filename: 'avatar7.png' },
  
  // 其他图标
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=→', filename: 'arrow-right.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=定位', filename: 'location.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=时钟', filename: 'time.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=编辑', filename: 'edit.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=搜索', filename: 'search.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=设置', filename: 'settings.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=钱包', filename: 'wallet.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=收藏', filename: 'favorites.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=评价', filename: 'reviews.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=反馈', filename: 'feedback.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=帮助', filename: 'help.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=我的活动', filename: 'my-activities.png' },
  { url: 'https://via.placeholder.com/24x24/CCCCCC/333333?text=关于', filename: 'about.png' },
  { url: 'https://via.placeholder.com/100x100/CCCCCC/333333?text=空状态', filename: 'empty.png' },
  { url: 'https://via.placeholder.com/100x100/CCCCCC/333333?text=默认头像', filename: 'avatar.png' }
];

// 下载所有图片
async function downloadAllImages() {
  console.log('开始下载PNG图片...');
  
  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
      // 添加延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`下载 ${image.filename} 失败:`, error.message);
    }
  }
  
  console.log('所有图片下载完成！');
}

downloadAllImages();