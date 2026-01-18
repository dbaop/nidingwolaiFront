// time-picker.js
Page({
  data: {
    type: 'start', // start 或 end
    dateTime: '',
    minEndTime: ''
  },

  onLoad: function (options) {
    console.log('时间选择页面加载:', options)
    
    // 获取传递过来的参数
    this.setData({
      type: options.type || 'start',
      minEndTime: options.minEndTime || ''
    })
    
    // 初始化时间为当前时间
    const now = new Date()
    this.setData({
      dateTime: this.formatDateTimeForPicker(now)
    })
  },

  // 格式化日期时间为picker需要的格式
  formatDateTimeForPicker: function(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    // 微信小程序picker需要 YYYY-MM-DDTHH:mm 格式
    return `${year}-${month}-${day}T${hour}:${minute}`
  },

  // 时间选择器变化事件
  onTimeChange: function (e) {
    console.log('时间选择器变化:', e.detail.value)
    this.setData({
      dateTime: e.detail.value
    })
  },

  // 确认选择
  onConfirm: function () {
    console.log('确认选择时间:', this.data.dateTime)
    
    // 返回上一页并传递选择的时间
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    
    if (prevPage) {
      if (this.data.type === 'start') {
        prevPage.onTimeChange({detail: {value: this.data.dateTime}})
      } else {
        prevPage.onEndTimeChange({detail: {value: this.data.dateTime}})
      }
    }
    
    // 返回上一页
    wx.navigateBack()
  },

  // 取消选择
  onCancel: function () {
    console.log('取消选择时间')
    // 返回上一页
    wx.navigateBack()
  }
})
