from PIL import Image, ImageDraw, ImageFont
import os

# 创建图片目录
os.makedirs('generated_images', exist_ok=True)

# 颜色定义
colors = {
    'pink': (255, 107, 139),
    'green': (75, 207, 153),
    'yellow': (255, 206, 84),
    'blue': (93, 156, 236),
    'light_green': (160, 212, 104),
    'purple': (172, 146, 235),
    'light_blue': (76, 193, 233),
    'gray': (204, 204, 204),
    'dark_gray': (102, 102, 102),
    'white': (255, 255, 255)
}

# 生成主题图片 (80x80)
def generate_category_image(text, color, filename):
    img = Image.new('RGB', (80, 80), color)
    draw = ImageDraw.Draw(img)
    
    # 绘制文字
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    # 计算文字位置
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (80 - text_width) // 2
    y = (80 - text_height) // 2
    
    draw.text((x, y), text, fill=colors['white'], font=font)
    img.save(f'generated_images/{filename}')

# 生成活动图片 (300x200)
def generate_activity_image(text, color, filename):
    img = Image.new('RGB', (300, 200), color)
    draw = ImageDraw.Draw(img)
    
    # 绘制文字
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    # 计算文字位置
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (300 - text_width) // 2
    y = (200 - text_height) // 2
    
    draw.text((x, y), text, fill=colors['white'], font=font)
    img.save(f'generated_images/{filename}')

# 生成TabBar图标 (81x81)
def generate_tabbar_image(text, color, active_color, filename, active_filename):
    # 非激活状态
    img = Image.new('RGB', (81, 81), color)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (81 - text_width) // 2
    y = (81 - text_height) // 2
    
    draw.text((x, y), text, fill=colors['dark_gray'], font=font)
    img.save(f'generated_images/{filename}')
    
    # 激活状态
    img = Image.new('RGB', (81, 81), active_color)
    draw = ImageDraw.Draw(img)
    
    draw.text((x, y), text, fill=colors['white'], font=font)
    img.save(f'generated_images/{active_filename}')

# 生成其他图标 (50x50)
def generate_icon_image(text, color, filename):
    img = Image.new('RGB', (50, 50), color)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (50 - text_width) // 2
    y = (50 - text_height) // 2
    
    draw.text((x, y), text, fill=colors['dark_gray'], font=font)
    img.save(f'generated_images/{filename}')

# 生成头像图片 (50x50)
def generate_avatar_image(letter, color, filename):
    img = Image.new('RGB', (50, 50), color)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), letter, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (50 - text_width) // 2
    y = (50 - text_height) // 2
    
    draw.text((x, y), letter, fill=colors['white'], font=font)
    img.save(f'generated_images/{filename}')

# 生成所有图片
print("开始生成图片...")

# 主题图片
generate_category_image('K歌', colors['pink'], 'karaoke.png')
generate_category_image('剧本杀', colors['green'], 'script.png')
generate_category_image('桌游', colors['yellow'], 'boardgame.png')
generate_category_image('爬山', colors['blue'], 'hiking.png')
generate_category_image('饭局', colors['light_green'], 'dinner.png')

# 活动图片
generate_activity_image('K歌活动', colors['pink'], 'karaoke1.png')
generate_activity_image('剧本杀活动', colors['green'], 'script1.png')
generate_activity_image('桌游活动', colors['yellow'], 'boardgame1.png')
generate_activity_image('爬山活动', colors['blue'], 'hiking1.png')

# TabBar图标
generate_tabbar_image('首页', colors['gray'], colors['pink'], 'home.png', 'home-active.png')
generate_tabbar_image('创建', colors['gray'], colors['pink'], 'create.png', 'create-active.png')
generate_tabbar_image('活动', colors['gray'], colors['pink'], 'activity.png', 'activity-active.png')
generate_tabbar_image('我的', colors['gray'], colors['pink'], 'profile.png', 'profile-active.png')

# 其他图标
generate_icon_image('编辑', colors['gray'], 'edit.png')
generate_icon_image('时间', colors['gray'], 'time.png')
generate_icon_image('位置', colors['gray'], 'location.png')
generate_icon_image('搜索', colors['gray'], 'search.png')
generate_icon_image('箭头', colors['gray'], 'arrow-right.png')
generate_icon_image('我的活动', colors['gray'], 'my-activities.png')
generate_icon_image('收藏', colors['gray'], 'favorites.png')
generate_icon_image('评价', colors['gray'], 'reviews.png')
generate_icon_image('钱包', colors['gray'], 'wallet.png')
generate_icon_image('设置', colors['gray'], 'settings.png')
generate_icon_image('帮助', colors['gray'], 'help.png')
generate_icon_image('反馈', colors['gray'], 'feedback.png')
generate_icon_image('关于', colors['gray'], 'about.png')
generate_icon_image('空', colors['gray'], 'empty.png')

# 头像图片
generate_avatar_image('A', colors['pink'], 'avatar1.png')
generate_avatar_image('B', colors['green'], 'avatar2.png')
generate_avatar_image('C', colors['yellow'], 'avatar3.png')
generate_avatar_image('D', colors['blue'], 'avatar4.png')
generate_avatar_image('E', colors['light_green'], 'avatar5.png')
generate_avatar_image('F', colors['purple'], 'avatar6.png')
generate_avatar_image('G', colors['light_blue'], 'avatar7.png')
generate_avatar_image('默认', colors['gray'], 'avatar.png')

print("所有图片生成完成!")