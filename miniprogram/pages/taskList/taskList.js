const app = getApp()

// pages/taskList/taskList.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    taskList: [],
    taskName: '',
    taskReward: '',
    toView: 'toView',
    scrollTop: 'scrollTop'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app)
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow')
    this.onQueryTask()

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onHide')

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log('用户点击右上角分享')
  },

  bindNameInput: function (e) {
    this.setData({
      taskName: e.detail.value
    })
  },
  bindRewardInput: function (e) {
    this.setData({
      taskReward: e.detail.value
    })
  },
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
    // wx.showModal({
    //   title: '提示',
    //   content: '',
    //   placeholderText: '请输入任务名称',
    //   editable: true,
    //   success(res) {
    //     if (res.confirm) {
    //       console.log('用户点击确定', res.content)
    //       })
    //     } else if (res.cancel) {
    //       console.log('用户点击取消')
    //     }
    //   }
  },
  onRemove: function (e) {
    // console.log('onRemove', e.currentTarget.dataset.task)
    let taskId = null
    if (e.currentTarget.dataset.task) {
      taskId = e.currentTarget.dataset.task._id
    }
    if (taskId) {
      const db = wx.cloud.database()
      db.collection('task').doc(taskId).remove({
        success: res => {
          wx.showToast({
            title: '删除成功',
          })
          this.setData({
            taskList: this.data.taskList.filter(x => {
              return x._id !== taskId
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

  onQueryTask: function () {
    console.log(this.data.openid)
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('task').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
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
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },


  onCounterInc: function () {
    const db = wx.cloud.database()
    const newCount = this.data.count + 1
    db.collection('counters').doc(this.data.counterId).update({
      data: {
        count: newCount
      },
      success: res => {
        this.setData({
          count: newCount
        })
      },
      fail: err => {
        icon: 'none',
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  }
})