// create.js
const { api } = require('../../utils/api.js');

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
    
    // 初始化页面数据
    this.setData({
      // 时间选择器相关
      startDate: '', // 开始日期
      startTime: '', // 开始时间
      endDate: '', // 结束日期
      endTime: '', // 结束时间
      formattedTime: '', // 格式化的开始时间
      formattedEndTime: '', // 格式化的结束时间
      
      // 其他默认值
      registrationDeadline: '2', // 默认活动开始前2小时截止报名
      depositRule: '1' // 默认活动开始前1小时不取消押金不退
    })
    
    console.log('页面数据初始化完成')
  },

  // 测试picker组件
  testPicker: function() {
    console.log('测试picker组件')
    wx.showToast({
      title: 'picker组件测试',
      icon: 'none'
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
    // 微信小程序picker需要 YYYY-MM-DDTHH:mm 格式（注意T分隔符）
    return `${year}-${month}-${day}T${hour}:${minute}`
  },

  // 格式化日期时间
  formatDateTime: function (date) {
    if (!date) return ''
    
    // 如果是字符串，转换为Date对象
    if (typeof date === 'string') {
      date = new Date(date)
    }
    
    // 如果转换失败，返回空字符串
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 格式化日期时间为后端需要的格式（iOS兼容）
  formatDateTimeForBackend: function (dateStr, timeStr) {
    if (!dateStr || !timeStr) return ''
    
    // 解析日期和时间
    const dateParts = dateStr.split('-')
    const timeParts = timeStr.split(':')
    
    // 使用iOS兼容的格式：yyyy-MM-ddTHH:mm:ss
    const year = dateParts[0]
    const month = dateParts[1]
    const day = dateParts[2]
    const hour = timeParts[0]
    const minute = timeParts[1]
    const second = '00'
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`
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

  // 处理开始日期变化
  onStartDateChange: function (e) {
    console.log('开始日期变化:', e.detail.value)
    this.setData({
      startDate: e.detail.value
    })
    this.updateFormattedTime()
  },

  // 处理开始时间变化
  onStartTimeChange: function (e) {
    console.log('开始时间变化:', e.detail.value)
    this.setData({
      startTime: e.detail.value
    })
    this.updateFormattedTime()
  },

  // 处理结束日期变化
  onEndDateChange: function (e) {
    console.log('结束日期变化:', e.detail.value)
    this.setData({
      endDate: e.detail.value
    })
    this.updateFormattedEndTime()
  },

  // 处理结束时间变化
  onEndTimeChange: function (e) {
    console.log('结束时间变化:', e.detail.value)
    this.setData({
      endTime: e.detail.value
    })
    this.updateFormattedEndTime()
  },

  // 更新格式化的开始时间
  updateFormattedTime: function () {
    if (this.data.startDate && this.data.startTime) {
      // 使用ISO格式兼容iOS：2026-01-18T14:30
      const dateTimeStr = this.data.startDate + 'T' + this.data.startTime
      const startDateTime = new Date(dateTimeStr)

      // 格式化日期用于显示
      const formattedDate = `${startDateTime.getFullYear()}年${startDateTime.getMonth() + 1}月${startDateTime.getDate()}日`
      const formattedTime = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`

      this.setData({
        formattedTime: formattedDate + ' ' + formattedTime
      })

      // 自动设置结束时间（开始时间加1小时）
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)
      const endDate = endDateTime.getFullYear() + '-' +
                    String(endDateTime.getMonth() + 1).padStart(2, '0') + '-' +
                    String(endDateTime.getDate()).padStart(2, '0')
      const endTime = String(endDateTime.getHours()).padStart(2, '0') + ':' +
                    String(endDateTime.getMinutes()).padStart(2, '0')

      // 格式化结束时间用于显示
      const formattedEndDate = `${endDateTime.getFullYear()}年${endDateTime.getMonth() + 1}月${endDateTime.getDate()}日`
      const formattedEndTime = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`

      this.setData({
        endDate: endDate,
        endTime: endTime,
        formattedEndTime: formattedEndDate + ' ' + formattedEndTime
      })

      this.checkCanSubmit()
    }
  },

  // 更新格式化的结束时间
  updateFormattedEndTime: function () {
    if (this.data.endDate && this.data.endTime) {
      // 格式化日期：2026-01-18
      const dateParts = this.data.endDate.split('-')
      const formattedDate = `${dateParts[0]}年${dateParts[1]}月${dateParts[2]}日`
      
      // 格式化时间：14:30
      const timeParts = this.data.endTime.split(':')
      const formattedTime = `${timeParts[0]}:${timeParts[1]}`
      
      const formattedEndTimeStr = `${formattedDate} ${formattedTime}`
      this.setData({
        formattedEndTime: formattedEndTimeStr
      })
      this.checkCanSubmit()
    }
  },

  // 点击开始时间按钮
  onTimePickerClick: function () {
    console.log('点击开始时间按钮')
    
    // 使用wx.showActionSheet来显示时间选择选项
    wx.showActionSheet({
      itemList: ['1小时后', '2小时后', '明天同一时间'],
      success: (res) => {
        console.log('选择了时间选项:', res.tapIndex)
        
        const now = new Date()
        let selectedDate
        
        switch (res.tapIndex) {
          case 0: // 1小时后
            selectedDate = new Date(now.getTime() + 60 * 60 * 1000)
            break
          case 1: // 2小时后
            selectedDate = new Date(now.getTime() + 2 * 60 * 60 * 1000)
            break
          case 2: // 明天同一时间
            selectedDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            break
          default:
            return
        }
        
        // 格式化日期时间
        const formattedTime = this.formatDateTime(selectedDate)
        
        // 更新页面数据
        this.setData({
          dateTime: selectedDate,
          formattedTime: formattedTime
        })
        
        console.log('设置开始时间:', formattedTime)
        this.checkCanSubmit()
      },
      fail: (res) => {
        console.log('取消选择时间:', res)
      }
    })
  },

  // 处理开始时间输入
  onTimeInput: function (e) {
    console.log('开始时间输入:', e.detail.value)
    
    const timeValue = e.detail.value
    if (!timeValue) {
      console.log('时间值为空，返回')
      return
    }
    
    // 解析时间值
    const date = new Date(timeValue)
    if (isNaN(date.getTime())) {
      console.log('无效的日期时间值:', timeValue)
      return
    }
    
    // 格式化日期时间
    const formattedTime = this.formatDateTime(date)
    
    // 更新页面数据
    this.setData({
      dateTime: date,
      formattedTime: formattedTime
    })
    
    console.log('设置开始时间:', formattedTime)
    this.checkCanSubmit()
  },

  // 处理结束时间输入
  onEndTimeInput: function (e) {
    console.log('结束时间输入:', e.detail.value)
    
    const timeValue = e.detail.value
    if (!timeValue) {
      console.log('时间值为空，返回')
      return
    }
    
    // 解析时间值
    const date = new Date(timeValue)
    if (isNaN(date.getTime())) {
      console.log('无效的日期时间值:', timeValue)
      return
    }
    
    // 确保结束时间不早于开始时间
    if (this.data.dateTime) {
      const startTime = new Date(this.data.dateTime)
      if (date <= startTime) {
        wx.showToast({
          title: '结束时间不能早于开始时间',
          icon: 'none'
        })
        return
      }
    }
    
    // 格式化日期时间
    const formattedEndTime = this.formatDateTime(date)
    
    // 更新页面数据
    this.setData({
      endDateTime: date,
      formattedEndTime: formattedEndTime
    })
    
    console.log('设置结束时间:', formattedEndTime)
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
        
        // 上传图片到服务器
        this.uploadImage(tempFilePaths[0])
        this.checkCanSubmit()
      }
    })
  },

  // 上传图片到服务器
  uploadImage: function(filePath) {
    const token = wx.getStorageSync('token');
    console.log('上传图片，使用的token:', token);
    console.log('token是否有效:', token && token.length > 20 ? '是' : '否');
    console.log('上传的文件路径:', filePath);

    // 检查token是否存在且有效
    if (!token || token.length < 20) {
      wx.hideLoading();
      console.error('Token无效或不存在');
      wx.showModal({
        title: '登录已过期',
        content: '请重新登录后再试',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
    
    wx.showLoading({
      title: '上传图片中...'
    });

    wx.uploadFile({
      url: 'http://localhost:5000/api/upload/image',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        wx.hideLoading();
        console.log('图片上传成功，状态码:', res.statusCode);
        console.log('响应数据类型:', typeof res.data);
        console.log('响应数据:', res.data);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          let data;
          try {
            if (typeof res.data === 'string') {
              data = JSON.parse(res.data);
            } else {
              data = res.data;
            }
          } catch (e) {
            console.error('解析响应数据失败:', e);
            data = res.data;
          }
          
          console.log('解析后的数据:', data);
          
          // 处理不同的响应格式
          let imageUrl = null;
          if (data && data.data) {
            // 格式1: {data: {url: "..."}}
            imageUrl = data.data.url || data.data.image_url || data.data.image;
          } else if (data && (data.url || data.image_url || data.image)) {
            // 格式2: {url: "..."}
            imageUrl = data.url || data.image_url || data.image;
          }
          
          // 如果图片URL是相对路径，转换为完整URL
          if (imageUrl && imageUrl.startsWith('/')) {
            imageUrl = 'http://localhost:5000' + imageUrl;
          }
          
          if (imageUrl) {
            console.log('使用的图片URL:', imageUrl);
            this.setData({
              activityImage: imageUrl,
              activityImageUrl: imageUrl
            });
            wx.showToast({
              title: '图片上传成功',
              icon: 'success'
            });
          } else {
            console.error('响应数据中没有图片URL，数据:', data);
            wx.showToast({
              title: '图片上传失败',
              icon: 'none'
            });
          }
        } else {
          console.error('上传失败，状态码:', res.statusCode);
          wx.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('图片上传失败:', err);
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        });
      }
    });
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
    
    if (!this.data.startDate || !this.data.startTime) {
      wx.showToast({
        title: '请选择活动开始时间',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.endDate || !this.data.endTime) {
      wx.showToast({
        title: '请选择活动结束时间',
        icon: 'none'
      })
      return
    }
    
    // 验证结束时间必须晚于开始时间
    const startDateTime = new Date(this.data.startDate + ' ' + this.data.startTime)
    const endDateTime = new Date(this.data.endDate + ' ' + this.data.endTime)
    if (endDateTime <= startDateTime) {
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
      start_time: this.formatDateTimeForBackend(this.data.startDate, this.data.startTime),
      end_time: this.formatDateTimeForBackend(this.data.endDate, this.data.endTime),
      location: this.data.location,
      current_people: String(this.data.currentPeople), // 后端期望字符串
      max_participants: String(this.data.totalPeople), // 后端期望字符串
      price: String(parseFloat(this.data.price) || 0), // 确保是字符串类型
      description: this.data.description || '',
      tags: this.data.selectedTags || [],
      box_type: this.data.boxType,
      // 活动图片
      image: this.data.activityImage || '',
      // 添加活动规则相关字段
      registration_deadline: String(parseInt(this.data.registrationDeadline) || 2), // 后端期望字符串
      deposit_rule: String(parseInt(this.data.depositRule) || 1), // 后端期望字符串
      has_deposit: this.data.hasDeposit,
      deposit_amount: String(parseFloat(this.data.depositAmount) || 0), // 后端期望字符串
      // 移除可能不被后端接受的字段
      // createTime: new Date().toISOString(), // 后端可能自己生成
      // creatorRole: this.data.userRole // 后端从token中获取角色
    }
    
    console.log('调整后表单数据:', formData)

    wx.showLoading({
      title: '创建中...'
    })

    // 调用后端API提交数据
    api.createActivity(formData).then(res => {
      wx.hideLoading()
      console.log('活动创建成功:', res)

      wx.showToast({
        title: '活动创建成功',
        icon: 'success'
      })

      // 返回首页并刷新数据
      setTimeout(() => {
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2] // 获取上一个页面（首页）

        if (prevPage && prevPage.route === 'pages/index/index') {
          // 如果上一个页面是首页，重新加载活动数据
          console.log('刷新首页活动列表')
          prevPage.loadActivities()
        }

        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      wx.hideLoading()
      console.error('活动创建失败:', err)

      wx.showToast({
        title: err.message || '创建失败，请重试',
        icon: 'none'
      })
    })
  }
})