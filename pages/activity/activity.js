// activity.js
const { api } = require('../../utils/api.js');

Page({
  data: {
    activeTab: 'joined',
    joinedActivities: [],
    createdActivities: [],
    historyActivities: [],
    loading: false,
    showReviewModal: false,
    reviewActivityId: null,
    reviewActivityTitle: '',
    reviewRating: 0,
    reviewComment: ''
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
      image: image,
      organizer_id: activity.organizer_id || null
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
        console.error('获取我创建的活动失败:', err);
        return [];
      }),
      api.getHistoryActivities().catch(err => {
        console.error('获取历史活动失败:', err);
        return [];
      })
    ]).then(([joinedRes, createdRes, historyRes]) => {
      console.log('loadAllActivities - 接口调用完成');
      
      // 解析已报名活动
      let joinedActivities = [];
      if (Array.isArray(joinedRes)) {
        joinedActivities = joinedRes;
      } else if (joinedRes.data && Array.isArray(joinedRes.data)) {
        joinedActivities = joinedRes.data;
      } else if (joinedRes.data && joinedRes.data.activities && Array.isArray(joinedRes.data.activities)) {
        joinedActivities = joinedRes.data.activities;
      } else if (joinedRes.activities && Array.isArray(joinedRes.activities)) {
        joinedActivities = joinedRes.activities;
      }
      
      // 解析我创建的活动
      let createdActivities = [];
      if (Array.isArray(createdRes)) {
        createdActivities = createdRes;
      } else if (createdRes.data && Array.isArray(createdRes.data)) {
        createdActivities = createdRes.data;
      } else if (createdRes.data && createdRes.data.activities && Array.isArray(createdRes.data.activities)) {
        createdActivities = createdRes.data.activities;
      } else if (createdRes.activities && Array.isArray(createdRes.activities)) {
        createdActivities = createdRes.activities;
      }
      
      // 解析历史活动
      let historyActivities = [];
      if (Array.isArray(historyRes)) {
        historyActivities = historyRes;
      } else if (historyRes.data && Array.isArray(historyRes.data)) {
        historyActivities = historyRes.data;
      } else if (historyRes.data && historyRes.data.activities && Array.isArray(historyRes.data.activities)) {
        historyActivities = historyRes.data.activities;
      } else if (historyRes.activities && Array.isArray(historyRes.activities)) {
        historyActivities = historyRes.activities;
      }
      
      // 转换数据格式
      const transformedJoined = joinedActivities.map(activity => this.transformActivityData(activity));
      const transformedCreated = createdActivities.map(activity => this.transformActivityData(activity));
      const transformedHistory = historyActivities.map(activity => this.transformActivityData(activity));
      
      console.log('loadAllActivities - 数据转换完成');
      
      this.setData({
        joinedActivities: transformedJoined,
        createdActivities: transformedCreated,
        historyActivities: transformedHistory,
        loading: false
      });
      
      console.log('loadAllActivities - 完成');
    }).catch(err => {
      console.error('loadAllActivities - 出现错误:', err);
      this.setData({ loading: false });
    });
  },

  // 显示评价对话框
  showReviewDialog: function(e) {
    const activityId = e.currentTarget.dataset.id;
    const title = e.currentTarget.dataset.title;
    
    this.setData({
      showReviewModal: true,
      reviewActivityId: activityId,
      reviewActivityTitle: title,
      reviewRating: 0,
      reviewComment: ''
    });
  },

  // 选择评分
  selectReviewRating: function(e) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    this.setData({ reviewRating: rating });
  },

  // 输入评论
  onReviewCommentInput: function(e) {
    this.setData({ reviewComment: e.detail.value });
  },

  // 提交评价
  submitReview: function() {
    const app = getApp();
    const { reviewActivityId, reviewRating, reviewComment } = this.data;
    
    if (!reviewRating) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      });
      return;
    }
    
    // 动态获取组织者ID
    const historyActivities = this.data.historyActivities;
    const activity = historyActivities.find(act => act.id === reviewActivityId);
    
    if (!activity || !activity.organizer_id) {
      wx.showToast({
        title: '无法获取活动组织者信息',
        icon: 'none'
      });
      return;
    }
    
    const formData = {
      to_user_id: activity.organizer_id,
      activity_id: reviewActivityId,
      rating: reviewRating,
      comment: reviewComment || ''
    };
    
    app.request('/reviews/', formData, 'POST', (err, res) => {
      if (!err && res && res.data) {
        wx.showToast({
          title: '评价提交成功',
          icon: 'success'
        });
        
        // 更新历史活动列表中的评价状态
        const historyActivities = this.data.historyActivities.map(activity => {
          if (activity.id === reviewActivityId) {
            return {
              ...activity,
              is_reviewed: true
            };
          }
          return activity;
        });
        
        this.setData({
          historyActivities: historyActivities,
          showReviewModal: false,
          reviewActivityId: null,
          reviewActivityTitle: '',
          reviewRating: 0,
          reviewComment: ''
        });
      } else {
        wx.showToast({
          title: err && err.message || '评价提交失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 关闭评价对话框
  closeReviewDialog: function() {
    this.setData({
      showReviewModal: false,
      reviewActivityId: null,
      reviewActivityTitle: '',
      reviewRating: 0,
      reviewComment: ''
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