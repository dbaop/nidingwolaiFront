// pages/profile/wallet/wallet.js
Page({
  data: {
    balance: '0.00',
    rechargeAmount: '',
    withdrawAmount: '',
    rechargeMethod: 'wechat',
    userInfo: {
      real_name: '',
      bank_card: ''
    },
    bankCards: [],
    selectedCardId: null
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

    this.loadWalletInfo();
    this.loadUserInfo();
    this.loadBankCards();
  },

  onShow: function () {
    this.loadWalletInfo();
    this.loadUserInfo();
    this.loadBankCards();
  },

  // 加载钱包信息
  loadWalletInfo: function () {
    const app = getApp();
    const token = wx.getStorageSync('token');

    if (!token) return;

    wx.request({
      url: app.globalData.config.baseUrl + '/users/wallet',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          this.setData({
            balance: parseFloat(res.data.data.balance || 0).toFixed(2)
          });
        }
      },
      fail: (err) => {
        console.error('获取钱包信息失败:', err);
      }
    });
  },

  // 加载用户信息
  loadUserInfo: function () {
    const app = getApp();
    const token = wx.getStorageSync('token');

    if (!token) return;

    wx.request({
      url: app.globalData.config.baseUrl + '/users/me',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          const userData = res.data.data;
          this.setData({
            userInfo: {
              real_name: userData.real_name || '',
              bank_card: userData.bank_card || '未绑定'
            }
          });
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
      }
    });
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
          const cards = res.data.data.cards || [];
          this.setData({
            bankCards: cards
          });
          // 默认选择第一张卡
          if (cards.length > 0 && !this.data.selectedCardId) {
            this.setData({
              selectedCardId: cards[0].id
            });
          }
        }
      },
      fail: (err) => {
        console.error('获取银行卡列表失败:', err);
      }
    });
  },

  // 充值金额输入
  onRechargeAmountInput: function (e) {
    this.setData({
      rechargeAmount: e.detail.value
    });
  },

  // 提现金额输入
  onWithdrawAmountInput: function (e) {
    this.setData({
      withdrawAmount: e.detail.value
    });
  },

  // 选择充值方式
  selectRechargeMethod: function (e) {
    const method = e.currentTarget.dataset.method;
    this.setData({
      rechargeMethod: method
    });
  },

  // 选择银行卡
  selectBankCard: function (e) {
    const cardId = e.currentTarget.dataset.id;
    this.setData({
      selectedCardId: cardId
    });
  },

  // 跳转到银行卡管理
  goToBankCard: function () {
    wx.navigateTo({
      url: '/pages/profile/bankcard/bankcard'
    });
  },

  // 执行充值
  doRecharge: function () {
    const amount = parseFloat(this.data.rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return;
    }

    const methodName = this.data.rechargeMethod === 'wechat' ? '微信支付' :
                       this.data.rechargeMethod === 'alipay' ? '支付宝' : '银行卡';

    wx.showModal({
      title: '确认充值',
      content: `您将使用${methodName}充值 ¥${amount.toFixed(2)}`,
      success: (res) => {
        if (res.confirm) {
          this.requestRecharge(amount);
        }
      }
    });
  },

  // 请求充值
  requestRecharge: function (amount) {
    const app = getApp();
    const token = wx.getStorageSync('token');

    wx.showLoading({
      title: '处理中...'
    });

    wx.request({
      url: app.globalData.config.baseUrl + '/users/wallet/recharge',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token,
        'content-type': 'application/json'
      },
      data: { amount: amount },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.status === 'success') {
          wx.showToast({
            title: '充值成功',
            icon: 'success'
          });
          this.setData({
            balance: parseFloat(res.data.data.balance || 0).toFixed(2),
            rechargeAmount: ''
          });
        } else {
          wx.showToast({
            title: res.data.message || '充值失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('充值失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 执行提现
  doWithdraw: function () {
    const amount = parseFloat(this.data.withdrawAmount);
    const balance = parseFloat(this.data.balance);

    if (isNaN(amount) || amount <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return;
    }

    if (amount > balance) {
      wx.showToast({
        title: '余额不足',
        icon: 'none'
      });
      return;
    }

    if (this.data.bankCards.length === 0) {
      wx.showToast({
        title: '请先绑定银行卡',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认提现',
      content: `您将提现 ¥${amount.toFixed(2)}`,
      success: (res) => {
        if (res.confirm) {
          this.requestWithdraw(amount);
        }
      }
    });
  },

  // 请求提现
  requestWithdraw: function (amount) {
    const app = getApp();
    const token = wx.getStorageSync('token');

    wx.showLoading({
      title: '处理中...'
    });

    wx.request({
      url: app.globalData.config.baseUrl + '/users/wallet/withdraw',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token,
        'content-type': 'application/json'
      },
      data: { amount: amount },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.status === 'success') {
          wx.showToast({
            title: '提现申请已提交',
            icon: 'success'
          });
          this.setData({
            balance: parseFloat(res.data.data.balance || 0).toFixed(2),
            withdrawAmount: ''
          });
        } else {
          wx.showToast({
            title: res.data.message || '提现失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('提现失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
});