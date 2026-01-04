// login.js
Page({
  data: {
    phone: '',
    password: '',
    showPassword: false,
    canLogin: false,
    isLoading: false
  },

  onLoad: function () {
    // 页面加载时检查是否已登录
    const app = getApp()
    if (app.globalData.isLogin) {
      wx.showToast({
        title: '已登录',
        icon: 'success'
      })
      wx.navigateBack()
    }
  },

  // 手机号输入处理
  onPhoneInput: function (e) {
    const phone = e.detail.value
    this.setData({ phone })
    this.checkCanLogin()
  },

  // 密码输入处理
  onPasswordInput: function (e) {
    const password = e.detail.value
    this.setData({ password })
    this.checkCanLogin()
  },

  // 检查是否可以登录
  checkCanLogin: function () {
    const { phone, password } = this.data
    // 简单的手机号格式验证和密码长度检查
    const phoneValid = /^1[3-9]\d{9}$/.test(phone)
    const passwordValid = password.length >= 6
    this.setData({
      canLogin: phoneValid && passwordValid
    })
  },

  // 切换密码显示/隐藏
  togglePasswordVisibility: function () {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 登录处理
  login: function () {
    const { phone, password } = this.data
    const app = getApp()

    this.setData({ isLoading: true })

    // 使用app.js中封装的phoneLogin方法
    app.phoneLogin(phone, password, (result) => {
      this.setData({ isLoading: false })

      if (result.success) {
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/profile/profile'
          })
        }, 1500)
      } else {
        wx.showToast({
          title: result.error || '登录失败，请检查账号密码',
          icon: 'none'
        })
      }
    })
  },

  // 忘记密码
  onForgotPassword: function () {
    wx.showToast({
      title: '忘记密码功能正在开发中',
      icon: 'none'
    })
  },

  // 清空手机号
  onClearPhone: function () {
    this.setData({
      phone: '',
      canLogin: false
    })
  },

  // 跳转到注册页面
  goToRegister: function () {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
})
