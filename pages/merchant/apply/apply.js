// merchant/apply/apply.js
Page({
  data: {
    formData: {
      business_name: '',
      contact_name: '',
      contact_phone: '',
      address: '',
      description: '',
      license_image: ''
    }
  },

  onLoad: function () {
    // 检查用户是否已登录
    const app = getApp()
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      // 延迟跳转到登录页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
    }
  },

  // 输入框内容变化时更新数据
  onInputChange: function (e) {
    const { name, value } = e.detail
    this.setData({
      [`formData.${name}`]: value
    })
  },

  // 上传资质证明图片
  uploadImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // 这里可以上传图片到服务器，现在先使用临时路径
        this.setData({
          'formData.license_image': tempFilePath
        })
        wx.showToast({
          title: '图片上传成功'
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
      }
    })
  },

  // 表单提交
  onSubmit: function (e) {
    const formData = this.data.formData
    
    // 表单验证
    if (!formData.business_name) {
      wx.showToast({
        title: '请输入商家名称',
        icon: 'none'
      })
      return
    }
    if (!formData.contact_name) {
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none'
      })
      return
    }
    if (!formData.contact_phone) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      })
      return
    }
    if (!/^1\d{10}$/.test(formData.contact_phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return
    }
    if (!formData.address) {
      wx.showToast({
        title: '请输入商家地址',
        icon: 'none'
      })
      return
    }
    if (!formData.description) {
      wx.showToast({
        title: '请输入商家简介',
        icon: 'none'
      })
      return
    }
    if (!formData.license_image) {
      wx.showToast({
        title: '请上传资质证明',
        icon: 'none'
      })
      return
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...'
    })
    
    // 调用商家申请API
    const app = getApp()
    app.request(
      '/merchants/apply',
      formData,
      'POST',
      (res) => {
        // 隐藏加载提示
        wx.hideLoading()
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          wx.showModal({
            title: '申请成功',
            content: '您的商家申请已提交，请等待管理员审核',
            showCancel: false,
            success: () => {
              // 返回上一页
              wx.navigateBack()
            }
          })
        } else {
          wx.showToast({
            title: res.data.message || '申请失败',
            icon: 'none'
          })
        }
      },
      (err) => {
        // 隐藏加载提示
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
        console.error('申请商家失败:', err)
      }
    )
  }
})