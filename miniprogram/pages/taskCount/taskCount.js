//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
    data: {
        userList: [], // 用户列表
        userMap: {}, // 用户id-name对照
        payedMap: {}, // 已支付的奖励
        noPayMap: {}, // 未支付的奖励

        dailyTask: [], // 信息列表
        defaultOption: {
            id: '3',
            name: '全部'
        }, // 默认展示全部
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
        ], // 信息类型
        defaultUser: {
            id: 'all',
            name: '全部'
        },
        userOptions: [],
        currentType: '', // 当前信息类型
        currentUserId: '', // 当前用户
        page: 0, // 页
        limit: 14, // 限制
    },
    onLoad: function () {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
    },
    onShow: function () {
        // 清空已有的数据
        this.setData({
            dailyTask: [],
            userList: [],
            userMap: {},
            payedMap: {},
            noPayMap: {},
        })

        // 查询统计信息
        this.rewardFunction()
        // 查询详细信息
        this.queryRewardList(this.data.currentType, this.data.currentUserId)
    },
    onReachBottom: function () {
        this.setData({
            page: this.data.page + 1, //更新data重的页数
        })
        this.queryRewardList(this.data.currentType, this.data.currentUserId)
    },
    // 统计信息
    rewardFunction() {
        this.setData({
            userList: [],
            userMap: {},
            payedMap: {},
            noPayMap: {},
        })
        wx.cloud.callFunction({
            name: 'sum',
            data: {},
            success: res => {
                const {
                    userList,
                    userMap,
                    payedMap,
                    noPayMap
                } = res.result
                const userOptions = [{
                    userId: 'all',
                    userName: '全部'
                }]
                for (const key in userMap) {
                    if (Object.hasOwnProperty.call(userMap, key)) {
                        userOptions.push({
                            userId: key,
                            userName: userMap[key]
                        })
                    }
                }
                this.setData({
                    userList: userList,
                    userMap: userMap,
                    payedMap: payedMap,
                    noPayMap: noPayMap,
                    userOptions: userOptions
                })
            },
            fail: err => {
                wx.showToast({
                    icon: 'warning',
                    title: '[云函数] [sum] 调用失败',
                })
                console.error('[云函数] [sum] 调用失败：', err)
            }
        })
    },

    // 奖励列表
    queryRewardList(typeFlag, userFlag) {
        const _ = db.command
        // 查下所有的没有支付的任务
        let queryComment = {}

        if (typeFlag === '1') {
            queryComment.hasPaied = false
        } else if (typeFlag === '2') {
            queryComment.hasPaied = true
            //     // totalMoney: _.gt(0)
        }
        if (userFlag && userFlag !== 'all') {
            queryComment.userId = userFlag
        }
        // console.log(queryComment)
        db.collection('dailyTask')
            .where({
                _openid: app.globalData.openid,
                ...queryComment
            })
            .orderBy('belongTime', 'desc')
            .orderBy('userId', 'asc')
            .skip(this.data.page * this.data.limit)
            .limit(this.data.limit)
            .get({
                success: res => {
                    let dailyTask = res.data
                    for (const dt of dailyTask) {
                        let bt = new Date(dt.belongTime)
                        let yy = bt.getFullYear()
                        let mm = bt.getMonth() + 1
                        let dd = bt.getDate()
                        dt.timeNow = yy + '/' + mm + '/' + dd
                        let reward = parseInt(dt.totalMoney, 10) || 0
                    }
                    if (dailyTask.length === 0) {
                        wx.showToast({
                            title: '暂无更多数据', //如果当前页数大于总页数则不会刷新并显示提示
                            icon: "none"
                        })
                    }
                    this.setData({
                        // dailyTask: dailyTask,
                        dailyTask: this.data.dailyTask.concat(dailyTask),
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
    modifyPayState(e) {
        if (e.currentTarget.dataset.countItem) {
            const {
                _id: taskId,
                userName,
                totalMoney
            } = e.currentTarget.dataset.countItem
            if (taskId) {
                // 修改每日任务的状态
                db.collection('dailyTask').doc(taskId).update({
                    data: {
                        hasPaied: true,
                    },
                    success: (res) => {
                        if (newRewardMap[userName]) {
                            newRewardMap[userName] = newRewardMap[userName] - totalMoney
                        }

                        this.setData({
                            dailyTask: this.data.dailyTask.filter(x => {
                                return x._id !== taskId
                            }),
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
    // 数据类型变更
    selectChange(e) {
        this.setData({
            currentType: e.detail.id,
            dailyTask: [],
            page: 0,
        })
        if (e.detail && e.detail.id)
            this.queryRewardList(e.detail.id, this.data.currentUserId)
    },
    userChange(e) {
        this.setData({
            currentUserId: e.detail.id,
            dailyTask: [],
            page: 0,
        })
        if (e.detail)
            this.queryRewardList(this.data.currentType, e.detail.id)
    }
})