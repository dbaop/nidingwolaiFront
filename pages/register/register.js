// register.js - 注册页面
Page({
  data: {
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    verifyCode: '',
    showPassword: false,
    showConfirmPassword: false,
    loading: false,
    canRegister: false,
    countdown: 0,
    countdownTimer: null,
    sendBtnText: '获取验证码'
  },

  onLoad: function() {
    this.checkCanRegister()
  },

  onUnload: function() {
    // 页面卸载时清除定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
  },

  // 检查是否可以注册
  checkCanRegister: function() {
    const { phone, password, confirmPassword, nickname, verifyCode } = this.data
    const phoneValid = /^1[3-9]\d{9}$/.test(phone)
    const passwordValid = password.length >= 6
    const confirmValid = password === confirmPassword && confirmPassword.length > 0
    const nicknameValid = nickname.trim().length > 0
    const verifyCodeValid = verifyCode.length === 6

    this.setData({
      canRegister: phoneValid && passwordValid && confirmValid && nicknameValid && verifyCodeValid
    })
  },

  // 清空手机号
  clearPhone: function() {
    this.setData({ phone: '' })
    this.checkCanRegister()
  },

  // 清空昵称
  clearNickname: function() {
    this.setData({ nickname: '' })
    this.checkCanRegister()
  },

  // 清空验证码
  clearVerifyCode: function() {
    this.setData({ verifyCode: '' })
    this.checkCanRegister()
  },

  // 输入手机号
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
    this.checkCanRegister()
  },

  // 输入验证码
  onVerifyCodeInput: function(e) {
    const value = e.detail.value.replace(/\D/g, '').slice(0, 6)
    this.setData({
      verifyCode: value
    })
    this.checkCanRegister()
  },

  // 输入密码
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
    this.checkCanRegister()
  },

  // 确认密码
  onConfirmPasswordInput: function(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
    this.checkCanRegister()
  },

  // 输入昵称
  onNicknameInput: function(e) {
    this.setData({
      nickname: e.detail.value
    })
    this.checkCanRegister()
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

  // 发送验证码
  sendVerifyCode: function() {
    const { phone, countdown } = this.data

    if (countdown > 0) return

    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' })
      return
    }

    // 调用发送验证码接口
    const app = getApp()
    app.request('/users/send-verify-code', { phone }, 'POST', (err, res) => {
      if (err) {
        wx.showToast({ title: err.message || '发送失败', icon: 'none' })
        return
      }

      wx.showToast({ title: '验证码已发送', icon: 'success' })

      // 开始倒计时
      this.startCountdown()
    })
  },

  // 开始倒计时
  startCountdown: function() {
    let seconds = 60
    this.setData({
      countdown: seconds,
      sendBtnText: `${seconds}s`
    })

    const timer = setInterval(() => {
      seconds--
      if (seconds <= 0) {
        clearInterval(timer)
        this.setData({
          countdown: 0,
          sendBtnText: '获取验证码'
        })
      } else {
        this.setData({
          countdown: seconds,
          sendBtnText: `${seconds}s`
        })
      }
    }, 1000)

    this.setData({ countdownTimer: timer })
  },

  // 注册
  register: function() {
    const { phone, password, confirmPassword, nickname, verifyCode } = this.data

    // 表单验证
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' })
      return
    }

    if (!verifyCode) {
      wx.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }

    if (verifyCode.length !== 6) {
      wx.showToast({ title: '验证码为6位数字', icon: 'none' })
      return
    }

    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    if (password.length < 6) {
      wx.showToast({ title: '密码不能少于6位', icon: 'none' })
      return
    }

    if (password !== confirmPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' })
      return
    }

    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    // 显示加载状态
    this.setData({ loading: true })

    // 调用注册接口
    const app = getApp()
    app.request('/users/register', {
      phone: phone,
      password: password,
      nickname: nickname,
      verify_code: verifyCode
    }, 'POST', (err, res) => {
      this.setData({ loading: false })

      if (err) {
        wx.showToast({ title: err.message || '注册失败', icon: 'none' })
        return
      }

      // 注册成功
      wx.showToast({ title: '注册成功', icon: 'success', duration: 1500 })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    })
  },

  // 返回登录页面
  goToLogin: function() {
    wx.navigateBack()
  }
})
