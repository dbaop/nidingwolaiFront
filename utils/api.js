// API 请求工具类
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * 获取存储的 token
 */
function getToken() {
  try {
    return wx.getStorageSync('token');
  } catch (e) {
    console.error('获取 token 失败:', e);
    return '';
  }
}

/**
 * 封装请求方法
 * @param {string} url - 请求地址
 * @param {object} options - 请求配置
 * @returns {Promise} - 返回 Promise 对象
 */
function request(url, options = {}) {
  const token = getToken();
  const fullUrl = `${API_BASE_URL}${url}`;

  console.log('API请求:', {
    url: fullUrl,
    method: options.method || 'GET',
    data: options.data,
    hasToken: !!token
  });

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        console.log('API响应:', {
          url: fullUrl,
          statusCode: res.statusCode,
          data: res.data
        });

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const error = new Error(res.data.message || '请求失败');
          error.statusCode = res.statusCode;
          error.response = res.data;
          reject(error);
        }
      },
      fail: (err) => {
        console.error('API请求失败:', {
          url: fullUrl,
          error: err
        });
        reject(new Error('网络请求失败，请检查网络连接'));
      }
    });
  });
}

/**
 * API 接口封装
 */
const api = {
  // 用户报名
  enroll: (data) => {
    return request('/enrollments/', {
      method: 'POST',
      data: data
    });
  },

  // 创办者同意报名
  approveEnrollment: (id) => {
    return request(`/enrollments/${id}/approve`, {
      method: 'PUT'
    });
  },

  // 创办者拒绝报名
  rejectEnrollment: (id) => {
    return request(`/enrollments/${id}/reject`, {
      method: 'PUT'
    });
  },

  // 用户取消报名
  cancelEnrollment: (id) => {
    return request(`/enrollments/${id}`, {
      method: 'DELETE'
    });
  },

  // 获取活动的报名列表
  getEnrollments: (activityId) => {
    return request(`/enrollments/?activity_id=${activityId}`, {
      method: 'GET'
    });
  },

  // 获取用户的报名记录
  getUserEnrollments: () => {
    return request('/enrollments/', {
      method: 'GET'
    });
  }
};

module.exports = {
  api,
  request,
  getToken
};
