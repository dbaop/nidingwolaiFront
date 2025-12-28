const https = require('https');
const fs = require('fs');
const path = require('path');

// 图片URL列表
const imageUrls = [
  // 主题图片 (80x80)
  { url: 'https://via.placeholder.com/80/FF6B8B/FFFFFF?text=K歌', name: 'karaoke.png' },
  { url: 'https://via.placeholder.com/80/4BCF99/FFFFFF?text=剧本杀', name: 'script.png' },
  { url: 'https://via.placeholder.com/80/FFCE54/FFFFFF?text=桌游', name: 'boardgame.png' },
  { url: 'https://via.placeholder.com/80/5D9CEC/FFFFFF?text=爬山', name: 'hiking.png' },
  { url: 'https://via.placeholder.com/80/A0D468/FFFFFF?text=饭局', name: 'dinner.png' },
  
  // 活动图片 (300x200)
  { url: 'https://via.placeholder.com/300x200/FF6B8B/FFFFFF?text=K歌活动', name: 'karaoke1.png' },
  { url: 'https://via.placeholder.com/300x200/4BCF99/FFFFFF?text=剧本杀活动', name: 'script1.png' },
  { url: 'https://via.placeholder.com/300x200/FFCE54/FFFFFF?text=桌游活动', name: 'boardgame1.png' },
  { url: 'https://via.placeholder.com/300x200/5D9CEC/FFFFFF?text=爬山活动', name: 'hiking1.png' },
  
  // TabBar图标 (81x81)
  { url: 'https://via.placeholder.com/81/CCCCCC/666666?text=首页', name: 'home.png' },
  { url: 'https://via.placeholder.com/81/FF6B8B/FFFFFF?text=首页', name: 'home-active.png' },
  { url: 'https://via.placeholder.com/81/CCCCCC/666666?text=创建', name: 'create.png' },
  { url: 'https://via.placeholder.com/81/FF6B8B/FFFFFF?text=创建', name: 'create-active.png' },
  { url: 'https://via.placeholder.com/81/CCCCCC/666666?text=活动', name: 'activity.png' },
  { url: 'https://via.placeholder.com/81/FF6B8B/FFFFFF?text=活动', name: 'activity-active.png' },
  { url: 'https://via.placeholder.com/81/CCCCCC/666666?text=我的', name: 'profile.png' },
  { url: 'https://via.placeholder.com/81/FF6B8B/FFFFFF?text=我的', name: 'profile-active.png' },
  
  // 其他图标 (50x50)
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=编辑', name: 'edit.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=时间', name: 'time.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=位置', name: 'location.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=搜索', name: 'search.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=箭头', name: 'arrow-right.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=我的活动', name: 'my-activities.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=收藏', name: 'favorites.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=评价', name: 'reviews.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=钱包', name: 'wallet.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=设置', name: 'settings.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=帮助', name: 'help.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=反馈', name: 'feedback.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=关于', name: 'about.png' },
  { url: 'https://via.placeholder.com/50/CCCCCC/666666?text=空', name: 'empty.png' },
  
  // 头像图片 (50x50)
  { url: 'https://via.placeholder.com/50/FF6B8B/FFFFFF?text=A', name: 'avatar1.png' },
  { url: 'https://via.placeholder.com/50/4BCF99/FFFFFF?text=B', name: 'avatar2.png' },
  { url: 'https://via.placeholder.com/50/FFCE54/FFFFFF?text=C', name: 'avatar3.png' },
  { url: 'https://via.placeholder.com/50/5D9CEC/FFFFFF?text=D', name: 'avatar4.png' },
  { url: 'https://via.placeholder.com/50/A0D468/FFFFFF?text=E', name: 'avatar5.png' },
  { url: 'https://via.placeholder.com/50/AC92EB/FFFFFF?text=F', name: 'avatar6.png' },
  { url: 'https://via.placeholder.com/50/EC87BF/FFFFFF?text=G', name: 'avatar7.png' },
  { url: 'https://via.placeholder.com/50/4FC1E9/FFFFFF?text=默认', name: 'avatar.png' }
];

// 下载图片函数
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(__dirname, 'temp_images', filename);
    const file = fs.createWriteStream(imagePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`下载完成: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(imagePath, () => {}); // 删除部分下载的文件
      reject(err);
    });
  });
}

// 主函数
async function main() {
  console.log('开始下载图片...');
  
  try {
    for (const image of imageUrls) {
      await downloadImage(image.url, image.name);
    }
    console.log('所有图片下载完成!');
  } catch (error) {
    console.error('下载过程中出现错误:', error);
  }
}

main();