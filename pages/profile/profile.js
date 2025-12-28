// profile.js
Page({
  data: {
    userInfo: {
      avatar: '',
      nickname: ''
    },
    userStats: {
      joined: 5,
      created: 2,
      friends: 12
    },
    isLogin: false,
    userRole: 'user'
  },

  onLoad: function () {
    // 从全局获取用户信息
    const app = getApp()
    
    // 严格检查登录状态：必须有有效的用户信息才算登录
    if (app.globalData.isLogin && app.globalData.userInfo && 
        app.globalData.userInfo.nickName && app.globalData.userInfo.nickName !== '') {
      this.setData({
        userInfo: {
          avatar: app.globalData.userInfo.avatarUrl || '',
          nickname: app.globalData.userInfo.nickName || '用户'
        },
        isLogin: true,
        userRole: app.globalData.userRole || 'user'
      })
    } else {
      // 强制设置为未登录状态
      this.setData({
        isLogin: false,
        userInfo: {
          avatar: '',
          nickname: '未登录'
        },
        userRole: 'user'
      })
      
      // 清除可能存在的无效登录状态
      if (app.globalData.isLogin) {
        app.globalData.isLogin = false;
        app.globalData.userInfo = null;
        app.globalData.userRole = null;
        wx.removeStorageSync('isLogin');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('userRole');
      }
    }
    
    // 获取用户统计数据
    this.loadUserStats();
  },

  // 加载用户统计数据
  loadUserStats: function() {
    // 后端未实现用户统计端点，使用默认值
    this.setData({
      userStats: {
        joined: 0,
        created: 0,
        friends: 0
      }
    });
  },

  // 页面显示时检查登录状态
  onShow: function() {
    // 每次显示页面时重新检查登录状态
    const app = getApp()
    
    // 严格检查登录状态：必须有有效的用户信息才算登录
    if (app.globalData.isLogin && app.globalData.userInfo && 
        app.globalData.userInfo.nickName && app.globalData.userInfo.nickName !== '') {
      this.setData({
        userInfo: {
          avatar: app.globalData.userInfo.avatarUrl || '',
          nickname: app.globalData.userInfo.nickName || '用户'
        },
        isLogin: true,
        userRole: app.globalData.userRole || 'user'
      })
    } else {
      // 强制设置为未登录状态
      this.setData({
        isLogin: false,
        userInfo: {
          avatar: '',
          nickname: '未登录'
        },
        userRole: 'user'
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadUserStats();
    wx.stopPullDownRefresh();
  },

  // 编辑个人资料
  editProfile: function () {
    console.log('编辑资料按钮被点击');
    wx.showToast({
      title: '正在跳转...',
      icon: 'loading',
      duration: 500
    });
    
    wx.navigateTo({
      url: '/pages/profile/edit/edit',
      success: function() {
        console.log('跳转编辑页面成功');
      },
      fail: function(err) {
        console.error('跳转编辑页面失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    })
  },

  // 跳转到登录页面
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 前往我的活动
  goToMyActivities: function () {
    wx.switchTab({
      url: '/pages/activity/activity'
    })
  },

  // 前往收藏
  goToFavorites: function () {
    wx.navigateTo({
      url: '/pages/profile/favorites'
    })
  },

  // 前往评价
  goToReviews: function () {
    wx.navigateTo({
      url: '/pages/profile/reviews'
    })
  },

  // 前往钱包
  goToWallet: function () {
    wx.navigateTo({
      url: '/pages/profile/wallet'
    })
  },

  // 前往设置
  goToSettings: function () {
    wx.navigateTo({
      url: '/pages/profile/settings'
    })
  },

  // 前往帮助中心
  goToHelp: function () {
    wx.navigateTo({
      url: '/pages/profile/help'
    })
  },

  // 前往意见反馈
  goToFeedback: function () {
    wx.navigateTo({
      url: '/pages/profile/feedback'
    })
  },

  // 关于我们
  aboutUs: function () {
    wx.navigateTo({
      url: '/pages/profile/about'
    })
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用全局登出方法
          const app = getApp()
          app.logout(() => {
            // 清除页面用户信息并设置为未登录状态
            this.setData({
              isLogin: false,
              userInfo: {
                avatar: '',
                nickname: '未登录'
              },
              userRole: 'user'
            })
            
            // 显示退出成功提示
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              duration: 1500
            })
            
            // 延迟后刷新页面状态
            setTimeout(() => {
              this.onLoad()
            }, 1500)
          })
        }
      }
    })
  },

  // 申请商家
  applyForMerchant: function () {
    wx.navigateTo({
      url: '/pages/merchant/apply/apply'
    })
  },

  // 商家管理
  goToMerchantManage: function () {
    wx.navigateTo({
      url: '/pages/merchant/manage/manage'
    })
  },

  // 商家审核
  goToMerchantReview: function () {
    wx.navigateTo({
      url: '/pages/merchant/review/review'
    })
  }
})