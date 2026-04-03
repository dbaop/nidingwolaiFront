// profile.js
Page({
  data: {
    userInfo: {
      avatar: '',
      nickname: '',
      bio: '',
      birthday: '',
      gender: 0,
      singing_style: '',
      credit_score: 100
    },
    userStats: {
      joined: 0,
      created: 0,
      friends: 0
    },
    isLogin: false,
    userRole: 'user'
  },

  onLoad: function () {
    // 从全局获取用户信息
    const app = getApp();
    
    // 检查登录状态：只要有isLogin和userInfo就算登录
    if (app.globalData.isLogin && app.globalData.userInfo) {
      this.setData({
        userInfo: {
          avatar: app.globalData.userInfo.avatarUrl || '',
          nickname: app.globalData.userInfo.nickName || '用户'
        },
        isLogin: true,
        userRole: app.globalData.userRole || 'user'
      });
    } else {
      // 强制设置为未登录状态
      this.setData({
        isLogin: false,
        userInfo: {
          avatar: '',
          nickname: '未登录'
        },
        userRole: 'user'
      });
      
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
    const { api } = require('../../utils/api.js');

    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLogin || !app.globalData.userInfo) {
      console.warn('用户未登录，不加载统计数据');
      this.setData({
        userStats: {
          joined: 0,
          created: 0,
          friends: 0
        }
      });
      return;
    }

    // 并行请求已创建和已参加的活动数
    Promise.all([
      api.getCreatedActivities().catch(err => {
        console.error('获取已创建活动失败:', err);
        return { data: { activities: [], pagination: { total: 0 } } };
      }),
      api.getJoinedActivities().catch(err => {
        console.error('获取已参加活动失败:', err);
        return { data: { activities: [], pagination: { total: 0 } } };
      })
    ]).then(([createdRes, joinedRes]) => {
      // 解析创建的活动数据
      let allCreatedActivities = [];
      console.log('解析创建活动数据:', { createdRes });
      
      if (Array.isArray(createdRes)) {
        // 直接返回数组的情况
        allCreatedActivities = createdRes;
      } else if (createdRes && typeof createdRes === 'object') {
        // 对象格式，尝试各种可能的路径
        if (createdRes.data && Array.isArray(createdRes.data)) {
          allCreatedActivities = createdRes.data;
        } else if (createdRes.data && createdRes.data.activities && Array.isArray(createdRes.data.activities)) {
          allCreatedActivities = createdRes.data.activities;
        } else if (createdRes.activities && Array.isArray(createdRes.activities)) {
          allCreatedActivities = createdRes.activities;
        } else if (createdRes && Array.isArray(Object.values(createdRes))) {
          // 尝试对象值数组
          allCreatedActivities = Object.values(createdRes).filter(item => Array.isArray(item))[0] || [];
        }
      }
      
      console.log('解析后的创建活动数据:', allCreatedActivities);

      // 过滤出未完成的活动（不包括已完成和已取消的）
      const activeCreatedActivities = allCreatedActivities.filter(activity => {
        const status = activity.status || 'active';
        return status !== 'completed' && status !== 'finished' && status !== 'canceled';
      });

      // 解析已参加的活动数据
      let allJoinedActivities = [];
      console.log('解析已参加活动数据:', { joinedRes });
      
      if (Array.isArray(joinedRes)) {
        // 直接返回数组的情况
        allJoinedActivities = joinedRes;
      } else if (joinedRes && typeof joinedRes === 'object') {
        // 对象格式，尝试各种可能的路径
        if (joinedRes.data && Array.isArray(joinedRes.data)) {
          allJoinedActivities = joinedRes.data;
        } else if (joinedRes.data && joinedRes.data.activities && Array.isArray(joinedRes.data.activities)) {
          allJoinedActivities = joinedRes.data.activities;
        } else if (joinedRes.activities && Array.isArray(joinedRes.activities)) {
          allJoinedActivities = joinedRes.activities;
        } else if (joinedRes && Array.isArray(Object.values(joinedRes))) {
          // 尝试对象值数组
          allJoinedActivities = Object.values(joinedRes).filter(item => Array.isArray(item))[0] || [];
        }
      }
      
      console.log('解析后的已参加活动数据:', allJoinedActivities);

      // 过滤出未完成的已参加活动
      const activeJoinedActivities = allJoinedActivities.filter(activity => {
        const status = activity.status || 'active';
        return status !== 'completed' && status !== 'finished' && status !== 'canceled';
      });

      this.setData({
        userStats: {
          joined: activeJoinedActivities.length,
          created: activeCreatedActivities.length,
          friends: 0 // 好友数暂未实现
        }
      });
    }).catch(err => {
      console.error('获取用户统计数据失败:', err);
      // 使用默认值
      this.setData({
        userStats: {
          joined: 0,
          created: 0,
          friends: 0
        }
      });
    });
  },

  // 页面显示时检查登录状态并刷新数据
  onShow: function() {
    // 每次显示页面时重新检查登录状态
    const app = getApp();

    // 检查登录状态：只要有isLogin和userInfo就算登录
    if (app.globalData.isLogin && app.globalData.userInfo) {
      this.setData({
        userInfo: {
          avatar: app.globalData.userInfo.avatarUrl || '',
          nickname: app.globalData.userInfo.nickName || '用户'
        },
        isLogin: true,
        userRole: app.globalData.userRole || 'user'
      });

      // 从服务器刷新用户信息
      this.refreshUserInfo();

      // 登录状态下重新加载用户统计数据
      this.loadUserStats();
    } else {
      // 强制设置为未登录状态
      this.setData({
        isLogin: false,
        userInfo: {
          avatar: '',
          nickname: '未登录'
        },
        userRole: 'user'
      });
    }
  },

  // 从服务器刷新用户信息
  refreshUserInfo: function() {
    const app = getApp();
    const token = wx.getStorageSync('token');

    if (!token) return;

    wx.request({
      url: app.globalData.config.baseUrl + '/users/me',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          const userData = res.data.data;
          let avatarUrl = userData.avatar || '';
          // 如果avatar是相对路径，拼接完整URL
          if (avatarUrl && avatarUrl.startsWith('/')) {
            avatarUrl = 'http://localhost:5000' + avatarUrl;
          }
          // 更新全局数据
          app.globalData.userInfo = {
            avatarUrl: avatarUrl,
            nickName: userData.nickname || '用户',
            phone: userData.phone || '',
            bio: userData.bio || '',
            birthday: userData.birthday || '',
            gender: userData.gender || 0,
            singing_style: userData.singing_style || '',
            credit_score: userData.credit_score || 100
          };
          app.globalData.userRole = userData.role || 'user';

          // 更新本地数据
          this.setData({
            userInfo: {
              avatar: avatarUrl,
              nickname: userData.nickname || '用户',
              bio: userData.bio || '',
              birthday: userData.birthday || '',
              gender: userData.gender || 0,
              singing_style: userData.singing_style || '',
              credit_score: userData.credit_score || 100
            },
            userRole: userData.role || 'user'
          });

          // 同时更新统计数据中的信用分
          const stats = this.data.userStats;
          stats.credit_score = userData.credit_score || 100;
          this.setData({ userStats: stats });

          // 同步到 storage
          wx.setStorageSync('userInfo', app.globalData.userInfo);
          wx.setStorageSync('userRole', app.globalData.userRole);
        }
      },
      fail: (err) => {
        console.error('刷新用户信息失败:', err);
      }
    });
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
    });
  },

  // 跳转到评价页面
  goToReviews: function () {
    wx.navigateTo({
      url: '/pages/profile/reviews/reviews'
    });
  },

  // 跳转到登录页面
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 前往我的活动
  goToMyActivities: function () {
    wx.switchTab({
      url: '/pages/activity/activity'
    });
  },

  // 前往收藏
  goToFavorites: function () {
    wx.navigateTo({
      url: '/pages/profile/favorites'
    });
  },



  // 前往钱包
  goToWallet: function () {
    wx.navigateTo({
      url: '/pages/profile/wallet'
    });
  },

  // 前往设置
  goToSettings: function () {
    wx.navigateTo({
      url: '/pages/profile/settings'
    });
  },

  // 前往帮助中心
  goToHelp: function () {
    wx.navigateTo({
      url: '/pages/profile/help'
    });
  },

  // 前往意见反馈
  goToFeedback: function () {
    wx.navigateTo({
      url: '/pages/profile/feedback'
    });
  },

  // 关于我们
  aboutUs: function () {
    wx.navigateTo({
      url: '/pages/profile/about'
    });
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用全局登出方法
          const app = getApp();
          app.logout(() => {
            // 清除页面用户信息并设置为未登录状态
            this.setData({
              isLogin: false,
              userInfo: {
                avatar: '',
                nickname: '未登录'
              },
              userRole: 'user'
            });
            
            // 显示退出成功提示
            wx.showToast({
              title: '已退出登录',
              icon: 'success',
              duration: 1500
            });
            
            // 延迟后刷新页面状态
            setTimeout(() => {
              this.onLoad();
            }, 1500);
          });
        }
      }
    });
  },

  // 申请商家
  applyForMerchant: function () {
    wx.navigateTo({
      url: '/pages/merchant/apply/apply'
    });
  },

  // 商家管理
  goToMerchantManage: function () {
    wx.navigateTo({
      url: '/pages/merchant/manage/manage'
    });
  },

  // 商家审核
  goToMerchantReview: function () {
    wx.navigateTo({
      url: '/pages/merchant/review/review'
    });
  }
});
