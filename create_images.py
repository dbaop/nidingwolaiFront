# -*- coding: utf-8 -*-
import os
from PIL import Image, ImageDraw, ImageFont

# 图像目录
image_dir = "images"

# 确保目录存在
if not os.path.exists(image_dir):
    os.makedirs(image_dir)

# 图像列表
images = [
    # 导航栏图标
    ("home.png", "首页", (40, 40)),
    ("home-active.png", "首页", (40, 40), (248, 107, 95)),
    ("create.png", "创建", (40, 40)),
    ("create-active.png", "创建", (40, 40), (248, 107, 95)),
    ("activity.png", "活动", (40, 40)),
    ("activity-active.png", "活动", (40, 40), (248, 107, 95)),
    ("profile.png", "我的", (40, 40)),
    ("profile-active.png", "我的", (40, 40), (248, 107, 95)),
    
    # 首页图标
    ("search.png", "🔍", (40, 40)),
    ("karaoke.png", "🎤", (80, 80)),
    ("script.png", "📜", (80, 80)),
    ("boardgame.png", "🎲", (80, 80)),
    ("hiking.png", "⛰️", (80, 80)),
    ("badminton.png", "🏸", (80, 80)),
    ("dinner.png", "🍽️", (80, 80)),
    
    # 活动图片
    ("karaoke1.png", "K歌活动", (200, 200), (248, 107, 95)),
    ("script1.png", "剧本杀", (200, 200), (107, 142, 35)),
    ("boardgame1.png", "桌游", (200, 200), (72, 61, 139)),
    ("badminton1.png", "羽毛球", (200, 200), (30, 144, 255)),
    
    # 其他图标
    ("location.png", "📍", (32, 32)),
    ("empty.png", "空", (180, 180), (192, 192, 192)),
    ("avatar.png", "头像", (140, 140), (200, 200, 200)),
    ("edit.png", "✏️", (28, 28)),
    ("my-activities.png", "📋", (40, 40)),
    ("favorites.png", "❤️", (40, 40)),
    ("reviews.png", "⭐", (40, 40)),
    ("wallet.png", "💰", (40, 40)),
    ("settings.png", "⚙️", (40, 40)),
    ("help.png", "❓", (40, 40)),
    ("feedback.png", "💬", (40, 40)),
    ("about.png", "ℹ️", (40, 40)),
    ("arrow-right.png", "→", (30, 30)),
]

def create_image(filename, text, size, color=(100, 100, 100)):
    # 创建图像
    img = Image.new('RGB', size, color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    try:
        # 使用默认字体
        font = ImageFont.load_default()
        
        # 计算文本位置
        text_width, text_height = draw.textbbox((0, 0), text, font=font)[2:]
        x = (size[0] - text_width) // 2
        y = (size[1] - text_height) // 2
        
        # 绘制文本
        draw.text((x, y), text, fill=color, font=font)
        
        # 保存图像
        img_path = os.path.join(image_dir, filename)
        img.save(img_path)
        print(f"Created image: {img_path}")
        
    except Exception as e:
        print(f"Error creating {filename}: {e}")
        # 如果出现错误，创建一个简单的彩色方块
        img = Image.new('RGB', size, color=color)
        img_path = os.path.join(image_dir, filename)
        img.save(img_path)
        print(f"Created simple image: {img_path}")

# 创建所有图像
for filename, text, size, *color in images:
    color = color[0] if color else (100, 100, 100)
    create_image(filename, text, size, color)

print("All images created successfully!")