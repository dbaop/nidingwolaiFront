// create.js
Page({
  data: {
    // 活动类型
    activityType: 'k歌',
    
    // 表单数据
    title: '',
    dateTime: '',
    formattedTime: '',
    endDateTime: '',
    formattedEndTime: '',
    minEndTime: '', // 结束时间的最小可选值
    location: '',
    currentPeople: 1,
    totalPeople: 4,
    price: '',
    description: '',
    activityImage: '', // 活动图片
    activityImageUrl: '', // 活动图片预览URL
    
    // 新增：活动规则
    registrationDeadline: '', // 报名截止时间（活动开始前多久）
    depositRule: '', // 押金规则（活动开始前多久不取消押金不退）
    hasDeposit: false, // 是否需要押金
    depositAmount: 0, // 押金金额
    
    // 选中的标签
    selectedTags: [],
    
    // 可用标签
    availableTags: ['周杰伦', '流行音乐', '摇滚', '民谣', '林俊杰', '五月天', '陈奕迅', '华语经典', '粤语歌曲', '英文歌曲', '说唱', '麦霸'],
    
    // 包厢类型
    boxType: '小包',
    
    // 用户角色
    userRole: 'user', // 默认为普通用户
    
    // 是否可以提交表单
    canSubmit: false
  },

  onLoad: function () {
    console.log('创建活动页面加载');
    
    // 获取应用实例
    const app = getApp();
    
    // 检查用户权限
    if (!app.checkPermission('user')) {
      wx.showModal({
        title: '权限不足',
        content: '您没有权限创建活动',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
    
    // 设置用户角色
    this.setData({
      userRole: app.globalData.userRole || 'user'
    });
    
    // 不设置初始时间，让用户自己选择
    this.setData({
      dateTime: '',
      endDateTime: '',
      formattedTime: '',
      formattedEndTime: '',
      // 设置默认值
      registrationDeadline: '2', // 默认活动开始前2小时截止报名
      depositRule: '1' // 默认活动开始前1小时不取消押金不退
    })
  },

  // 测试选择器功能
  testPicker: function() {
    console.log('测试选择器被点击');
    wx.showToast({
      title: '测试按钮点击成功',
      icon: 'none'
    });
  },

  // 格式化日期时间为picker需要的格式
  formatDateTimeForPicker: function(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    // 微信小程序picker需要 YYYY-MM-DD HH:mm 格式
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 格式化日期时间
  formatDateTime: function (dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 活动类型选择
  onActivityTypeChange: function (e) {
    this.setData({
      activityType: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 表单输入处理
  onTitleInput: function (e) {
    this.setData({
      title: e.detail.value
    })
    this.checkCanSubmit()
  },

  onTimeChange: function (e) {
    console.log('开始时间选择器事件触发:', e)
    console.log('选择的值:', e.detail.value)
    
    const dateTime = e.detail.value
    if (!dateTime) {
      console.log('时间值为空，返回')
      return
    }
    
    // 计算开始时间加1分钟，作为结束时间的最小值
    const minEndTime = new Date(new Date(dateTime).getTime() + 60 * 1000)
    const minEndTimeStr = this.formatDateTimeForPicker(minEndTime)
    
    // 如果当前结束时间早于或等于新的开始时间，则更新结束时间
    let newEndTime = this.data.endDateTime
    if (!this.data.endDateTime || new Date(this.data.endDateTime) <= new Date(dateTime)) {
      newEndTime = minEndTimeStr
    }
    
    console.log('设置数据:', {
      dateTime: dateTime,
      minEndTime: minEndTimeStr,
      newEndTime: newEndTime
    })
    
    this.setData({
      dateTime: dateTime,
      formattedTime: this.formatDateTime(dateTime),
      endDateTime: newEndTime,
      formattedEndTime: this.formatDateTime(newEndTime),
      minEndTime: minEndTimeStr
    })
    this.checkCanSubmit()
  },

  onEndTimeChange: function (e) {
    console.log('结束时间选择器被触发:', e.detail.value)
    const endDateTime = e.detail.value
    this.setData({
      endDateTime: endDateTime,
      formattedEndTime: this.formatDateTime(endDateTime)
    })
    this.checkCanSubmit()
  },

  onLocationInput: function (e) {
    this.setData({
      location: e.detail.value
    })
    this.checkCanSubmit()
  },

  onPriceInput: function (e) {
    this.setData({
      price: e.detail.value
    })
    this.checkCanSubmit()
  },

  onDescriptionInput: function (e) {
    this.setData({
      description: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 人数输入处理
  onCurrentPeopleInput: function (e) {
    let value = parseInt(e.detail.value) || 1
    if (value < 1) value = 1
    if (value > this.data.totalPeople) value = this.data.totalPeople
    this.setData({
      currentPeople: value
    })
  },

  onTotalPeopleInput: function (e) {
    let value = parseInt(e.detail.value) || 1
    if (value < this.data.currentPeople) value = this.data.currentPeople
    if (value > 20) value = 20
    this.setData({
      totalPeople: value
    })
  },

  // 人数控制
  decreaseCurrent: function () {
    if (this.data.currentPeople > 1) {
      this.setData({
        currentPeople: this.data.currentPeople - 1
      })
    }
  },

  increaseCurrent: function () {
    if (this.data.currentPeople < this.data.totalPeople) {
      this.setData({
        currentPeople: this.data.currentPeople + 1
      })
    }
  },

  decreaseTotal: function () {
    if (this.data.totalPeople > this.data.currentPeople) {
      this.setData({
        totalPeople: this.data.totalPeople - 1
      })
    }
  },

  increaseTotal: function () {
    if (this.data.totalPeople < 20) {
      this.setData({
        totalPeople: this.data.totalPeople + 1
      })
    }
  },

  // 选择位置
  onChooseLocation: function () {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.name
        })
        this.checkCanSubmit()
      }
    })
  },

  // 选择活动图片
  onChooseImage: function () {
    wx.chooseImage({
      count: 1, // 最多选择1张图片
      sizeType: ['original', 'compressed'], // 可选择原图或压缩图
      sourceType: ['album', 'camera'], // 可选择相册或拍照
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          activityImage: tempFilePaths[0],
          activityImageUrl: tempFilePaths[0]
        })
        this.checkCanSubmit()
      }
    })
  },

  // 标签选择
  toggleTag: function (e) {
    const tag = e.currentTarget.dataset.tag
    let selectedTags = this.data.selectedTags
    
    if (selectedTags.includes(tag)) {
      // 移除标签
      selectedTags = selectedTags.filter(item => item !== tag)
    } else {
      // 添加标签
      selectedTags.push(tag)
    }
    
    this.setData({
      selectedTags: selectedTags
    })
  },

  // 包厢类型选择
  onBoxTypeChange: function (e) {
    this.setData({
      boxType: e.detail.value
    })
  },

  // 押金开关
  onDepositChange: function (e) {
    this.setData({
      hasDeposit: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 押金金额输入
  onDepositAmountInput: function (e) {
    this.setData({
      depositAmount: parseFloat(e.detail.value) || 0
    })
    this.checkCanSubmit()
  },

  // 报名截止时间选择
  onRegistrationDeadlineChange: function (e) {
    this.setData({
      registrationDeadline: e.detail.value
    })
  },

  // 押金规则选择
  onDepositRuleChange: function (e) {
    this.setData({
      depositRule: e.detail.value
    })
  },

  // 检查是否可以提交表单
  checkCanSubmit: function () {
    const { title, formattedTime, formattedEndTime, location, price } = this.data
    const canSubmit = title.trim() !== '' && formattedTime !== '' && formattedEndTime !== '' && location.trim() !== '' && price.trim() !== ''
    this.setData({
      canSubmit: canSubmit
    })
  },

  // 提交表单
  onFormSubmit: function () {
    // 表单验证
    if (!this.data.title) {
      wx.showToast({
        title: '请输入活动标题',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.dateTime) {
      wx.showToast({
        title: '请选择活动开始时间',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.endDateTime) {
      wx.showToast({
        title: '请选择活动结束时间',
        icon: 'none'
      })
      return
    }
    
    // 验证结束时间必须晚于开始时间
    if (new Date(this.data.endDateTime) <= new Date(this.data.dateTime)) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.location) {
      wx.showToast({
        title: '请输入活动地点',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.price) {
      wx.showToast({
        title: '请输入费用说明',
        icon: 'none'
      })
      return
    }
    
    // 如果需要押金，验证押金金额
    if (this.data.hasDeposit && this.data.depositAmount <= 0) {
      wx.showToast({
        title: '请输入有效的押金金额',
        icon: 'none'
      })
      return
    }
    
    // 调整表单数据格式以匹配后端API期望
    // 确保日期时间格式包含秒信息，符合ISO 8601标准
    const formatDateTimeForBackend = (dateTimeStr) => {
      // 如果字符串已经包含秒信息，则直接返回
      if (dateTimeStr.includes(':')) {
        const parts = dateTimeStr.split(':');
        if (parts.length >= 2) {
          // 确保格式为 YYYY-MM-DDTHH:MM:SS
          if (parts[1].length === 2 && !dateTimeStr.includes(':' + parts[1] + ':')) {
            return dateTimeStr + ':00';
          }
        }
      }
      return dateTimeStr;
    };
    
    const formData = {
      // 确保基本字段存在且格式正确
      type: this.data.activityType,
      title: this.data.title,
      start_time: formatDateTimeForBackend(this.data.dateTime), // 确保日期时间格式包含秒信息
      end_time: formatDateTimeForBackend(this.data.endDateTime), // 确保日期时间格式包含秒信息
      location: this.data.location,
      current_people: parseInt(this.data.currentPeople), // 后端期望的字段名可能是current_people（下划线分隔）
      max_participants: parseInt(this.data.totalPeople), // 后端期望的字段名是max_participants（总人数）
      price: parseFloat(this.data.price) || 0, // 确保是数字类型
      description: this.data.description || '',
      tags: this.data.selectedTags || [],
      box_type: this.data.boxType, // 后端期望的字段名可能是box_type（下划线分隔）
      // 活动图片
      image: this.data.activityImage || '',
      // 添加活动规则相关字段
      registration_deadline: parseInt(this.data.registrationDeadline) || 2, // 报名截止时间（活动开始前2小时）
      deposit_rule: parseInt(this.data.depositRule) || 1, // 押金规则（活动开始前1小时不取消押金不退）
      has_deposit: this.data.hasDeposit, // 后端期望的字段名可能是has_deposit（下划线分隔）
      deposit_amount: parseFloat(this.data.depositAmount) || 0, // 后端期望的字段名可能是deposit_amount（下划线分隔）
      // 移除可能不被后端接受的字段
      // createTime: new Date().toISOString(), // 后端可能自己生成
      // creatorRole: this.data.userRole // 后端从token中获取角色
    }
    
    console.log('调整后表单数据:', formData)
    
    // 获取应用实例
    const app = getApp();
    
    // 调用后端API提交数据
    app.request('/activities/', formData, 'POST', (err) => {
      if (err) {
        wx.showToast({
          title: '创建失败，请重试',
          icon: 'none'
        })
        return
      }
      
      wx.showToast({
        title: '活动创建成功'
      })
      
      // 返回首页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    })
  }
})