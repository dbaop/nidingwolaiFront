// 报名管理页面逻辑
const { api } = require('../../utils/api.js');

Page({
  data: {
    activityId: null,
    activityTitle: '',
    enrollments: [],
    filteredEnrollments: [],
    filterStatus: 'all',
    loading: false,
    emptyMessage: '暂无报名记录'
  },

  onLoad: function(options) {
    const { activityId, activityTitle } = options;
    if (activityId) {
      this.setData({
        activityId: parseInt(activityId),
        activityTitle: activityTitle || '活动报名'
      });
      this.loadEnrollments();
    }
  },

  // 加载报名列表
  loadEnrollments: function() {
    this.setData({
      loading: true
    });

    api.getEnrollments(this.data.activityId).then(res => {
      wx.hideLoading();

      // 处理返回的数据格式
      let enrollmentsData = [];
      if (Array.isArray(res)) {
        enrollmentsData = res;
      } else if (res.data && Array.isArray(res.data)) {
        enrollmentsData = res.data;
      } else if (res.data && res.data.enrollments && Array.isArray(res.data.enrollments)) {
        enrollmentsData = res.data.enrollments;
      } else if (res.enrollments && Array.isArray(res.enrollments)) {
        enrollmentsData = res.enrollments;
      }

      console.log('报名列表数据:', enrollmentsData);

      // 格式化报名数据
      const formattedEnrollments = enrollmentsData.map(item => {
        return {
          ...item,
          statusText: this.getStatusText(item.status),
          created_at: this.formatTime(item.created_at)
        };
      });

      this.setData({
        enrollments: formattedEnrollments,
        filteredEnrollments: formattedEnrollments,
        loading: false
      });
    }).catch(err => {
      wx.hideLoading();
      console.error('加载报名列表失败:', err);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
  },

  // 切换筛选状态
  switchFilter: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      filterStatus: status
    });
    this.filterEnrollments();
  },

  // 筛选报名列表
  filterEnrollments: function() {
    const { enrollments, filterStatus } = this.data;
    let filtered = [];
    let message = '暂无报名记录';

    switch(filterStatus) {
      case 'all':
        filtered = enrollments;
        message = enrollments.length === 0 ? '暂无报名记录' : '';
        break;
      case 'pending':
        filtered = enrollments.filter(item => item.status === 'pending');
        message = filtered.length === 0 ? '暂无待审批的报名' : '';
        break;
      case 'approved':
        filtered = enrollments.filter(item => item.status === 'approved');
        message = filtered.length === 0 ? '暂无已同意的报名' : '';
        break;
      case 'rejected':
        filtered = enrollments.filter(item => item.status === 'rejected');
        message = filtered.length === 0 ? '暂无已拒绝的报名' : '';
        break;
    }

    this.setData({
      filteredEnrollments: filtered,
      emptyMessage: message
    });
  },

  // 同意报名
  approveEnrollment: function(e) {
    const id = e.currentTarget.dataset.id;
    const username = e.currentTarget.dataset.username;

    wx.showModal({
      title: '确认同意',
      content: `同意 ${username} 的报名申请？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          });

          api.approveEnrollment(id).then(res => {
            wx.hideLoading();
            wx.showToast({
              title: '已同意报名',
              icon: 'success'
            });
            // 重新加载列表
            this.loadEnrollments();
          }).catch(err => {
            wx.hideLoading();
            console.error('同意报名失败:', err);
            wx.showToast({
              title: err.message || '操作失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 拒绝报名
  rejectEnrollment: function(e) {
    const id = e.currentTarget.dataset.id;
    const username = e.currentTarget.dataset.username;

    wx.showModal({
      title: '确认拒绝',
      content: `拒绝 ${username} 的报名申请？`,
      confirmText: '确认拒绝',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          });

          api.rejectEnrollment(id).then(res => {
            wx.hideLoading();
            wx.showToast({
              title: '已拒绝报名',
              icon: 'success'
            });
            // 重新加载列表
            this.loadEnrollments();
          }).catch(err => {
            wx.hideLoading();
            console.error('拒绝报名失败:', err);
            wx.showToast({
              title: err.message || '操作失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 获取状态文本
  getStatusText: function(status) {
    const statusMap = {
      'pending': '待审批',
      'approved': '已同意',
      'rejected': '已拒绝',
      'canceled': '已取消',
      'attended': '已参加'
    };
    return statusMap[status] || status;
  },

  // 格式化时间
  formatTime: function(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hour}:${minute}`;
  }
});
