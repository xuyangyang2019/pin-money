// pages/taskList/taskList.js

const app = getApp()
const db = wx.cloud.database()

Page({
    data: {
        taskList: [], // 任务列表
        taskName: '', // 任务名称
        taskReward: '', // 任务奖励
        dialogShow: false, // 任务奖励
        buttons: [{
            text: '取消'
        }, {
            text: '确定'
        }],
    },
    onLoad() {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
    },
    // 监听页面初次渲染完成
    // onReady: function () {},
    // 生命周期函数--监听页面显示
    onShow() {
        this.onQueryTask()
    },

    // 查询任务
    onQueryTask() {
        this.setData({
            taskList: []
        })

        // 查询当前用户所有的 counters
        db.collection('task')
            .where({
                _openid: app.globalData.openid
            })
            .orderBy('createTime', 'asc')
            .get({
                success: res => {
                    this.setData({
                        taskList: res.data
                    })
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: `查询任务列表失败${err}`
                    })
                }
            })
    },
    // 修改任务名称数据
    bindNameInput(e) {
        this.setData({
            taskName: e.detail.value
        })
    },
    // 修改任务奖励数据
    bindRewardInput(e) {
        this.setData({
            taskReward: e.detail.value
        })
    },
    // 打开添加任务弹框
    openConfirm() {
        this.setData({
            dialogShow: true
        })
    },
    // 弹框按钮事件
    tapDialogButton(e) {
        // console.log(e.detail.index)
        if (e.detail.index === 1) {
            if (this.data.taskReward && this.data.taskName) {
                this.addTask(this.data.taskName, this.data.taskReward)
            } else {
                wx.showToast({
                    title: '数据格式不正确，不能添加！',
                    icon: 'error'
                })
                return
            }
        }
        // 更新当前数据
        this.setData({
            dialogShow: false,
        })
    },
    // 添加任务
    addTask(name, reward) {
        db.collection('task').add({
            data: {
                name: name,
                reward: reward,
                creatTime: new Date().getTime()
            },
            success: res => {
                // 在返回结果中会包含新创建的记录的 _id
                let oldData = [{
                        _id: res._id,
                        _openid: app.globalData.openid,
                        name: this.data.taskName,
                        reward: this.data.taskReward
                    },
                    ...this.data.taskList
                ]
                // 更新当前数据
                this.setData({
                    taskList: oldData,
                    taskName: '',
                    taskReward: '',
                })
                // // 更新每日任务
                // let time = new Date(new Date().toLocaleDateString()).getTime()
                // this.updateTaskFunction(this.data.taskName, time)
            },
            fail: err => {
                wx.showToast({
                    icon: 'error',
                    title: `添加任务失败!`
                })
                // console.error('[数据库] [新增记录] 失败：', err)
            }
        })
    },

    // 删除任务
    onRemoveTask(e) {
        // console.log('onRemoveTask', e.currentTarget.dataset.task)
        if (e.currentTarget.dataset.task) {
            const {
                _id,
                name
            } = e.currentTarget.dataset.task
            if (!_id) return
            db.collection('task').doc(_id).remove({
                success: res => {
                    wx.showToast({
                        title: '删除成功',
                    })
                    this.setData({
                        taskList: this.data.taskList.filter(x => {
                            return x._id !== _id
                        })
                    })

                    // // 删除每日任务中的数据
                    // let time = new Date(new Date().toLocaleDateString()).getTime()
                    // this.updateTaskFunction(name, time, true)
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: '删除失败',
                    })
                    // console.error('[数据库] [删除记录] 失败：', err)
                }
            })
        }
    },


    // // 更新任务
    // updateTaskFunction(name, time, deleteKey = false) {
    //     wx.cloud.callFunction({
    //         name: 'updateTask',
    //         data: {
    //             taskName: name,
    //             belongTime: time,
    //             deleteKey: deleteKey
    //         },
    //         success: res => {
    //             wx.showToast({
    //                 title: '调用成功',
    //             })
    //         },
    //         fail: err => {
    //             wx.showToast({
    //                 icon: 'none',
    //                 title: '调用失败',
    //             })
    //             // console.error('[云函数] [sum] 调用失败：', err)
    //         }
    //     })
    // },
})