// detail.js
Page({
  data: {
    activityId: null,
    activity: null,
    loading: true,
    hasJoined: false,
    enrollmentStatus: null,
    userRole: 'user',
    rating: 0,
    comment: '',
    activityReviews: []
  },

  onLoad: function(options) {
    // 获取活动ID
    const activityId = options.id;
    if (!activityId) {
      wx.showToast({
        title: '活动ID无效',
        icon: 'none',
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }

    this.setData({ activityId: activityId });
    this.loadActivityDetail();
    this.loadActivityReviews();
    this.checkUserStatus();
  },

  // 加载活动详情
  loadActivityDetail: function() {
    this.setData({ loading: true });
    
    const app = getApp();
    app.request(`/activities/${this.data.activityId}`, {}, 'GET', (err, res) => {
      this.setData({ loading: false });
      
      if (!err && res && res.data) {
        const activity = res.data;
        // 确保数字字段有默认值
        activity.current_participants = activity.current_participants || 0;
        activity.max_participants = activity.max_participants || 0;
        activity.deposit_amount = activity.deposit_amount || 0;
        activity.estimated_cost_per_person = activity.estimated_cost_per_person || 0;
        
        // 从活动详情获取报名状态
        const hasJoined = activity.is_enrolled || false;
        const enrollmentStatus = activity.enrollment_status || null;
        
        this.setData({ 
          activity: activity,
          hasJoined: hasJoined,
          enrollmentStatus: enrollmentStatus
        });
      } else {
        wx.showToast({
          title: '加载活动失败',
          icon: 'none',
          success: () => {
            wx.navigateBack();
          }
        });
      }
    });
  },

  // 加载活动评价
  loadActivityReviews: function() {
    const app = getApp();
    app.request(`/reviews/activity/${this.data.activityId}`, {}, 'GET', (err, res) => {
      if (!err && res && res.data) {
        this.setData({ activityReviews: res.data });
      } else {
        console.error('加载活动评价失败:', err);
        this.setData({ activityReviews: [] });
      }
    });
  },

  // 检查用户状态
  checkUserStatus: function() {
    const app = getApp();
    this.setData({
      userRole: app.globalData.userRole || 'user'
    });
  },

  // 申请加入活动
  applyToJoin: function() {
    const app = getApp();
    const activity = this.data.activity;
    
    // 检查是否是活动创建者
    if (activity.organizer_id === app.globalData.userInfo.id) {
      wx.showToast({
        title: '创建者不能加入自己的活动',
        icon: 'none'
      });
      return;
    }

    // 检查活动状态
    if (activity.status !== 'active') {
      wx.showToast({
        title: '活动已结束或已满员',
        icon: 'none'
      });
      return;
    }

    // 检查是否已加入
    if (this.data.hasJoined) {
      wx.showToast({
        title: '您已申请或已加入该活动',
        icon: 'none'
      });
      return;
    }

    // 确认加入并支付押金
    wx.showModal({
      title: '申请加入',
      content: activity.deposit_amount > 0 ? 
        `申请加入需要支付押金${activity.deposit_amount}元\n审批通过后押金将转入对公账户` : 
        '确定要申请加入该活动吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用报名接口
          this.enrollInActivity();
        }
      }
    });
  },

  // 调用报名接口
  enrollInActivity: function() {
    wx.showLoading({
      title: '正在申请...'
    });

    const app = getApp();
    const formData = {
      activity_id: this.data.activityId
    };

    app.request('/enrollments/', formData, 'POST', (err, res) => {
      wx.hideLoading();
      
      if (!err && res && res.data) {
        // 报名成功
        this.setData({
          hasJoined: true,
          enrollmentStatus: 'pending'
        });
        
        wx.showToast({
          title: '申请成功，等待审批',
          icon: 'success'
        });
        
        // 刷新活动详情
        setTimeout(() => {
          this.loadActivityDetail();
        }, 1000);
      } else if (err && err.message && err.message.includes('登录已过期')) {
        // Token过期，跳转到登录页
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
      } else if (res && res.statusCode === 400 && (res.data && res.data.message && res.data.message.includes('already enrolled'))) {
        // 已经报名过，更新状态
        this.setData({
          hasJoined: true,
          enrollmentStatus: 'approved'
        });
        
        wx.showToast({
          title: '您已报名该活动',
          icon: 'none'
        });
        
        // 刷新活动详情
        setTimeout(() => {
          this.loadActivityDetail();
        }, 500);
      } else {
        // 报名失败
        wx.showToast({
          title: res && res.data && res.data.message || err && err.message || '申请失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 选择评分
  selectRating: function(e) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    this.setData({ rating: rating });
  },

  // 输入评论
  onCommentInput: function(e) {
    this.setData({ comment: e.detail.value });
  },

  // 提交评价
  submitReview: function() {
    const app = getApp();
    const activity = this.data.activity;
    
    if (!this.data.rating) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      });
      return;
    }
    
    const formData = {
      to_user_id: activity.organizer_id,
      activity_id: activity.id,
      rating: this.data.rating,
      comment: this.data.comment || ''
    };
    
    app.request('/reviews/', formData, 'POST', (err, res) => {
      if (!err && res && res.data) {
        wx.showToast({
          title: '评价提交成功',
          icon: 'success'
        });
        
        // 清空表单
        this.setData({
          rating: 0,
          comment: ''
        });
      } else {
        wx.showToast({
          title: err && err.message || '评价提交失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 返回活动列表
  backToList: function() {
    wx.navigateBack();
  }
});
