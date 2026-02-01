// 首页逻辑
const imageHelper = require('../../utils/imageHelper.js');
const { api } = require('../../utils/api.js');

Page({
  data: {
    currentCategory: 'k歌',
    searchKeyword: '',
    showJoinModal: false,
    selectedActivity: {},
    joinMessage: '',
    activities: [], // 初始化为空数组，从后端动态加载
    // 图片资源数组
    imageResources: [
      '/images/karaoke1.png',
      '/images/script1.png',
      '/images/boardgame1.png',
      '/images/hiking1.png'
    ],
    avatarResources: [
      '/images/avatar1.png',
      '/images/avatar2.png',
      '/images/avatar3.png',
      '/images/avatar4.png',
      '/images/avatar5.png',
      '/images/avatar6.png',
      '/images/avatar7.png'
    ],
    loading: false,
    error: null
  },

  onLoad: function () {
    console.log('首页加载');
    this.loadActivities();
  },

  // 加载活动数据
  loadActivities: function() {
    this.setData({
      loading: true,
      error: ''
    });

    // 从后端API获取活动列表
    api.getActivities().then(res => {
      console.log('获取到的活动列表:', res);

      // 处理返回的活动数据 - 后端返回格式为 {data: {activities: [...]}, message: "...", status: "success"}
      let activitiesData = [];
      if (Array.isArray(res)) {
        activitiesData = res;
      } else if (res.data && res.data.activities && Array.isArray(res.data.activities)) {
        activitiesData = res.data.activities;
      } else if (res.data && Array.isArray(res.data)) {
        activitiesData = res.data;
      } else if (res.activities && Array.isArray(res.activities)) {
        activitiesData = res.activities;
      }

      console.log('解析后的活动数据数量:', activitiesData.length);
      console.log('活动数据:', activitiesData);

      // 如果没有活动数据，设置为空数组
      if (!activitiesData || activitiesData.length === 0) {
        console.log('没有获取到活动数据');
        this.setData({
          activities: [],
          loading: false
        });
        return;
      }

      // 处理图片路径
      const processedActivities = activitiesData.map(activity => {
        // 格式化时间显示
        const activityTime = activity.start_time ? new Date(activity.start_time) : new Date();
        const formattedTime = `${activityTime.getFullYear()}-${String(activityTime.getMonth() + 1).padStart(2, '0')}-${String(activityTime.getDate()).padStart(2, '0')} ${String(activityTime.getHours()).padStart(2, '0')}:${String(activityTime.getMinutes()).padStart(2, '0')}`;

        // 处理图片URL：后端返回的是 cover_image_url 字段
        let imageUrl = '/images/karaoke1.png'; // 默认图片
        const imageSource = activity.cover_image_url || activity.image; // 优先使用 cover_image_url

        if (imageSource) {
          // 如果是完整的HTTP URL，直接使用
          if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
            imageUrl = imageSource;
          }
          // 如果是本地图片路径（/images/开头），直接使用
          else if (imageSource.startsWith('/images/')) {
            imageUrl = imageSource;
          }
          // 如果是相对路径（/uploads/开头），尝试拼接服务器地址，但如果可能失败则使用默认图片
          else if (imageSource.startsWith('/uploads/')) {
            imageUrl = 'http://localhost:5000' + imageSource;
          }
          // 其他情况，使用默认图片
          else {
            console.warn('无效的图片路径:', imageSource);
            imageUrl = '/images/karaoke1.png';
          }
        }

        console.log('活动:', activity.title, '图片URL:', imageUrl);

        // 处理头像列表
        let avatarUrls = [];
        if (activity.avatars && Array.isArray(activity.avatars)) {
          avatarUrls = activity.avatars.map(avatar => {
            if (!avatar) return '/images/avatar1.png';

            // 如果是完整的HTTP URL
            if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
              return avatar;
            }
            // 如果是本地图片路径
            else if (avatar.startsWith('/images/')) {
              return avatar;
            }
            // 如果是相对路径
            else if (avatar.startsWith('/uploads/')) {
              return 'http://localhost:5000' + avatar;
            }
            // 其他情况，使用默认头像
            else {
              return '/images/avatar1.png';
            }
          });
        }

        // 如果没有头像，使用默认头像
        if (avatarUrls.length === 0) {
          avatarUrls = ['/images/avatar1.png', '/images/avatar2.png'];
        }

        return {
          ...activity,
          // 使用处理后的图片路径
          image: imageUrl,
          avatars: avatarUrls,
          imageWithFallback: imageHelper.getImageUrlWithFallback(imageUrl, true),
          avatarsWithFallback: avatarUrls.map(avatar => imageHelper.getImageUrlWithFallback(avatar, true)),
          // 使用后端返回的时间字段
          time: formattedTime,
          // 使用后端返回的押金金额
          deposit_amount: activity.deposit_amount || 0,
          refundDays: 3,
          // 后端返回的报名状态
          is_enrolled: activity.is_enrolled || false,
          enrollment_status: activity.enrollment_status || null,
          // 映射报名人数字段
          currentPeople: activity.current_participants || 0,
          totalPeople: activity.max_participants || 0,
          // 映射人均费用字段
          price: activity.estimated_cost_per_person || 0
        };
      });

      this.setData({
        activities: processedActivities,
        loading: false
      });

      console.log('处理后的活动数量:', processedActivities.length);
      console.log('设置到页面的活动数据:', processedActivities);
    }).catch(err => {
      console.error('获取活动列表失败:', err);
      console.error('错误详情:', err.message || '未知错误');
      console.error('错误状态码:', err.statusCode || '无');

      // 如果是401错误，跳转到登录页
      if (err.statusCode === 401) {
        wx.showModal({
          title: '提示',
          content: '登录已过期，请重新登录',
          showCancel: false,
          success: () => {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        });
        this.setData({ loading: false });
        return;
      }

      // 如果API请求失败，使用默认数据
      console.log('使用默认活动数据');
      const defaultActivities = [
        {
          id: 1,
          title: '周末K歌局，寻找麦霸队友',
          time: '2025-12-22 19:00',
          location: '附近的KTV',
          currentPeople: 3,
          totalPeople: 8,
          price: 88,
          tags: ['K歌', '周杰伦', '流行音乐'],
          image: '/images/karaoke1.png',
          avatars: ['/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png'],
          deposit_amount: 26
        },
        {
          id: 2,
          title: '剧本杀《年轮》，还差2人',
          time: '2025-12-23 14:00',
          location: 'downtown剧本杀店',
          currentPeople: 4,
          totalPeople: 6,
          price: 128,
          tags: ['剧本杀', '推理', '硬核'],
          image: '/images/script1.png',
          avatars: ['/images/avatar4.png', '/images/avatar5.png', '/images/avatar6.png', '/images/avatar7.png'],
          deposit_amount: 38
        }
      ];

      const activitiesWithFallback = defaultActivities.map(activity => {
        // 处理图片路径，使用默认本地图片
        const image = activity.image || '/images/karaoke1.png';
        const avatars = activity.avatars || ['/images/avatar1.png'];

        return {
          ...activity,
          image: image,
          avatars: avatars,
          imageWithFallback: imageHelper.getImageUrlWithFallback(image, true),
          avatarsWithFallback: avatars.map(avatar => imageHelper.getImageUrlWithFallback(avatar, true)),
          deposit_amount: activity.deposit_amount || 0,
          refundDays: 3
        };
      });

      this.setData({
        activities: activitiesWithFallback,
        loading: false,
        error: err.message || '获取数据失败'
      });
    });
  },

  // 搜索输入事件
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    // 可以在这里实现实时搜索功能
  },

  // 切换活动分类
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    // 可以在这里根据分类筛选活动
    console.log('切换到分类:', category);
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadActivities();
    wx.stopPullDownRefresh();
  },

  // 查看更多活动
  onMoreClick: function() {
    // 跳转到更多活动页面
    console.log('查看更多活动');
    wx.showToast({
      title: '正在跳转...',
      icon: 'loading',
      duration: 500
    });

    // 跳转到活动列表页面
    wx.switchTab({
      url: '/pages/activity/activity',
      fail: (err) => {
        console.error('跳转失败:', err);
        // 如果switchTab失败，尝试navigateTo
        wx.navigateTo({
          url: '/pages/activity/activity',
          fail: (err) => {
            console.error('二次跳转失败:', err);
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 跳转到活动详情页
  goToActivityDetail: function(e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity/detail/detail?id=${activityId}`
    });
  },

  // 显示报名对话框
  showJoinDialog: function(e) {
    const activityId = e.currentTarget.dataset.id;
    const price = e.currentTarget.dataset.price;
    const title = e.currentTarget.dataset.title;

    // 查找活动详情
    const activity = this.data.activities.find(item => item.id === activityId);

    if (activity) {
      // 检查活动时间限制：活动开始前1小时内不允许报名
      const activityTime = new Date(activity.time);
      const now = new Date();
      const timeDiff = activityTime - now;

      if (timeDiff < 60 * 60 * 1000) { // 小于1小时
        wx.showToast({
          title: '活动开始前1小时内不允许报名',
          icon: 'none'
        });
        return;
      }

      this.setData({
        showJoinModal: true,
        selectedActivity: {
          id: activity.id,
          title: title,
          time: activity.time,
          location: activity.location,
          price: price,
          deposit: activity.deposit,
          deposit_amount: activity.deposit_amount, // 后端返回的押金金额
          refundDays: activity.refundDays
        },
        joinMessage: ''
      });
    }
  },

  // 关闭报名对话框
  closeJoinDialog: function() {
    this.setData({
      showJoinModal: false,
      selectedActivity: {},
      joinMessage: ''
    });
  },

  // 输入报名留言
  onMessageInput: function(e) {
    this.setData({
      joinMessage: e.detail.value
    });
  },

  // 确认报名
  confirmJoin: function() {
    const activity = this.data.selectedActivity;
    const message = this.data.joinMessage;

    if (!activity.id) {
      wx.showToast({
        title: '活动信息错误',
        icon: 'error'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...'
    });

    // 调用后端API提交报名申请
    // 确保 activity_id 是整数类型
    const enrollData = {
      activity_id: parseInt(activity.id),
      message: message
    };

    console.log('提交报名数据:', enrollData);
    console.log('Token:', wx.getStorageSync('token'));
    console.log('押金金额:', activity.deposit_amount);

    api.enroll(enrollData).then(res => {
      wx.hideLoading();

      // 根据押金金额决定提示信息
      if (activity.deposit_amount > 0) {
        // 需要支付押金的活动
        wx.showToast({
          title: '报名成功，请完成押金支付',
          icon: 'success',
          duration: 2000
        });
      } else {
        // 无需押金的活动
        wx.showToast({
          title: '报名申请已提交，等待组织者审批',
          icon: 'success',
          duration: 2000
        });
      }

      this.closeJoinDialog();

      // 更新活动人数
      const activities = this.data.activities.map(item => {
        if (item.id === activity.id) {
          return {
            ...item,
            currentPeople: item.currentPeople + 1
          };
        }
        return item;
      });

      this.setData({
        activities: activities
      });
    }).catch(err => {
      wx.hideLoading();

      console.error('报名失败:', err);

      // 如果是401错误，跳转到登录页
      if (err.statusCode === 401) {
        wx.showModal({
          title: '提示',
          content: '登录已过期，请重新登录',
          showCancel: false,
          success: () => {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        });
        return;
      }

      // 根据错误类型显示不同的提示
      if (err.message && err.message.includes('未登录')) {
        wx.showModal({
          title: '提示',
          content: '请先登录后再报名',
          showCancel: false,
          success: () => {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        });
      } else if (err.message && err.message.includes('已报名')) {
        wx.showToast({
          title: '您已经报名过此活动',
          icon: 'none'
        });
        
        // 更新活动列表中的报名状态
        const activities = this.data.activities.map(item => {
          if (item.id === activity.id) {
            return {
              ...item,
              is_enrolled: true,
              enrollment_status: 'approved'
            };
          }
          return item;
        });
        
        this.setData({
          activities: activities
        });
        
        this.closeJoinDialog();
      } else if (err.message && err.message.includes('时间限制')) {
        wx.showToast({
          title: err.message || '报名时间已截止',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: err.message || '报名失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 图片加载错误处理
  onImageError: function(e) {
    const index = e.currentTarget.dataset.idx;
    console.error('图片加载失败，活动索引:', index);

    // 获取当前活动列表
    const activities = this.data.activities;
    if (activities && activities[index]) {
      // 将失败的图片替换为默认图片
      const defaultImage = '/images/karaoke1.png';
      const fallbackUrl = imageHelper.getImageUrlWithFallback(defaultImage, true);

      activities[index].image = defaultImage;
      activities[index].imageWithFallback = fallbackUrl;

      // 更新页面数据
      this.setData({
        [`activities[${index}].image`]: defaultImage,
        [`activities[${index}].imageWithFallback`]: fallbackUrl
      });

      console.log('已替换为默认图片:', defaultImage);
    }
  }

});