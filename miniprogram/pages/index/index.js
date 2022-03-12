//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
  data: {
    dailyTask: [],
    rewardMap: {},
    changeInfo: {},
    changeFlag: true,
    currentDate: '',
    endTime: '2122-01-01'
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 查看是否授权
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       wx.getUserInfo({
    //         success: res => {
    //           console.log(res.userInfo)
    //           this.setData({
    //             avatarUrl: res.userInfo.avatarUrl,
    //             userInfo: res.userInfo
    //           })
    //         }
    //       })
    //     }
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.rewardFunction()
    this.onQueryDailyTask()
    let bt = new Date()
    let yy = bt.getFullYear()
    let mm = bt.getMonth() + 1
    let dd = bt.getDate()
    this.setData({
      currentDate: yy + '-' + mm + '-' + dd
    })

  },

  /**
   * 查询每日任务
   */
  onQueryDailyTask: function (bt = null) {
    if (!bt) {
      bt = new Date(new Date().toLocaleDateString()).getTime()
    }
    db.collection('dailyTask').where({
      _openid: app.globalData.openid,
      belongTime: bt
    }).get({
      success: res => {
        // console.log('[数据库] [查询记录] 成功: ', res)
        this.setData({
          dailyTask: res.data,
          changeFlag: true
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },

  rewardFunction() {
    wx.cloud.callFunction({
      name: 'taskReward',
      data: {},
      success: res => {
        // console.log(res)
        // wx.showToast({
        //   title: '调用成功',
        // })
        this.setData({
          rewardMap: res.result.rewardMap
        })
      },
      fail: err => {
        // wx.showToast({
        //   icon: 'none',
        //   title: '调用失败',
        // })
        console.error('[云函数] [sum] 调用失败：', err)
      }
    })
  },

  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    if (!e.detail.value) return
    this.onQueryDailyTask(new Date(new Date(e.detail.value).toLocaleDateString()).getTime())
    this.setData({
      currentDate: e.detail.value
    })
  },

  /**
   * 更新每日任务
   */
  switch1Change: function (e) {
    if (!this.data.changeFlag) {
      wx.showToast({
        icon: 'loading',
        title: '正在修改状态，请稍后再试！',
        mask: true
      })
      return
    }
    const {
      task,
      taskState,
      taskStateName
    } = e.currentTarget.dataset
    if (this.data.rewardMap[taskStateName]) {
      // 当前任务对应的奖励
      let currentReward = Number(this.data.rewardMap[taskStateName])
      // 修改后的总奖励
      let totalReward = task.totalMoney
      if (taskState) {
        totalReward = totalReward - currentReward
      } else {
        totalReward = totalReward + currentReward
      }
      // let totalReward = taskState ? task.totalMoney - currentReward : task.totalMoney + currentReward

      // 修改后的任务状态
      let taskStates = task.taskState
      taskStates[taskStateName] = !taskState

      this.setData({
        changeFlag: false
        // changeInfo: {
        //   id: task._id,
        //   totalReward: totalReward,
        //   taskStates: taskStates,
        // }
      })
      // 修改每日任务的状态
      db.collection('dailyTask').doc(task._id).update({
        data: {
          taskState: taskStates,
          totalMoney: totalReward,
        },
        success: (res) => {
          this.onQueryDailyTask()
          // let newDailyTask = this.data.dailyTask
          // const {
          //   id,
          //   totalReward,
          //   taskStates
          // } = this.data.changeInfo
          // for (const ndt of newDailyTask) {
          //   if (ndt._id === id) {
          //     ndt.taskState = taskStates
          //     ndt.totalMoney = totalReward
          //   }
          // }
          // this.setData({
          //   dailyTask: newDailyTask
          // })
        },
        fail: (err) => {
          this.onQueryDailyTask()
          // wx.showToast({
          //   icon: 'none',
          //   title: '修改记录失败'
          // })
        }
      })
    } else {
      // 如果不知道reward就返回并重置状态
      wx.showToast({
        icon: 'none',
        title: '数据加载不全，请稍后再试！'
      })
      this.onQueryDailyTask()
    }
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  }
})