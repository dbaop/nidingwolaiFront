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
    activities: [
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
        avatars: ['/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png']
      },
      {
        id: 2,
        title: '剧本杀《年轮》，还差2人',
        time: '2025-12-23 14:00',
        location: ' downtown剧本杀店',
        currentPeople: 4,
        totalPeople: 6,
        price: 128,
        tags: ['剧本杀', '推理', '硬核'],
        image: '/images/script1.png',
        avatars: ['/images/avatar4.png', '/images/avatar5.png', '/images/avatar6.png', '/images/avatar7.png']
      },
      {
        id: 3,
        title: '桌游局，狼人杀等你来',
        time: '2025-12-21 20:00',
        location: '桌游吧',
        currentPeople: 7,
        totalPeople: 12,
        price: 58,
        tags: ['桌游', '狼人杀', '社交'],
        image: '/images/boardgame1.png',
        avatars: ['/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png', '/images/avatar4.png', '/images/avatar5.png', '/images/avatar6.png', '/images/avatar7.png']
      },
      {
        id: 4,
        title: '周日爬山，寻找同行伙伴',
        time: '2025-12-24 09:00',
        location: 'XX山脚下',
        currentPeople: 5,
        totalPeople: 10,
        price: 0,
        tags: ['爬山', '运动', '户外'],
        image: '/images/hiking1.png',
        avatars: ['/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png', '/images/avatar4.png', '/images/avatar5.png']
      }
    ],
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
    
    // 使用默认活动数据，并处理图片路径
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
        avatars: ['/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png']
      },
      {
        id: 2,
        title: '剧本杀《年轮》，还差2人',
        time: '2025-12-23 14:00',
        location: ' downtown剧本杀店',
        currentPeople: 4,
        totalPeople: 6,
        price: 128,
        tags: ['剧本杀', '推理', '硬核'],
        image: '/images/script1.png',
        avatars: ['/images/avatar4.png', '/images/avatar5.png', '/images/avatar6.png', '/images/avatar7.png']
      },
      {
        id: 3,
        title: '桌游局，狼人杀等你来',
        time: '2025-12-21 20:00',
        location: '桌游吧',
        currentPeople: 7,
        totalPeople: 12,
        price: 58,
        tags: ['桌游', '狼人杀', '社交'],
        image: '/images/boardgame1.png',
        avatars: ['/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png', '/images/avatar4.png', '/images/avatar5.png', '/images/avatar6.png', '/images/avatar7.png']
      },
      {
        id: 4,
        title: '周日爬山，寻找同行伙伴',
        time: '2025-12-24 09:00',
        location: 'XX山脚下',
        currentPeople: 5,
        totalPeople: 10,
        price: 0,
        tags: ['爬山', '户外', '健身'],
        image: '/images/hiking1.png',
        avatars: ['/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png', '/images/avatar4.png', '/images/avatar5.png']
      }
    ];
    
    // 使用图片工具处理活动数据中的图片路径，启用Base64回退
    const processedActivities = imageHelper.processActivityImages(defaultActivities);
    
    // 为每个活动添加带有Base64回退的图片URL和押金信息
    const activitiesWithFallback = processedActivities.map(activity => {
      return {
        ...activity,
        imageWithFallback: imageHelper.getImageUrlWithFallback(activity.image, true),
        avatarsWithFallback: activity.avatars.map(avatar => imageHelper.getImageUrlWithFallback(avatar, true)),
        deposit: Math.floor(activity.price * 0.3), // 押金为价格的30%
        refundDays: 3 // 默认3天前可退款
      };
    });
    
    this.setData({
      activities: activitiesWithFallback,
      loading: false
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
      this.setData({
        showJoinModal: true,
        selectedActivity: {
          id: activity.id,
          title: title,
          time: activity.time,
          location: activity.location,
          price: price,
          deposit: activity.deposit,
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

    api.enroll(enrollData).then(res => {
      wx.hideLoading();

      wx.showToast({
        title: '报名申请已提交，等待组织者审批',
        icon: 'success',
        duration: 2000
      });

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
      } else {
        wx.showToast({
          title: err.message || '报名失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }


});