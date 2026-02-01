// app.js - 小程序全局逻辑
App({
  // 全局数据
  globalData: {
    userInfo: null,
    isLogin: false,
    userRole: null, // 用户角色：user(用户), merchant(商家), admin(管理员)
    // 全局配置
    config: {
      baseUrl: 'http://localhost:5000/api', // 后端API地址 (D:\resources\flaskproject\nidingwolai)
      primaryColor: '#FF6B8B',
      pageSize: 10 // 默认分页大小
    }
  },

  // 小程序初始化完成时触发
  onLaunch: function () {
    console.log('小程序初始化完成');
    
    // 初始化用户登录状态
    this.initUserLogin();
    
    // 初始化全局数据
    this.initGlobalData();
    
    // 注册全局错误监听
    this.registerGlobalErrorHandler();
  },

  // 小程序启动，或从后台进入前台显示时触发
  onShow: function (options) {
    console.log('小程序显示', options);
    
    // 检查是否需要更新
    this.checkUpdateVersion();
  },

  // 小程序从前台进入后台时触发
  onHide: function () {
    console.log('小程序隐藏');
  },

  // 初始化用户登录状态
  initUserLogin: function () {
    // 尝试从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const isLogin = wx.getStorageSync('isLogin');
    const userRole = wx.getStorageSync('userRole');
    
    // 严格验证登录状态：必须有有效的用户信息才算登录
    if (userInfo && isLogin && userInfo.nickName && userInfo.nickName !== '') {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = isLogin;
      this.globalData.userRole = userRole || 'user'; // 默认为普通用户
    } else {
      // 如果登录状态无效，强制清除
      this.globalData.userInfo = null;
      this.globalData.isLogin = false;
      this.globalData.userRole = null;
      
      // 清除本地存储中的无效登录状态
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('isLogin');
      wx.removeStorageSync('userRole');
      wx.removeStorageSync('token');
    }
  },

  // 初始化全局数据
  initGlobalData: function () {
    // 设置默认的用户信息
    this.globalData.userInfo = {
      avatarUrl: '',
      nickName: ''
    };
  },

  // 注册全局错误监听
  registerGlobalErrorHandler: function () {
    // 监听全局错误
    wx.onError(function (error) {
      console.error('全局错误:', error);
      // 可以在这里添加错误上报逻辑
    });
    
    // 监听页面不存在错误
    wx.onPageNotFound(function (res) {
      console.error('页面不存在:', res);
      // 跳转到首页
      wx.navigateTo({
        url: '/pages/index/index'
      });
    });
  },

  // 检查是否需要更新版本
  checkUpdateVersion: function () {
    // 小程序版本更新机制
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      // 检查是否有新版本
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          console.log('发现新版本');
          
          // 下载新版本
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 重启并使用新版本
                  updateManager.applyUpdate();
                }
              }
            });
          });
          
          // 下载失败
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请检查网络连接后重试',
              showCancel: false
            });
          });
        }
      });
    }
  },

  // 登录方法 - 微信登录（旧版）
  login: function (callback) {
    wx.login({
      success: res => {
        if (res.code) {
          // 获取用户信息
          wx.getUserProfile({
            desc: '用于完善会员资料',
            success: userRes => {
              // 调用后端登录接口
              this.request('/users/login', {
                code: res.code,
                userInfo: userRes.userInfo
              }, 'POST', (err, res) => {
                if (err) {
                  console.error('登录失败:', err);
                  if (callback) callback(null, err);
                  return;
                }
                
                // 保存用户信息和token
                this.globalData.userInfo = userRes.userInfo;
                this.globalData.isLogin = true;
                this.globalData.userRole = res.data.role || 'user'; // 从后端获取用户角色
                
                // 保存到本地存储
                wx.setStorageSync('userInfo', userRes.userInfo);
                wx.setStorageSync('isLogin', true);
                wx.setStorageSync('userRole', res.data.role || 'user');
                wx.setStorageSync('token', res.data.token); // 保存JWT令牌
                
                // 同时保存到globalData中
                this.globalData.token = res.data.token;
                this.globalData.userInfo = userRes.userInfo;
                this.globalData.isLogin = true;
                this.globalData.userRole = res.data.role || 'user';
                
                // 调用回调
                if (callback) callback(userRes.userInfo);
              });
            },
            fail: err => {
              console.error('获取用户信息失败:', err);
              if (callback) callback(null, err);
            }
          });
        } else {
          console.error('登录失败:', res.errMsg);
          if (callback) callback(null, res.errMsg);
        }
      },
      fail: err => {
        console.error('登录失败:', err);
        if (callback) callback(null, err);
      }
    });
  },
  
  // 手机号+密码登录方法
  phoneLogin: function (phone, password, callback) {
    this.request('/users/login', {
      phone: phone,
      password: password
    }, 'POST', (err, res) => {
      if (err) {
        console.error('手机号登录失败:', err);
        callback({ error: '登录失败，请检查账号密码' });
        return;
      }
      
      // 保存用户信息和token
      const userInfo = {
        phone: phone,
        avatarUrl: res.data.avatar || '',
        nickName: res.data.nickname || phone
      };
      
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      this.globalData.userRole = res.data.role || 'user'; // 从后端获取用户角色
      
      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('isLogin', true);
      wx.setStorageSync('userRole', res.data.role || 'user');
      wx.setStorageSync('token', res.data.access_token || res.data.token); // 保存JWT令牌
      
      // 同时保存到globalData中
      this.globalData.token = res.data.access_token || res.data.token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      this.globalData.userRole = res.data.role || 'user';
      
      // 调用回调
      callback({ success: true });
    });
  },

  // 登出方法
  logout: function (callback) {
    // 后端无专门的logout端点，前端只需删除本地存储的token即可
    // 清除全局用户信息
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
    this.globalData.userRole = null;
    
    // 清除本地存储
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLogin');
    wx.removeStorageSync('userRole');
    wx.removeStorageSync('token'); // 清除JWT令牌
    
    // 调用回调
    if (callback) callback();
  },

  // 获取用户信息（如果未登录则自动登录）
  getUserInfo: function (callback) {
    if (this.globalData.isLogin && this.globalData.userInfo) {
      callback(this.globalData.userInfo);
    } else {
      this.login(callback);
    }
  },

  // 检查用户权限
  checkPermission: function (requiredRole) {
    // 如果用户未登录，返回false
    if (!this.globalData.isLogin) {
      return false;
    }
    
    // 管理员拥有所有权限
    if (this.globalData.userRole === 'admin') {
      return true;
    }
    
    // 商家权限
    if (this.globalData.userRole === 'merchant') {
      return requiredRole === 'merchant' || requiredRole === 'user';
    }
    
    // 普通用户权限
    return requiredRole === 'user';
  },

  // 全局网络请求封装
  request: function (url, data, method = 'GET', callback) {
    let loadingShown = false;
    
    // 尝试显示加载提示
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      loadingShown = true;
    } catch (e) {
      console.error('显示loading失败:', e);
      loadingShown = false;
    }
    
    // 获取token
    const token = wx.getStorageSync('token');
    console.log('请求URL:', url);
    console.log('使用的token:', token ? '存在' : '不存在');
    if (token) {
      console.log('token长度:', token.length);
    }
    
    // 构造请求参数
    const requestOptions = {
      url: this.globalData.config.baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      dataType: 'json',
      success: res => {
        // 处理响应
        if (res.statusCode === 200 || res.statusCode === 201) {
          callback(null, res.data);
        } else {
          // 打印详细错误信息
          console.error('请求失败:', res.statusCode, res.data);
          callback(new Error('请求失败，状态码：' + res.statusCode + '，错误信息：' + JSON.stringify(res.data)), res.data);
        }
      },
      fail: err => {
        // 显示错误提示
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        
        // 打印详细错误信息
        console.error('网络请求失败:', err);
        callback(err);
      },
      complete: () => {
        // 确保在所有情况下都隐藏加载提示
        if (loadingShown) {
          try {
            wx.hideLoading();
          } catch (e) {
            // 忽略已经隐藏的错误
            console.error('隐藏loading失败:', e);
          }
        }
      }
    };
    
    // 打印请求信息
    console.log('发送请求:', requestOptions);
    
    // 发送请求
    wx.request(requestOptions);
  }
});
