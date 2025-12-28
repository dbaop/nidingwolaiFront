const fs = require('fs');
const path = require('path');

// 确保images目录存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 创建一个简单的PNG文件头和内容
function createSimplePNG(width, height, r, g, b, text) {
  // PNG文件签名
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);  // 宽度
  ihdrData.writeUInt32BE(height, 4); // 高度
  ihdrData[8] = 8;   // 位深度
  ihdrData[9] = 2;   // 颜色类型 (RGB)
  ihdrData[10] = 0;  // 压缩方法
  ihdrData[11] = 0;  // 过滤方法
  ihdrData[12] = 0;  // 交错方法
  
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0x0D]), // 长度
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.from([ihdrCrc >>> 24, (ihdrCrc >>> 16) & 0xFF, (ihdrCrc >>> 8) & 0xFF, ihdrCrc & 0xFF])
  ]);
  
  // IDAT chunk - 简单的纯色数据
  const pixelData = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixelData.length; i += 3) {
    pixelData[i] = r;     // R
    pixelData[i + 1] = g; // G
    pixelData[i + 2] = b; // B
  }
  
  // 简单的压缩数据 (实际上这不是真正的PNG压缩，只是为了创建一个基本结构)
  const idatData = Buffer.concat([
    Buffer.from([0x78, 0x9C]), // zlib头
    Buffer.from([0x01]), // 简单压缩标志
    pixelData, // 像素数据
    Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00]) // 简单的结束标记
  ]);
  
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), idatData]));
  const idatChunk = Buffer.concat([
    Buffer.from([idatData.length >>> 24, (idatData.length >>> 16) & 0xFF, (idatData.length >>> 8) & 0xFF, idatData.length & 0xFF]),
    Buffer.from('IDAT'),
    idatData,
    Buffer.from([idatCrc >>> 24, (idatCrc >>> 16) & 0xFF, (idatCrc >>> 8) & 0xFF, idatCrc & 0xFF])
  ]);
  
  // IEND chunk
  const iendCrc = crc32(Buffer.from('IEND'));
  const iendChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]), // 长度
    Buffer.from('IEND'),
    Buffer.from([iendCrc >>> 24, (iendCrc >>> 16) & 0xFF, (iendCrc >>> 8) & 0xFF, iendCrc & 0xFF])
  ]);
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 简单的CRC32实现
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crc32Table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// CRC32查找表
const crc32Table = new Array(256);
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  crc32Table[i] = crc;
}

// 需要创建的图片列表
const images = [
  // TabBar图标 - 粉色系
  { name: 'home.png', width: 64, height: 64, r: 255, g: 107, b: 139 },
  { name: 'home-active.png', width: 64, height: 64, r: 255, g: 107, b: 139 },
  { name: 'create.png', width: 64, height: 64, r: 204, g: 204, b: 204 },
  { name: 'create-active.png', width: 64, height: 64, r: 255, g: 107, b: 139 },
  { name: 'activity.png', width: 64, height: 64, r: 204, g: 204, b: 204 },
  { name: 'activity-active.png', width: 64, height: 64, r: 255, g: 107, b: 139 },
  { name: 'profile.png', width: 64, height: 64, r: 204, g: 204, b: 204 },
  { name: 'profile-active.png', width: 64, height: 64, r: 255, g: 107, b: 139 },
  
  // 分类图标 - 不同颜色
  { name: 'karaoke.png', width: 80, height: 80, r: 255, g: 107, b: 139 },
  { name: 'script.png', width: 80, height: 80, r: 78, g: 205, b: 196 },
  { name: 'boardgame.png', width: 80, height: 80, r: 69, g: 183, b: 209 },
  { name: 'hiking.png', width: 80, height: 80, r: 150, g: 206, b: 180 },
  { name: 'badminton.png', width: 80, height: 80, r: 255, g: 234, b: 167 },
  { name: 'dinner.png', width: 80, height: 80, r: 221, g: 160, b: 221 },
  
  // 活动图片
  { name: 'karaoke1.png', width: 300, height: 200, r: 255, g: 107, b: 139 },
  { name: 'script1.png', width: 300, height: 200, r: 78, g: 205, b: 196 },
  { name: 'boardgame1.png', width: 300, height: 200, r: 69, g: 183, b: 209 },
  { name: 'hiking1.png', width: 300, height: 200, r: 150, g: 206, b: 180 },
  { name: 'badminton1.png', width: 300, height: 200, r: 255, g: 234, b: 167 },
  
  // 头像 - 不同颜色
  { name: 'avatar1.png', width: 100, height: 100, r: 255, g: 107, b: 139 },
  { name: 'avatar2.png', width: 100, height: 100, r: 78, g: 205, b: 196 },
  { name: 'avatar3.png', width: 100, height: 100, r: 69, g: 183, b: 209 },
  { name: 'avatar4.png', width: 100, height: 100, r: 150, g: 206, b: 180 },
  { name: 'avatar5.png', width: 100, height: 100, r: 255, g: 234, b: 167 },
  { name: 'avatar6.png', width: 100, height: 100, r: 221, g: 160, b: 221 },
  { name: 'avatar7.png', width: 100, height: 100, r: 244, g: 164, b: 96 },
  { name: 'avatar.png', width: 100, height: 100, r: 204, g: 204, b: 204 },
  
  // 其他图标
  { name: 'arrow-right.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'location.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'time.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'edit.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'search.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'settings.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'wallet.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'favorites.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'reviews.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'feedback.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'help.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'my-activities.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'about.png', width: 24, height: 24, r: 204, g: 204, b: 204 },
  { name: 'empty.png', width: 100, height: 100, r: 204, g: 204, b: 204 }
];

// 创建所有图片
console.log('开始创建PNG图片...');
images.forEach(image => {
  const pngData = createSimplePNG(image.width, image.height, image.r, image.g, image.b, image.name);
  const filePath = path.join(imagesDir, image.name);
  fs.writeFileSync(filePath, pngData);
  console.log(`创建完成: ${image.name}`);
});

console.log('所有图片创建完成！');