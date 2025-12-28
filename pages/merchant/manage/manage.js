// merchant/manage/manage.js
Page({
  data: {
  },

  onLoad: function () {
    // 检查用户是否已登录且是商家
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
    } else if (app.globalData.userInfo && app.globalData.userInfo.role !== 'merchant') {
      wx.showToast({
        title: '只有商家可以访问此页面',
        icon: 'none'
      })
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  }
})