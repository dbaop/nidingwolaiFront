// edit.js
Page({
  data: {
    userInfo: {
      nickname: '',
      avatar: '',
      gender: 0, // 0: 未知, 1: 男, 2: 女
      phone: '',
      bio: '',
      singing_style: ''
    },
    originalUserInfo: {},
    loading: false,
    hasChanges: false
  },

  onLoad: function() {
    // 从服务器获取最新用户信息
    this.loadUserInfo();
  },

  // 从服务器加载用户信息
  loadUserInfo: function() {
    const app = getApp();
    const token = wx.getStorageSync('token');

    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

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
          // 如果avatar已经是完整URL（包含http），不重复拼接
          const userInfo = {
            nickname: userData.nickname || '',
            avatar: avatarUrl,
            gender: userData.gender || 0,
            phone: userData.phone || '',
            bio: userData.bio || '',
            singing_style: userData.singing_style || ''
          };

          this.setData({
            userInfo: userInfo,
            originalUserInfo: JSON.parse(JSON.stringify(userInfo))
          });

          // 更新全局数据
          app.globalData.userInfo = {
            ...app.globalData.userInfo,
            nickName: userData.nickname,
            avatarUrl: userData.avatar,
            gender: userData.gender,
            phone: userData.phone,
            bio: userData.bio,
            singing_style: userData.singing_style
          };
          wx.setStorageSync('userInfo', app.globalData.userInfo);
        } else {
          wx.showToast({ title: '获取用户信息失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        wx.showToast({ title: '获取用户信息失败', icon: 'none' });
      }
    });
  },

  // 昵称输入
  onNicknameInput: function(e) {
    this.setData({
      'userInfo.nickname': e.detail.value,
      hasChanges: true
    });
  },

  // 性别选择
  onGenderChange: function(e) {
    this.setData({
      'userInfo.gender': parseInt(e.detail.value),
      hasChanges: true
    });
  },

  // 个人简介输入
  onBioInput: function(e) {
    this.setData({
      'userInfo.bio': e.detail.value,
      hasChanges: true
    });
  },

  // 演唱风格输入
  onSingingStyleInput: function(e) {
    this.setData({
      'userInfo.singing_style': e.detail.value,
      hasChanges: true
    });
  },

  // 选择头像
  chooseAvatar: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  // 上传头像
  uploadAvatar: function(filePath) {
    const token = wx.getStorageSync('token');

    wx.showLoading({
      title: '上传中...',
      mask: true
    });

    wx.uploadFile({
      url: 'http://localhost:5000/api/upload/image',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        wx.hideLoading();
        console.log('头像上传成功:', res);

        if (res.statusCode === 200 || res.statusCode === 201) {
          let data;
          try {
            if (typeof res.data === 'string') {
              data = JSON.parse(res.data);
            } else {
              data = res.data;
            }
          } catch (e) {
            console.error('解析响应数据失败:', e);
            data = res.data;
          }

          let imageUrl = null;
          if (data && data.data) {
            imageUrl = data.data.url || data.data.image_url || data.data.image;
          } else if (data && (data.url || data.image_url || data.image)) {
            imageUrl = data.url || data.image_url || data.image;
          }

          if (imageUrl && imageUrl.startsWith('/')) {
            imageUrl = 'http://localhost:5000' + imageUrl;
          }

          if (imageUrl) {
            this.setData({
              'userInfo.avatar': imageUrl,
              hasChanges: true,
              'originalUserInfo.avatar': imageUrl  // 同时更新original，避免重置时恢复旧头像
            });
            wx.showToast({
              title: '头像上传成功',
              icon: 'success'
            });
          } else {
            console.error('响应数据中没有图片URL:', data);
            wx.showToast({
              title: '头像上传失败',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: '头像上传失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('头像上传失败:', err);
        wx.showToast({
          title: '头像上传失败',
          icon: 'none'
        });
      }
    });
  },

  // 保存个人资料
  saveProfile: function() {
    if (!this.data.hasChanges) {
      wx.showToast({
        title: '没有修改内容',
        icon: 'none'
      });
      return;
    }

    // 验证表单
    if (!this.data.userInfo.nickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    const app = getApp();
    const token = wx.getStorageSync('token');
    console.log('保存个人资料 - token:', token ? '存在' : '不存在');
    console.log('hasChanges:', this.data.hasChanges);
    // 只发送可修改的字段，不发phone（手机号不可修改）
    const updateData = {
      nickname: this.data.userInfo.nickname,
      avatar: this.data.userInfo.avatar,
      gender: this.data.userInfo.gender,
      bio: this.data.userInfo.bio,
      singing_style: this.data.userInfo.singing_style
    };
    console.log('updateData:', updateData);

    wx.request({
      url: app.globalData.config.baseUrl + '/users/me',
      method: 'PUT',
      data: updateData,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        console.log('更新用户信息响应:', res);
        this.setData({ loading: false });

        if (res.statusCode === 200) {
          // 更新全局用户信息
          app.globalData.userInfo = {
            ...app.globalData.userInfo,
            nickName: this.data.userInfo.nickname,
            avatarUrl: this.data.userInfo.avatar,
            gender: this.data.userInfo.gender,
            bio: this.data.userInfo.bio,
            singing_style: this.data.userInfo.singing_style
          };
          wx.setStorageSync('userInfo', app.globalData.userInfo);

          // 更新原始数据
          this.setData({
            originalUserInfo: JSON.parse(JSON.stringify(this.data.userInfo)),
            hasChanges: false
          });

          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });

          // 延迟返回
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          console.error('保存失败:', res);
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('更新用户信息请求失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 重置表单
  resetForm: function() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有修改吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            userInfo: JSON.parse(JSON.stringify(this.data.originalUserInfo)),
            hasChanges: false
          });
        }
      }
    });
  }
});