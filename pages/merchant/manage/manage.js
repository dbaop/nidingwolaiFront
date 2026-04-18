// merchant/manage/manage.js
Page({
  data: {
    userRole: 'user',
    applications: [],
    isLoading: false
  },

  onLoad: function () {
    const app = getApp();

    // 检查用户是否已登录
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      return;
    }

    this.setData({
      userRole: app.globalData.userRole || 'user'
    });

    // 检查权限：管理员或商家可访问
    if (this.data.userRole !== 'admin' && this.data.userRole !== 'merchant') {
      wx.showToast({
        title: '无权访问此页面',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 根据角色加载不同内容
    if (this.data.userRole === 'admin') {
      this.loadMerchantApplications();
    } else {
      this.loadMerchantInfo();
    }
  },

  onShow: function () {
    // 每次显示页面时刷新数据
    if (this.data.userRole === 'admin') {
      this.loadMerchantApplications();
    }
  },

  // 加载商家申请列表（管理员）
  loadMerchantApplications: function () {
    this.setData({ isLoading: true });
    const app = getApp();
    const token = wx.getStorageSync('token');

    wx.request({
      url: app.globalData.config.baseUrl + '/users/merchant-applications',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          this.setData({
            applications: res.data.data.applications || []
          });
        } else {
          wx.showToast({
            title: '获取申请列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取商家申请列表失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 加载商家信息（商家）
  loadMerchantInfo: function () {
    const app = getApp();
    const token = wx.getStorageSync('token');

    wx.request({
      url: app.globalData.config.baseUrl + '/users/me',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          this.setData({
            merchantInfo: res.data.data
          });
        }
      },
      fail: (err) => {
        console.error('获取商家信息失败:', err);
      }
    });
  },

  // 审核商家申请
  reviewApplication: function (e) {
    const userId = e.currentTarget.dataset.userid;
    const action = e.currentTarget.dataset.action;

    wx.showModal({
      title: '确认' + (action === 'approve' ? '通过' : '拒绝'),
      content: action === 'approve' ? '确定通过该商家的申请吗？' : '确定拒绝该商家的申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.doReview(userId, action);
        }
      }
    });
  },

  // 执行审核操作
  doReview: function (userId, action) {
    this.setData({ isLoading: true });
    const app = getApp();
    const token = wx.getStorageSync('token');

    wx.request({
      url: app.globalData.config.baseUrl + '/users/merchant-applications/' + userId,
      method: 'PUT',
      header: {
        'Authorization': 'Bearer ' + token,
        'content-type': 'application/json'
      },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: action === 'approve' ? '已通过' : '已拒绝',
            icon: 'success'
          });
          // 刷新列表
          this.loadMerchantApplications();
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('审核商家申请失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  }
});