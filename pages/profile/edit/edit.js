// edit.js
Page({
  data: {
    userInfo: {
      nickname: '',
      avatar: '',
      gender: 0, // 0: 未知, 1: 男, 2: 女
      birthday: '',
      phone: '',
      email: '',
      intro: ''
    },
    originalUserInfo: {},
    loading: false,
    hasChanges: false
  },

  onLoad: function() {
    const app = getApp();
    
    // 从全局数据获取用户信息
    if (app.globalData.userInfo) {
      const userInfo = {
        nickname: app.globalData.userInfo.nickName || '',
        avatar: app.globalData.userInfo.avatarUrl || '',
        gender: app.globalData.userInfo.gender || 0,
        birthday: app.globalData.userInfo.birthday || '',
        phone: app.globalData.userInfo.phone || '',
        email: app.globalData.userInfo.email || '',
        intro: app.globalData.userInfo.intro || ''
      };
      
      this.setData({
        userInfo: userInfo,
        originalUserInfo: JSON.parse(JSON.stringify(userInfo)) // 深拷贝
      });
    }
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

  // 生日选择
  onBirthdayChange: function(e) {
    this.setData({
      'userInfo.birthday': e.detail.value,
      hasChanges: true
    });
  },

  // 手机号输入
  onPhoneInput: function(e) {
    this.setData({
      'userInfo.phone': e.detail.value,
      hasChanges: true
    });
  },

  // 邮箱输入
  onEmailInput: function(e) {
    this.setData({
      'userInfo.email': e.detail.value,
      hasChanges: true
    });
  },

  // 个人简介输入
  onIntroInput: function(e) {
    this.setData({
      'userInfo.intro': e.detail.value,
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
    const app = getApp();
    
    wx.showLoading({
      title: '上传中...',
      mask: true
    });

    // 目前后端未实现单独的头像上传端点，使用update user info端点替代
    // 这里仅模拟上传成功，实际开发中需要根据后端API调整
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        'userInfo.avatar': filePath,
        hasChanges: true
      });
      wx.showToast({
        title: '头像上传成功',
        icon: 'success'
      });
    }, 1000);
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

    if (this.data.userInfo.phone && !/^1[3-9]\d{9}$/.test(this.data.userInfo.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (this.data.userInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.data.userInfo.email)) {
      wx.showToast({
        title: '请输入正确的邮箱',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    const app = getApp();
    app.request('/users/me', this.data.userInfo, 'PUT', (err, res) => {
      this.setData({ loading: false });
      
      if (err) {
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
        return;
      }

      // 更新全局用户信息
      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        nickName: this.data.userInfo.nickname,
        avatarUrl: this.data.userInfo.avatar,
        gender: this.data.userInfo.gender,
        birthday: this.data.userInfo.birthday,
        phone: this.data.userInfo.phone,
        email: this.data.userInfo.email,
        intro: this.data.userInfo.intro
      };

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