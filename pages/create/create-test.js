// 测试时间选择器
Page({
  data: {
    dateTime: '',
    endDateTime: '',
    minEndTime: ''
  },

  onLoad: function () {
    console.log('测试页面加载');
  },

  onTimeChange: function (e) {
    console.log('开始时间改变:', e.detail.value);
    this.setData({
      dateTime: e.detail.value
    });
  },

  onEndTimeChange: function (e) {
    console.log('结束时间改变:', e.detail.value);
    this.setData({
      endDateTime: e.detail.value
    });
  }
});