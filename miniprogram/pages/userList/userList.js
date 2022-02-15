const app = getApp()

// pages/userList/userList.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid: '', // 用户的openid
    userList: [], // 用户列表
    userName: '', // 用户ni'ch
    taskList: '', // 任务名称
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
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onQueryUser()
    this.onQueryTask()
  },

  /**
   * 修改用户名称数据
   */
  bindNameInput: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },

  /**
   * 添加用户
   */
  onAddUser: function () {
    if (this.data.userName) {
      const db = wx.cloud.database()
      db.collection('children').add({
        data: {
          name: this.data.userName,
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          let oldData = [...this.data.userList, {
            _id: res._id,
            _openid: app.globalData.openid,
            name: this.data.userName,
          }]

          wx.showToast({
            title: '新增用户成功',
          })
          // console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          // 自动创建每日任务
          let ts = {}
          for (const task of this.data.taskList) {
            ts[task.name] = false
          }
          let dd = {
            // _openid: app.globalData.openid,
            userId: res._id,
            userName: this.data.userName,
            taskState: ts,
            hasPaied: false,
            totalMoney: 0,
            createTime: new Date().toLocaleString(),
            belongTime: new Date(new Date().toLocaleDateString()).getTime()
          }
          db.collection('dailyTask').add({
            data: dd
          }).then(res => {
            console.log(res)
          })
          this.setData({
            userList: oldData,
            userName: '',
          })

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
   * 删除用户
   */
  onRemoveUser: function (e) {
    // console.log('onRemoveUser', e.currentTarget.dataset.task)
    if (e.currentTarget.dataset.task) {
      const {
        name,
        _id,
        _openid
      } = e.currentTarget.dataset.task
      const db = wx.cloud.database()
      // 删除用户信息
      db.collection('children').doc(_id).remove({
        success: res => {
          wx.showToast({
            title: '删除成功',
          })
          this.setData({
            userList: this.data.userList.filter(x => {
              return x._id !== _id
            })
          })
          // 删除今天的任务数据
          db.collection('dailyTask').where({
            userName: name,
            _openid: _openid,
            belongTime: new Date(new Date().toLocaleDateString()).getTime()
          }).remove().then(res => {
            console.log(res)
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
  onQueryUser: function () {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('children').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        // console.log('[数据库] [查询记录] 成功: ', res)
        this.setData({
          userList: res.data
          // userList: JSON.stringify(res.data, null, 2)
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
        })
      },
      fail: err => {
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  }
})