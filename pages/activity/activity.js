// activity.js
const { api } = require('../../utils/api.js');

Page({
  data: {
    activeTab: 'joined',
    joinedActivities: [],
    createdActivities: [],
    historyActivities: [],
    loading: false
  },

  onLoad: function() {
    // 检查用户是否登录
    const app = getApp();
    console.log('活动模块onLoad - 登录状态:', app.globalData.isLogin);
    console.log('活动模块onLoad - 用户信息:', app.globalData.userInfo);

    if (!app.globalData.isLogin) {
      wx.showModal({
        title: '未登录',
        content: '请先登录',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }
      });
      return;
    }
    console.log('活动模块 - 开始加载活动数据');
    this.loadAllActivities();
  },

  // 转换后端数据格式为前端格式
  transformActivityData: function(activity) {
    // 格式化时间
    let time = '';
    if (activity.start_time) {
      const startTime = new Date(activity.start_time);
      const year = startTime.getFullYear();
      const month = (startTime.getMonth() + 1).toString().padStart(2, '0');
      const day = startTime.getDate().toString().padStart(2, '0');
      const hour = startTime.getHours().toString().padStart(2, '0');
      const minute = startTime.getMinutes().toString().padStart(2, '0');
      time = `${year}/${month}/${day} ${hour}:${minute}`;
    }

    // 转换状态
    let status = 'upcoming';
    if (activity.status === 'active') {
      status = 'upcoming';
    } else if (activity.status === 'ongoing') {
      status = 'ongoing';
    } else if (activity.status === 'completed' || activity.status === 'finished') {
      status = 'completed';
    } else if (activity.status === 'canceled') {
      status = 'canceled';
    }

    // 处理图片URL - 后端返回的是 cover_image_url 字段
    let image = '/images/karaoke1.png';
    const imageSource = activity.cover_image_url || activity.image; // 优先使用 cover_image_url
    if (imageSource) {
      if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
        image = imageSource;
      } else if (imageSource.startsWith('/images/')) {
        image = imageSource;
      } else if (imageSource.startsWith('/uploads/')) {
        image = 'http://localhost:5000' + imageSource;
      }
    }

    const transformedData = {
      id: activity.id,
      title: activity.title || '未知活动',
      time: time,
      location: activity.location || '未知地点',
      status: status,
      currentPeople: activity.current_people || activity.current_participants || 0,
      totalPeople: activity.total_people || activity.max_participants || 0,
      image: image
    };

    return transformedData;
  },

  // 加载所有活动数据
  loadAllActivities: function() {
    console.log('loadAllActivities - 开始执行');
    this.setData({ loading: true });

    // 使用后端提供的专用接口并行获取三个分类的数据
    console.log('loadAllActivities - 调用专用接口获取活动数据');

    Promise.all([
      api.getJoinedActivities().catch(err => {
        console.error('获取已报名活动失败:', err);
        return [];
      }),
      api.getCreatedActivities().catch(err => {
        console.error('获取创建的活动失败:', err);
        return [];
      })
    ]).then(([joinedData, createdData]) => {
      console.log('获取已报名活动成功:', joinedData);
      console.log('获取创建的活动成功:', createdData);

      // 解析已报名活动数据 - 处理嵌套的 data.activities 结构
      let joinedActivities = [];
      let joinedRawData = [];
      if (Array.isArray(joinedData)) {
        joinedRawData = joinedData;
      } else if (joinedData.data && Array.isArray(joinedData.data)) {
        joinedRawData = joinedData.data;
      } else if (joinedData.data && joinedData.data.activities && Array.isArray(joinedData.data.activities)) {
        joinedRawData = joinedData.data.activities;
      } else if (joinedData.activities && Array.isArray(joinedData.activities)) {
        joinedRawData = joinedData.activities;
      }

      console.log('已报名活动原始数据:', joinedRawData);
      joinedActivities = joinedRawData.map(act => this.transformActivityData(act));

      // 解析创建的活动数据 - 处理嵌套的 data.activities 结构
      let createdActivities = [];
      let historyActivities = [];
      let allCreatedRawData = [];

      if (Array.isArray(createdData)) {
        allCreatedRawData = createdData;
      } else if (createdData.data && Array.isArray(createdData.data)) {
        allCreatedRawData = createdData.data;
      } else if (createdData.data && createdData.data.activities && Array.isArray(createdData.data.activities)) {
        allCreatedRawData = createdData.data.activities;
      } else if (createdData.activities && Array.isArray(createdData.activities)) {
        allCreatedRawData = createdData.activities;
      }

      console.log('创建的活动原始数据:', allCreatedRawData);

      // 分类创建的活动：未完成的为"我创建的"，已完成的为"历史活动"
      allCreatedRawData.forEach(activity => {
        const transformed = this.transformActivityData(activity);
        if (transformed.status === 'completed' || transformed.status === 'canceled') {
          historyActivities.push(transformed);
        } else {
          createdActivities.push(transformed);
        }
      });

      this.setData({
        joinedActivities: joinedActivities,
        createdActivities: createdActivities,
        historyActivities: historyActivities,
        loading: false
      });

      console.log('分类后的活动数据:', {
        joined: joinedActivities.length,
        created: createdActivities.length,
        history: historyActivities.length
      });

      // 如果所有分类都是空的，显示提示
      if (joinedActivities.length === 0 && createdActivities.length === 0 && historyActivities.length === 0) {
        console.warn('所有活动分类都是空的');
      }
    }).catch(err => {
      console.error('获取活动列表失败:', err);
      console.error('错误详情:', err.message, err.statusCode);
      // 使用默认数据
      this.setData({
        joinedActivities: [],
        createdActivities: [],
        historyActivities: [],
        loading: false
      });
    });
  },

  // 页面显示时刷新数据
  onShow: function() {
    // 检查用户是否登录
    const app = getApp();
    if (!app.globalData.isLogin) {
      return;
    }
    // 刷新活动列表
    this.loadAllActivities();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadAllActivities();
    wx.stopPullDownRefresh();
  },

  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  // 前往活动详情
  goToActivityDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity/detail?id=${id}`
    })
  },

  // 前往创建活动页面
  goToCreate: function () {
    wx.navigateTo({
      url: '/pages/create/create'
    })
  },

  // 前往报名管理页面
  goToEnrollmentManage: function(e) {
    const activityId = e.currentTarget.dataset.id;
    const activityTitle = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: `/pages/enrollment-manage/enrollment-manage?activityId=${activityId}&activityTitle=${activityTitle}`
    });
  },

  // 取消活动
  cancelActivity: function(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '取消中...'
          });
          
          app.request(`/activities/${id}/cancel`, {}, 'PUT', (err, res) => {
            wx.hideLoading();
            if (!err && res && res.status === 'success') {
              // 从列表中移除该活动
              const updatedActivities = this.data.createdActivities.filter(activity => activity.id !== id);
              this.setData({
                createdActivities: updatedActivities
              });
              
              wx.showToast({
                title: '活动已取消',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '取消失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
})