// register.js - 注册页面
Page({
  data: {
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    showPassword: false,
    showConfirmPassword: false,
    loading: false
  },

  // 输入手机号
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 输入密码
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 确认密码
  onConfirmPasswordInput: function(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },

  // 输入昵称
  onNicknameInput: function(e) {
    this.setData({
      nickname: e.detail.value
    })
  },

  // 切换密码可见性
  togglePasswordVisibility: function() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 切换确认密码可见性
  toggleConfirmPasswordVisibility: function() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    })
  },

  // 注册
  register: function() {
    const { phone, password, confirmPassword, nickname } = this.data
    
    // 表单验证
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return
    }
    
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }
    
    if (password.length < 6) {
      wx.showToast({
        title: '密码不能少于6位',
        icon: 'none'
      })
      return
    }
    
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      })
      return
    }
    
    if (!nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }
    
    // 显示加载状态
    this.setData({ loading: true })
    
    // 调用注册接口
    const app = getApp()
    app.request('/users/register', {
      phone: phone,
      password: password,
      nickname: nickname
    }, 'POST', (err, res) => {
      this.setData({ loading: false })
      
      if (err) {
        wx.showToast({
          title: '注册失败: ' + (err.message || '未知错误'),
          icon: 'none'
        })
        return
      }
      
      // 注册成功提示
      wx.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          // 跳转到登录页面
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      })
    })
  },

  // 返回登录页面
  goToLogin: function() {
    wx.navigateBack()
  }
})
