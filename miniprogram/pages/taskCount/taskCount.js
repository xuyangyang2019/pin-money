//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
  data: {
    dailyTask: [],
    changeInfo: {},
    rewardMap: {},
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
  },

  /**
   * 查询每日任务
   */
  onQueryDailyTask: function () {
    db.collection('dailyTask').where({
      _openid: app.globalData.openid,
      belongTime: new Date(new Date().toLocaleDateString()).getTime()
    }).get({
      success: res => {
        // console.log('[数据库] [查询记录] 成功: ', res)
        this.setData({
          dailyTask: res.data
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

  /**
   * 更新每日任务
   */
  switch1Change: function (e) {
    const {
      task,
      taskState,
      taskStateName
    } = e.currentTarget.dataset
    let cm = this.data.rewardMap[taskStateName] ? Number(this.data.rewardMap[taskStateName]) : 0
    let tm = taskState ? task.totalMoney - cm : task.totalMoney + cm
    let ts = task.taskState
    ts[taskStateName] = !taskState
    this.setData({
      changeInfo: {
        id: task._id,
        tm: tm,
        ts: ts,
      }
    })
    // 修改每日任务的状态
    db.collection('dailyTask').doc(task._id).update({
      data: {
        taskState: ts,
        totalMoney: tm,
      },
      success: (res) => {
        let newDailyTask = this.data.dailyTask
        const {
          id,
          tm,
          ts
        } = this.data.changeInfo
        for (const ndt of newDailyTask) {
          if (ndt._id === id) {
            ndt.taskState = ts
            ndt.totalMoney = tm
          }
        }
        this.setData({
          dailyTask: newDailyTask
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