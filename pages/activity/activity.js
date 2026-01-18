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

  // 转换后端数据格式为前端格式
  transformActivityData: function(activity) {
    console.log('转换活动数据:', activity);
    
    // 格式化时间（iOS兼容格式）
    let time = '';
    if (activity.start_time) {
      const startTime = new Date(activity.start_time);
      const year = startTime.getFullYear();
      const month = (startTime.getMonth() + 1).toString().padStart(2, '0');
      const day = startTime.getDate().toString().padStart(2, '0');
      const hour = startTime.getHours().toString().padStart(2, '0');
      const minute = startTime.getMinutes().toString().padStart(2, '0');
      // 使用iOS兼容的格式：yyyy/MM/dd HH:mm
      time = `${year}/${month}/${day} ${hour}:${minute}`;
    }

    // 转换状态
    let status = 'upcoming';
    if (activity.status === 'active') {
      status = 'upcoming';
    } else if (activity.status === 'ongoing') {
      status = 'ongoing';
    } else if (activity.status === 'completed' || activity.status === 'finished') {
      status = 'completed';
    } else if (activity.status === 'canceled') {
      status = 'canceled';
    }

    // 转换图片
    let image = '../../images/karaoke.png';
    console.log('处理图片，原始数据:', {
      cover_image_url: activity.cover_image_url,
      images: activity.images
    });
    
    // 尝试从cover_image_url获取图片
    if (activity.cover_image_url && activity.cover_image_url !== null) {
      // 清理图片URL，移除可能的特殊字符
      let imageUrl = activity.cover_image_url;
      if (typeof imageUrl === 'string') {
        imageUrl = imageUrl.trim().replace(/`/g, '').replace(/^`|`$/g, '');
      }
      console.log('清理后的图片URL:', imageUrl);
      // 检查URL是否有效
      if (imageUrl && imageUrl !== 'null' && imageUrl !== '' && !imageUrl.startsWith('http://tmp/')) {
        image = imageUrl;
        console.log('使用cover_image_url:', image);
      } else {
        console.log('图片URL无效，使用默认图片');
      }
    } 
    // 尝试从images数组获取图片
    else if (activity.images && Array.isArray(activity.images) && activity.images.length > 0) {
      const firstImage = activity.images[0];
      if (firstImage && typeof firstImage === 'string' && !firstImage.startsWith('http://tmp/')) {
        image = firstImage;
        console.log('使用images[0]:', image);
      } else {
        console.log('images[0]无效，使用默认图片');
      }
    } 
    // 尝试从organizer.avatar获取图片
    else if (activity.organizer && activity.organizer.avatar && activity.organizer.avatar !== null) {
      let avatarUrl = activity.organizer.avatar;
      if (typeof avatarUrl === 'string') {
        avatarUrl = avatarUrl.trim().replace(/`/g, '').replace(/^`|`$/g, '');
      }
      console.log('清理后的头像URL:', avatarUrl);
      if (avatarUrl && avatarUrl !== 'null' && avatarUrl !== '' && !avatarUrl.startsWith('http://tmp/')) {
        image = avatarUrl;
        console.log('使用organizer.avatar:', image);
      } else {
        console.log('头像URL无效，使用默认图片');
      }
    }
    // 使用默认图片
    else {
      console.log('没有有效的图片URL，使用默认图片');
    }
    
    console.log('最终使用的图片:', image);

    const transformedData = {
      id: activity.id,
      title: activity.title || '未知活动',
      time: time,
      location: activity.location || '未知地点',
      status: status,
      currentPeople: activity.current_participants || 0,
      totalPeople: activity.max_participants || 0,
      image: image
    };
    
    console.log('转换后的数据:', transformedData);
    return transformedData;
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
      app.request('/activities/joined', {}, 'GET', (err, res) => {
        console.log('获取参与活动返回数据:', err, res);
        if (!err && res && res.data && Array.isArray(res.data.activities)) {
          // 转换数据格式
          console.log('开始转换参与活动数据，数量:', res.data.activities.length);
          const transformedActivities = res.data.activities.map(activity => this.transformActivityData(activity));
          // 过滤掉已取消的活动
          const filteredActivities = transformedActivities.filter(activity => activity.status !== 'canceled');
          console.log('转换后的参与活动数据:', filteredActivities);
          this.setData({ joinedActivities: filteredActivities });
        } else if (!err && res && res.data && Array.isArray(res.data)) {
          // 转换数据格式
          console.log('开始转换参与活动数据（直接数组），数量:', res.data.length);
          const transformedActivities = res.data.map(activity => this.transformActivityData(activity));
          // 过滤掉已取消的活动
          const filteredActivities = transformedActivities.filter(activity => activity.status !== 'canceled');
          console.log('转换后的参与活动数据:', filteredActivities);
          this.setData({ joinedActivities: filteredActivities });
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
      app.request('/activities/created', {}, 'GET', (err, res) => {
        console.log('获取创建活动返回数据:', err, res);
        if (!err && res && res.data && Array.isArray(res.data.activities)) {
          // 转换数据格式
          const transformedActivities = res.data.activities.map(activity => this.transformActivityData(activity));
          // 过滤掉已取消的活动
          const filteredActivities = transformedActivities.filter(activity => activity.status !== 'canceled');
          this.setData({ createdActivities: filteredActivities });
        } else if (!err && res && res.data && Array.isArray(res.data)) {
          // 转换数据格式
          const transformedActivities = res.data.map(activity => this.transformActivityData(activity));
          // 过滤掉已取消的活动
          const filteredActivities = transformedActivities.filter(activity => activity.status !== 'canceled');
          this.setData({ createdActivities: filteredActivities });
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
      app.request('/activities/history', {}, 'GET', (err, res) => {
        console.log('获取历史活动返回数据:', err, res);
        if (!err && res && res.data && Array.isArray(res.data.activities)) {
          // 转换数据格式
          const transformedActivities = res.data.activities.map(activity => this.transformActivityData(activity));
          // 过滤掉已取消的活动
          const filteredActivities = transformedActivities.filter(activity => activity.status !== 'canceled');
          this.setData({ historyActivities: filteredActivities });
        } else if (!err && res && res.data && Array.isArray(res.data)) {
          // 转换数据格式
          const transformedActivities = res.data.map(activity => this.transformActivityData(activity));
          // 过滤掉已取消的活动
          const filteredActivities = transformedActivities.filter(activity => activity.status !== 'canceled');
          this.setData({ historyActivities: filteredActivities });
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
  },

  // 取消活动
  cancelActivity: function(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '取消中...'
          });
          
          app.request(`/activities/${id}/cancel`, {}, 'PUT', (err, res) => {
            wx.hideLoading();
            if (!err && res && res.status === 'success') {
              // 从列表中移除该活动
              const updatedActivities = this.data.createdActivities.filter(activity => activity.id !== id);
              this.setData({
                createdActivities: updatedActivities
              });
              
              wx.showToast({
                title: '活动已取消',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '取消失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  }
})