//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
  data: {
    dailyTask: [],
    changeInfo: {},
    rewardMap: {},
    rewardList: [],
  },

  onLoad: function () {
    // if (!wx.cloud) {
    //   wx.redirectTo({
    //     url: '../chooseLib/chooseLib',
    //   })
    //   return
    // }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onQueryDailyTask()
  },

  /**
   * 查询每日任务
   */
  onQueryDailyTask: function () {
    const _ = db.command
    // 查下所有的没有支付的任务
    db.collection('dailyTask').where({
      _openid: app.globalData.openid,
      hasPaied: false,
      totalMoney: _.gt(0)
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        let dailyTask = res.data
        let rewardMap = {}
        for (const dt of dailyTask) {
          dt.timeNow = new Date(dt.belongTime).toLocaleDateString()
          let reward = parseInt(dt.totalMoney, 10) || 0
          if (rewardMap[dt.userName]) {
            rewardMap[dt.userName] = rewardMap[dt.userName] + reward
          } else {
            rewardMap[dt.userName] = reward
          }
        }
        this.setData({
          dailyTask: dailyTask,
          rewardMap: rewardMap,
          rewardList: Object.keys(rewardMap),
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


  /**
   * 更新每日任务
   */
  modifyPayState: function (e) {
    console.log(e.currentTarget.dataset.countItem)
    if (e.currentTarget.dataset.countItem) {
      const {
        _id: taskId,
        userName,
        totalMoney
      } = e.currentTarget.dataset.countItem
      if (taskId) {
        console.log(taskId)
        // 修改每日任务的状态
        db.collection('dailyTask').doc(taskId).update({
          data: {
            hasPaied: true,
          },
          success: (res) => {
            console.log(res)
            let newRewardMap = {
              ...this.data.rewardMap
            }
            if (newRewardMap[userName]) {
              newRewardMap[userName] = newRewardMap[userName] - totalMoney
            }

            this.setData({
              dailyTask: this.data.dailyTask.filter(x => {
                return x._id !== taskId
              }),
              rewardMap: newRewardMap

            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '修改记录失败'
            })
          }
        })
      }
    }

  }
})