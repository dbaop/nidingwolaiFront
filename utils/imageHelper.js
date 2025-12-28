// 图片工具函数 - 使用网络图片替代本地图片，支持Base64回退

// 引入Base64图片工具
const base64Images = require('./base64Images.js');

// 图片URL映射表 - 已修正URL格式
const IMAGE_MAP = {
  // 首页图标
  'home.png': 'https://picsum.photos/seed/home/100/100',
  'home-active.png': 'https://picsum.photos/seed/home-active/100/100',
  'create.png': 'https://picsum.photos/seed/create/100/100',
  'create-active.png': 'https://picsum.photos/seed/create-active/100/100',
  'activity.png': 'https://picsum.photos/seed/activity/100/100',
  'activity-active.png': 'https://picsum.photos/seed/activity-active/100/100',
  'profile.png': 'https://picsum.photos/seed/profile/100/100',
  'profile-active.png': 'https://picsum.photos/seed/profile-active/100/100',
  
  // 活动类型图标
  'karaoke.png': 'https://picsum.photos/seed/karaoke/40/40',
  'karaoke1.png': 'https://picsum.photos/seed/karaoke1/300/200',
  'script.png': 'https://picsum.photos/seed/script/40/40',
  'script1.png': 'https://picsum.photos/seed/script1/300/200',
  'boardgame.png': 'https://picsum.photos/seed/boardgame/40/40',
  'boardgame1.png': 'https://picsum.photos/seed/boardgame1/300/200',
  'hiking.png': 'https://picsum.photos/seed/hiking/40/40',
  'hiking1.png': 'https://picsum.photos/seed/hiking1/300/200',
  'dinner.png': 'https://picsum.photos/seed/dinner/40/40',
  
  // 功能图标
  'search.png': 'https://picsum.photos/seed/search/20/20',
  'location.png': 'https://picsum.photos/seed/location/20/20',
  'time.png': 'https://picsum.photos/seed/time/20/20',
  'arrow-right.png': 'https://picsum.photos/seed/arrow/20/20',
  'edit.png': 'https://picsum.photos/seed/edit/20/20',
  'my-activities.png': 'https://picsum.photos/seed/my-activities/30/30',
  'favorites.png': 'https://picsum.photos/seed/favorites/30/30',
  'reviews.png': 'https://picsum.photos/seed/reviews/30/30',
  'wallet.png': 'https://picsum.photos/seed/wallet/30/30',
  'settings.png': 'https://picsum.photos/seed/settings/30/30',
  'help.png': 'https://picsum.photos/seed/help/30/30',
  'feedback.png': 'https://picsum.photos/seed/feedback/30/30',
  
  // 用户头像
  'avatar.png': 'https://picsum.photos/seed/avatar/100/100',
  'avatar1.png': 'https://picsum.photos/seed/avatar1/50/50',
  'avatar2.png': 'https://picsum.photos/seed/avatar2/50/50',
  'avatar3.png': 'https://picsum.photos/seed/avatar3/50/50',
  'avatar4.png': 'https://picsum.photos/seed/avatar4/50/50',
  'avatar5.png': 'https://picsum.photos/seed/avatar5/50/50',
  'avatar6.png': 'https://picsum.photos/seed/avatar6/50/50',
  'avatar7.png': 'https://picsum.photos/seed/avatar7/50/50',
  
  // 其他
  'empty.png': 'https://picsum.photos/seed/empty/200/200'
};

/**
 * 获取图片URL，如果是本地路径则转换为网络URL
 * @param {string} imagePath - 原始图片路径
 * @returns {string} - 处理后的图片URL
 */
function getImageUrl(imagePath) {
  // 如果已经是网络URL，直接返回
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  
  // 如果是本地路径，提取文件名并映射到网络URL
  if (imagePath && imagePath.startsWith('/images/')) {
    const filename = imagePath.substring(8); // 去掉 '/images/' 前缀
    return IMAGE_MAP[filename] || imagePath; // 如果映射不存在，返回原路径
  }
  
  // 其他情况直接返回原路径
  return imagePath;
}

/**
 * 获取图片URL，支持Base64回退
 * @param {string} imagePath - 原始图片路径
 * @param {boolean} useBase64Fallback - 是否使用Base64回退
 * @returns {string} - 处理后的图片URL
 */
function getImageUrlWithFallback(imagePath, useBase64Fallback = true) {
  // 首先尝试获取网络图片URL
  const networkUrl = getImageUrl(imagePath);
  
  // 如果不需要Base64回退，直接返回网络URL
  if (!useBase64Fallback) {
    return networkUrl;
  }
  
  // 如果是本地路径且映射不存在，或者需要强制使用Base64，则使用Base64回退
  if (imagePath && imagePath.startsWith('/images/')) {
    const filename = imagePath.substring(8);
    
    // 如果映射不存在，使用Base64回退
    if (!IMAGE_MAP[filename]) {
      return base64Images.getBase64ImageByFilename(filename);
    }
  }
  
  // 返回网络URL
  return networkUrl;
}

/**
 * 批量处理活动数据中的图片路径
 * @param {Array} activities - 活动列表
 * @returns {Array} - 处理后的活动列表
 */
function processActivityImages(activities) {
  if (!activities || !Array.isArray(activities)) {
    return activities;
  }
  
  return activities.map(activity => {
    const processedActivity = { ...activity };
    
    // 处理活动主图
    if (activity.image) {
      processedActivity.image = getImageUrl(activity.image);
    }
    
    // 处理用户头像列表
    if (activity.avatars && Array.isArray(activity.avatars)) {
      processedActivity.avatars = activity.avatars.map(avatar => getImageUrl(avatar));
    }
    
    return processedActivity;
  });
}

module.exports = {
  getImageUrl,
  getImageUrlWithFallback,
  processActivityImages
};