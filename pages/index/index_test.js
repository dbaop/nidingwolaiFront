// 测试版首页
Page({
  data: {
    loading: false,
    error: null,
    activities: [
      {
        id: 1,
        title: '测试活动1',
        price: 100
      },
      {
        id: 2,
        title: '测试活动2',
        price: 200
      }
    ]
  },

  onLoad: function () {
    console.log('测试版页面加载');
    console.log('数据:', this.data);
  }
});
