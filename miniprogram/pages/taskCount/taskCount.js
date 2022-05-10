//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
    data: {
        dailyTask: [],
        changeInfo: {},
        rewardMap: {},
        rewardList: [],
        defaultOption: {
            id: '1',
            name: '待支付'
        },
        selectOptions: [{
                value: '1',
                label: '待支付'
            },
            {
                value: '2',
                label: '已支付'
            },
            {
                value: '3',
                label: '全部'
            }
        ],
    },

    onLoad: function () {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
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
        if (flagInt === '2') {
            queryComment = {
                hasPaied: true
                // totalMoney: _.gt(0)
            }
        } else if (flagInt === '3') {
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
    //   // 查询条件
    //   radioChange(e) {
    //     // console.log('radio发生change事件，携带value值为：', e.detail.value)
    //     this.onQueryDailyTask(e.detail.value)
    //   },
    // 数据类型变更
    selectChange(e) {
        console.log('selectChange:', e.detail)
        if (e.detail && e.detail.id)
            this.onQueryDailyTask(e.detail.id)
    }
})