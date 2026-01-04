// management.js
Page({
  data: {
    activeTab: 'pending', // pending, approved, rejected
    pendingEnrollments: [],
    approvedEnrollments: [],
    rejectedEnrollments: [],
    loading: false,
    activityId: null,
    activity: null
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
    this.loadAllEnrollments();
  },

  // 加载活动详情
  loadActivityDetail: function() {
    const app = getApp();
    app.request(`/activities/${this.data.activityId}`, {}, 'GET', (err, res) => {
      if (!err && res && res.data) {
        this.setData({ activity: res.data });
      }
    });
  },

  // 加载所有报名记录
  loadAllEnrollments: function() {
    this.setData({ loading: true });
    
    Promise.all([
      this.loadEnrollments('pending'),
      this.loadEnrollments('approved'),
      this.loadEnrollments('rejected')
    ]).finally(() => {
      this.setData({ loading: false });
    });
  },

  // 加载特定状态的报名记录
  loadEnrollments: function(status) {
    return new Promise((resolve) => {
      const app = getApp();
      app.request(`/enrollments/activity/${this.data.activityId}`, {}, 'GET', (err, res) => {
        if (!err && res && res.data) {
          const enrollments = res.data.filter(enrollment => enrollment.status === status);
          this.setData({ [`${status}Enrollments`]: enrollments });
        } else {
          this.setData({ [`${status}Enrollments`]: [] });
        }
        resolve();
      });
    });
  },

  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  // 审批通过
  approveEnrollment: function(e) {
    const enrollmentId = e.currentTarget.dataset.id;
    const app = getApp();
    
    wx.showModal({
      title: '审批通过',
      content: '确定要批准该用户的报名申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          app.request(`/enrollments/${enrollmentId}/approve`, {}, 'PUT', (err, res) => {
            this.setData({ loading: false });
            
            if (!err && res) {
              wx.showToast({
                title: '审批通过成功',
                icon: 'success'
              });
              // 刷新数据
              this.loadAllEnrollments();
              this.loadActivityDetail();
            } else {
              wx.showToast({
                title: '审批失败，请重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 拒绝申请
  rejectEnrollment: function(e) {
    const enrollmentId = e.currentTarget.dataset.id;
    const app = getApp();
    
    wx.showModal({
      title: '拒绝申请',
      content: '确定要拒绝该用户的报名申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          app.request(`/enrollments/${enrollmentId}/reject`, {}, 'PUT', (err, res) => {
            this.setData({ loading: false });
            
            if (!err && res) {
              wx.showToast({
                title: '拒绝申请成功',
                icon: 'success'
              });
              // 刷新数据
              this.loadAllEnrollments();
            } else {
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 返回活动详情
  backToDetail: function() {
    wx.navigateBack();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadAllEnrollments();
    this.loadActivityDetail();
    wx.stopPullDownRefresh();
  }
});