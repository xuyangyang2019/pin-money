//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
    data: {
        dailyTask: [],
        rewardMap: {}, // 任务名对应的奖励金额
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
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
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
    onShow: function () {
        let bt = new Date()
        let yy = bt.getFullYear()
        let mm = bt.getMonth() + 1
        let dd = bt.getDate()
        this.setData({
            currentDate: yy + '-' + mm + '-' + dd,
            endTime: yy + '-' + mm + '-' + dd
        })

        this.rewardFunction()
        this.queryDailyTask()
    },

    // 查询每日任务
    queryDailyTask() {
        this.setData({
            dailyTask: [],
        })

        let belongTime = ''
        if (this.data.currentDate) {
            belongTime = new Date(new Date(this.data.currentDate).toLocaleDateString()).getTime()
        } else {
            belongTime = new Date(new Date().toLocaleDateString()).getTime()
        }
        db.collection('dailyTask').where({
            _openid: app.globalData.openid,
            belongTime: belongTime
        }).get({
            success: res => {
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
    // 查询任务对应的奖励
    rewardFunction() {
        // 查询当前用户所有的 counters
        db.collection('task').where({
            _openid: app.globalData.openid
        }).get({
            success: res => {
                let rm = {}
                res.data.forEach(x => {
                    rm[x.name] = x.reward
                })
                this.setData({
                    rewardMap: rm
                })
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: `查询记录失败${err}`
                })
            }
        })
    },
    // 时间变更处理
    bindDateChange: function (e) {
        if (!e.detail.value) return
        this.setData({
            currentDate: e.detail.value
        })
        this.queryDailyTask()
    },
    // 更新每日任务
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
                    // this.queryDailyTask(new Date(new Date(e.detail.value).toLocaleDateString()).getTime())
                    this.queryDailyTask()
                },
                fail: (err) => {
                    this.queryDailyTask()
                }
            })
        } else {
            // 如果不知道reward就返回并重置状态
            wx.showToast({
                icon: 'none',
                title: '数据加载不全，请稍后再试！'
            })
            this.queryDailyTask()
        }
    },

    // 上传图片
    //   doUpload: function () {
    //     // 选择图片
    //     wx.chooseImage({
    //       count: 1,
    //       sizeType: ['compressed'],
    //       sourceType: ['album', 'camera'],
    //       success: function (res) {

    //         wx.showLoading({
    //           title: '上传中',
    //         })

    //         const filePath = res.tempFilePaths[0]

    //         // 上传图片
    //         const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
    //         wx.cloud.uploadFile({
    //           cloudPath,
    //           filePath,
    //           success: res => {
    //             console.log('[上传文件] 成功：', res)

    //             app.globalData.fileID = res.fileID
    //             app.globalData.cloudPath = cloudPath
    //             app.globalData.imagePath = filePath

    //             wx.navigateTo({
    //               url: '../storageConsole/storageConsole'
    //             })
    //           },
    //           fail: e => {
    //             console.error('[上传文件] 失败：', e)
    //             wx.showToast({
    //               icon: 'none',
    //               title: '上传失败',
    //             })
    //           },
    //           complete: () => {
    //             wx.hideLoading()
    //           }
    //         })

    //       },
    //       fail: e => {
    //         console.error(e)
    //       }
    //     })
    //   }
})