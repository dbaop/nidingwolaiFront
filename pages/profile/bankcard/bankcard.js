// pages/profile/bankcard/bankcard.js
Page({
  data: {
    cards: [],
    showAddModal: false,
    formData: {
      bank_name: '',
      card_number: '',
      account_name: ''
    }
  },

  onLoad: function () {
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      return;
    }

    this.loadBankCards();
  },

  onShow: function () {
    this.loadBankCards();
  },

  // 加载银行卡列表
  loadBankCards: function () {
    const app = getApp();
    const token = wx.getStorageSync('token');

    if (!token) return;

    wx.request({
      url: app.globalData.config.baseUrl + '/users/bank-cards',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          this.setData({
            cards: res.data.data.cards || []
          });
        }
      },
      fail: (err) => {
        console.error('获取银行卡列表失败:', err);
      }
    });
  },

  // 显示添加银行卡弹窗
  showAddModal: function () {
    this.setData({
      showAddModal: true,
      formData: {
        bank_name: '',
        card_number: '',
        account_name: ''
      }
    });
  },

  // 隐藏添加弹窗
  hideAddModal: function () {
    this.setData({
      showAddModal: false
    });
  },

  // 银行名称输入
  onBankNameInput: function (e) {
    this.setData({
      'formData.bank_name': e.detail.value
    });
  },

  // 卡号输入
  onCardNumberInput: function (e) {
    this.setData({
      'formData.card_number': e.detail.value
    });
  },

  // 持卡人姓名输入
  onAccountNameInput: function (e) {
    this.setData({
      'formData.account_name': e.detail.value
    });
  },

  // 添加银行卡
  addBankCard: function () {
    const { bank_name, card_number, account_name } = this.data.formData;

    if (!bank_name) {
      wx.showToast({
        title: '请输入银行名称',
        icon: 'none'
      });
      return;
    }

    if (!card_number) {
      wx.showToast({
        title: '请输入卡号',
        icon: 'none'
      });
      return;
    }

    if (!account_name) {
      wx.showToast({
        title: '请输入持卡人姓名',
        icon: 'none'
      });
      return;
    }

    const app = getApp();
    const token = wx.getStorageSync('token');

    wx.showLoading({
      title: '添加中...'
    });

    wx.request({
      url: app.globalData.config.baseUrl + '/users/bank-cards',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token,
        'content-type': 'application/json'
      },
      data: {
        bank_name: bank_name,
        card_number: card_number,
        account_name: account_name
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.status === 'success') {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          });
          this.setData({
            showAddModal: false,
            cards: res.data.data.cards || []
          });
        } else {
          wx.showToast({
            title: res.data.message || '添加失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('添加银行卡失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 删除银行卡
  deleteCard: function (e) {
    const cardId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除该银行卡吗？',
      success: (res) => {
        if (res.confirm) {
          this.doDeleteCard(cardId);
        }
      }
    });
  },

  doDeleteCard: function (cardId) {
    const app = getApp();
    const token = wx.getStorageSync('token');

    wx.showLoading({
      title: '删除中...'
    });

    wx.request({
      url: app.globalData.config.baseUrl + '/users/bank-cards/' + cardId,
      method: 'DELETE',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.status === 'success') {
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
          this.setData({
            cards: res.data.data.cards || []
          });
        } else {
          wx.showToast({
            title: res.data.message || '删除失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('删除银行卡失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
});