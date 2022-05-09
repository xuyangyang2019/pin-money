//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
  data: {
    dailyTask: [],
    changeInfo: {},
    rewardMap: {},
    rewardList: [],
    items: [{
        name: '待支付',
        value: '0',
        checked: 'true'
      },
      {
        name: '已支付',
        value: '1',
      },
      {
        name: '全部',
        value: '2'
      },
    ],
    defaultOptionBusiness: {
      id: '0',
      name: '请选择'
    },
    optionsBusiness: [{
        city_id: '1',
        city_name: '111'
      },
      {
        city_id: '2',
        city_name: '2222'
      }
    ],
  },

  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
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
  onQueryDailyTask: function (flagInt) {
    const _ = db.command
    // 查下所有的没有支付的任务
    let queryComment = {}
    if (flagInt === '1') {
      queryComment = {
        hasPaied: true
        // totalMoney: _.gt(0)
      }
    } else if (flagInt === '2') {
      queryComment = {}
    } else {
      queryComment = {
        hasPaied: false,
        // totalMoney: _.gt(0)
      }
    }
    console.log(queryComment)
    db.collection('dailyTask').where({
      _openid: app.globalData.openid,
      ...queryComment
    }).orderBy('belongTime', 'desc').get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        let dailyTask = res.data
        let rewardMap = {}
        for (const dt of dailyTask) {
          let bt = new Date(dt.belongTime)
          let yy = bt.getFullYear()
          let mm = bt.getMonth() + 1
          let dd = bt.getDate()
          dt.timeNow = yy + '/' + mm + '/' + dd
          // dt.timeNow = bt.toLocaleDateString('en-US')
          // dt.timeNow = bt.toLocaleDateString('zh-CN', {
          //   year: '2-digit',
          //   month: '2-digit',
          //   day: '2-digit'
          // })
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
  },
  // 查询条件
  radioChange(e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.onQueryDailyTask(e.detail.value)
  },
  selectChange(e) {
    console.log('selectChange:', e.detail)
    // this.onQueryDailyTask(e.detail.value)
  }
})