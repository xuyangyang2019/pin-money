const app = getApp()

// pages/taskList/taskList.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid: '', // 用户的openid
    taskList: [], // 任务列表
    taskName: '', // 任务名称
    taskReward: '', // 任务奖励
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onQueryTask()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  // onHide: function () {
  // },

  /**
   * 生命周期函数--监听页面卸载
   */
  // onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   console.log('用户点击右上角分享')
  // },

  /**
   * 修改任务名称数据
   */
  bindNameInput: function (e) {
    this.setData({
      taskName: e.detail.value
    })
  },

  /**
   * 修改任务奖励数据
   */
  bindRewardInput: function (e) {
    this.setData({
      taskReward: e.detail.value
    })
  },

  /**
   * 添加任务
   */
  onAddTask: function () {
    if (this.data.taskReward && this.data.taskName) {
      const db = wx.cloud.database()
      db.collection('task').add({
        data: {
          name: this.data.taskName,
          reward: this.data.taskReward
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          let oldData = [...this.data.taskList, {
            _id: res._id,
            _openid: app.globalData.openid,
            name: this.data.taskName,
            reward: this.data.taskReward
          }]

          // 更新每日任务
          let time = new Date(new Date().toLocaleDateString()).getTime()
          this.updateTaskFunction(this.data.taskName, time)

          // 更新当前数据
          this.setData({
            taskList: oldData,
            taskName: '',
            taskReward: ''
          })
          wx.showToast({
            title: '新增记录成功',
          })
          // console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)

        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '新增记录失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    } else {
      wx.showToast({
        title: '数据格式不正确，不能添加！',
        icon: 'error'
      })
    }
  },

  /**
   * 删除任务
   */
  onRemoveTask: function (e) {
    console.log('onRemoveTask', e.currentTarget.dataset.task)
    if (e.currentTarget.dataset.task) {
      const {
        _id,
        _openid,
        name
      } = e.currentTarget.dataset.task
      if (!_id) return
      const db = wx.cloud.database()
      db.collection('task').doc(_id).remove({
        success: res => {
          wx.showToast({
            title: '删除成功',
          })
          // 删除每日任务中的数据
          let time = new Date(new Date().toLocaleDateString()).getTime()
          this.updateTaskFunction(name, time, true)

          this.setData({
            taskList: this.data.taskList.filter(x => {
              return x._id !== _id
            })
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '删除失败',
          })
          console.error('[数据库] [删除记录] 失败：', err)
        }
      })
    } else {
      wx.showToast({
        title: '无记录可删，请见创建一个记录',
      })
    }
  },

  /**
   * 查询任务
   */
  onQueryTask: function () {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('task').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        // console.log('[数据库] [查询记录] 成功: ', res)
        this.setData({
          taskList: res.data
          // taskList: JSON.stringify(res.data, null, 2)
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        // console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  // 更新任务
  updateTaskFunction(name, time, deleteKey = false) {
    wx.cloud.callFunction({
      name: 'updateTask',
      data: {
        taskName: name,
        belongTime: time,
        deleteKey: deleteKey
      },
      success: res => {
        console.log(res)
        wx.showToast({
          title: '调用成功',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [sum] 调用失败：', err)
      }
    })
  },

  // onCounterInc: function () {
  //   const db = wx.cloud.database()
  //   const newCount = this.data.count + 1
  //   db.collection('counters').doc(this.data.counterId).update({
  //     data: {
  //       count: newCount
  //     },
  //     success: res => {
  //       this.setData({
  //         count: newCount
  //       })
  //     },
  //     fail: err => {
  //       icon: 'none',
  //       console.error('[数据库] [更新记录] 失败：', err)
  //     }
  //   })
  // }
})