// reviews.js
Page({
  data: {
    reviews: [],
    loading: false,
    error: null
  },

  onLoad: function() {
    this.loadReviews();
  },

  // 加载我的评价
  loadReviews: function() {
    this.setData({
      loading: true,
      error: null
    });

    const { api } = require('../../../utils/api.js');

    api.getMyReviews().then(res => {
      console.log('获取我的评价:', res);
      
      if (res && res.data) {
        this.setData({
          reviews: res.data,
          loading: false
        });
      } else {
        this.setData({
          reviews: [],
          loading: false
        });
      }
    }).catch(err => {
      console.error('获取我的评价失败:', err);
      this.setData({
        error: err.message || '获取评价失败，请重试',
        loading: false
      });
    });
  },

  // 重新加载
  retryLoad: function() {
    this.loadReviews();
  },

  // 页面显示时重新加载
  onShow: function() {
    this.loadReviews();
  }
});