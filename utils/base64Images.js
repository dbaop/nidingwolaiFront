// Base64图片工具 - 提供简单的Base64编码图片作为替代方案

// 简单的Base64编码图片
const BASE64_IMAGES = {
  // 红色方块
  'red-square': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  
  // 蓝色方块
  'blue-square': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mGkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  
  // 绿色方块
  'green-square': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  
  // 灰色方块
  'gray-square': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  
  // 简单的图标占位符
  'icon-placeholder': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAybDYgNm02IDZ2NmgtNHYtMTEiLz48cGF0aCBkPSJNOCAxM2g4Ii8+PC9zdmc+',
  
  // 简单的头像占位符
  'avatar-placeholder': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+'
};

/**
 * 获取Base64图片
 * @param {string} type - 图片类型
 * @returns {string} - Base64图片URL
 */
function getBase64Image(type) {
  return BASE64_IMAGES[type] || BASE64_IMAGES['gray-square'];
}

/**
 * 根据文件名获取对应的Base64图片
 * @param {string} filename - 文件名
 * @returns {string} - Base64图片URL
 */
function getBase64ImageByFilename(filename) {
  if (!filename) return BASE64_IMAGES['gray-square'];
  
  // 根据文件名映射到对应的Base64图片
  if (filename.includes('avatar')) {
    return BASE64_IMAGES['avatar-placeholder'];
  } else if (filename.includes('home') || filename.includes('create') || filename.includes('activity') || filename.includes('profile')) {
    return BASE64_IMAGES['blue-square'];
  } else if (filename.includes('karaoke') || filename.includes('script') || filename.includes('boardgame')) {
    return BASE64_IMAGES['green-square'];
  } else if (filename.includes('search') || filename.includes('location') || filename.includes('time') || filename.includes('edit')) {
    return BASE64_IMAGES['icon-placeholder'];
  } else {
    return BASE64_IMAGES['gray-square'];
  }
}

module.exports = {
  getBase64Image,
  getBase64ImageByFilename
};