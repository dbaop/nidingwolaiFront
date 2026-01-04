// activity.js
Page({
  data: {
    activeTab: 'joined',
    joinedActivities: [],
    createdActivities: [],
    historyActivities: [],
    loading: false
  },

  onLoad: function() {
    // 检查用户是否登录
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.showModal({
        title: '未登录',
        content: '请先登录',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }
      });
      return;
    }
    this.loadAllActivities();
  },

  // 加载所有活动数据
  loadAllActivities: function() {
    this.setData({ loading: true });
    
    // 并行加载各类活动数据
    Promise.all([
      this.loadJoinedActivities(),
      this.loadCreatedActivities(),
      this.loadHistoryActivities()
    ]).finally(() => {
      this.setData({ loading: false });
    });
  },

  // 加载参与的活动
  loadJoinedActivities: function() {
    return new Promise((resolve) => {
      const app = getApp();
      app.request('/activities/my-participated', {}, 'GET', (err, res) => {
        if (!err && res && res.data && Array.isArray(res.data)) {
          this.setData({ joinedActivities: res.data });
        } else {
          console.warn('获取参与活动失败或端点未实现，使用默认数据');
          // 如果API调用失败或数据不是数组，使用默认示例数据
          this.setData({ 
            joinedActivities: [
              {
                id: 1,
                title: '周末K歌聚会',
                time: '周六 19:00',
                location: 'KTV中心',
                status: 'upcoming',
                currentPeople: 3,
                totalPeople: 6,
                image: '../../images/karaoke.png'
              }
            ] 
          });
        }
        resolve();
      });
    });
  },

  // 加载创建的活动
  loadCreatedActivities: function() {
    return new Promise((resolve) => {
      const app = getApp();
      app.request('/activities/my-organized', {}, 'GET', (err, res) => {
        if (!err && res && res.data && Array.isArray(res.data)) {
          this.setData({ createdActivities: res.data });
        } else {
          console.warn('获取创建活动失败或端点未实现，使用默认数据');
          this.setData({ 
            createdActivities: [
              {
                id: 2,
                title: '桌游之夜',
                time: '周五 20:00',
                location: '桌游吧',
                status: 'ongoing',
                currentPeople: 4,
                totalPeople: 8,
                image: '../../images/boardgame.png'
              }
            ] 
          });
        }
        resolve();
      });
    });
  },

  // 加载历史活动
  loadHistoryActivities: function() {
    return new Promise((resolve) => {
      const app = getApp();
      // 后端没有实现专门的历史活动端点，使用参与活动并在前端过滤
      app.request('/activities/my-participated', {}, 'GET', (err, res) => {
        if (!err && res && res.data && Array.isArray(res.data)) {
          // 假设活动有status字段，过滤出已结束的活动作为历史活动
          const historyActivities = res.data.filter(activity => activity.status === 'completed' || activity.status === 'finished');
          this.setData({ historyActivities: historyActivities });
        } else {
          console.warn('获取历史活动失败或端点未实现，使用默认数据');
          // 如果返回的数据不是数组，使用默认示例数据
          this.setData({ 
            historyActivities: [
              {
                id: 3,
                title: '爬山活动',
                time: '上周日 08:00',
                location: '西山公园',
                status: 'completed',
                currentPeople: 5,
                totalPeople: 5,
                image: '../../images/hiking.png'
              }
            ] 
          });
        }
        resolve();
      });
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadAllActivities();
    wx.stopPullDownRefresh();
  },

  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  // 前往活动详情
  goToActivityDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity/detail?id=${id}`
    })
  },

  // 前往创建活动页面
  goToCreate: function () {
    wx.navigateTo({
      url: '/pages/create/create'
    })
  }
})