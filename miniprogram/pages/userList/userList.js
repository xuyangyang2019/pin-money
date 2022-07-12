const app = getApp()
const db = wx.cloud.database()


// pages/userList/userList.js
Page({
    // 页面的初始数据
    data: {
        userList: [], // 用户列表
        addUserDialog: false,
        buttons: [{
            text: '取消'
        }, {
            text: '确定'
        }],
        userName: '', // 用户昵称
        allotTaskDialog: '', // 分配任务弹框
        items: [],
        taskList: [], // 任务名称
        currentUser: {}
        // index: 0,

    },
    //  生命周期函数--监听页面加载
    onLoad(options) {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
    },
    // 生命周期函数--监听页面显示
    onShow() {
        this.queryUser()
        this.queryTask()
    },

    // 查询用户列表
    queryUser: function () {
        this.setData({
            userList: []
        })
        // 查询当前用户所有的 counters
        db.collection('children')
            .where({
                _openid: app.globalData.openid
            })
            .orderBy('_id', 'asc')
            .get({
                success: res => {
                    this.setData({
                        userList: res.data
                    })
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: `查询用户失败:err`
                    })
                }
            })
    },
    // 查询任务
    queryTask() {
        // 查询当前用户所有的 counters
        db.collection('task').where({
            _openid: app.globalData.openid
        }).get({
            success: res => {
                this.setData({
                    taskList: res.data
                })
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: `查询任务失败:err`
                })
            }
        })
    },

    openDialog() {
        console.log('openConfirm')
        // this.onQueryUser()
        this.setData({
            addUserDialog: true
        })
    },
    tapDialogButton(e) {
        if (e.detail.index === 1) {
            if (this.data.userName) {
                this.addUser(this.data.userName)
            } else {
                wx.showToast({
                    title: '姓名不能为空！',
                    icon: 'error'
                })
                return
            }
        }
        // 隐藏对话框
        this.setData({
            addUserDialog: false,
        })
    },
    // 修改用户名
    bindNameInput(e) {
        this.setData({
            userName: e.detail.value
        })
    },
    // 添加用户
    addUser(userName) {
        db.collection('children').add({
            data: {
                name: userName,
            }
        }).then(res => {
            console.log(res)
            this.queryUser()
            // success: res => {
            //     // 在返回结果中会包含新创建的记录的 _id
            //     let oldData = [...this.data.userList, {
            //         _id: res._id,
            //         _openid: app.globalData.openid,
            //         name: this.data.userName,
            //     }]

            //     wx.showToast({
            //         title: '新增用户成功',
            //     })
            //     // console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            //     // 自动创建每日任务
            //     let ts = {}
            //     for (const task of this.data.taskList) {
            //         ts[task.name] = false
            //     }
            //     let dd = {
            //         // _openid: app.globalData.openid,
            //         userId: res._id,
            //         userName: this.data.userName,
            //         taskState: ts,
            //         hasPaied: false,
            //         totalMoney: 0,
            //         createTime: new Date().toLocaleString(),
            //         belongTime: new Date(new Date().toLocaleDateString()).getTime()
            //     }
            //     db.collection('dailyTask').add({
            //         data: dd
            //     }).then(res => {
            //         console.log(res)
            //     })
            //     this.setData({
            //         userList: oldData,
            //         userName: '',
            //     })

            // },
            // fail: err => {
            //     wx.showToast({
            //         icon: 'none',
            //         title: '新增记录失败'
            //     })
            //     console.error('[数据库] [新增记录] 失败：', err)
            // }
        })

    },

    // 删除用户
    onRemoveUser(e) {
        if (e.currentTarget.dataset.task) {
            const {
                name,
                _id,
                _openid
            } = e.currentTarget.dataset.task
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
                    // // 删除今天的任务数据
                    // db.collection('dailyTask').where({
                    //     userName: name,
                    //     _openid: _openid,
                    //     belongTime: new Date(new Date().toLocaleDateString()).getTime()
                    // }).remove().then(res => {
                    //     console.log(res)
                    // })
                },
                fail: err => {
                    wx.showToast({
                        icon: 'none',
                        title: '删除失败',
                    })
                }
            })
        }
    },
    // 展示分配任务对话框
    allotTask(e) {
        if (e.currentTarget.dataset.task) {
            const {
                task: tasks
            } = e.currentTarget.dataset.task
            let checkList = []
            for (const taskItem of this.data.taskList) {
                checkList.push({
                    value: taskItem._id,
                    name: taskItem.name,
                    checked: tasks && tasks.indexOf(taskItem.name) >= 0
                })
            }
            this.setData({
                currentUser: e.currentTarget.dataset.task,
                allotTaskDialog: true,
                items: checkList
            })
        }
    },
    // 取消或确认分配
    tapAllotDialogButton(e) {
        const {
            _id,
        } = this.data.currentUser

        if (_id && e.detail.index === 1) {
            let currentTaskList = this.data.items.filter(x => {
                return x.checked
            }).map(x => {
                return x.name
            })
            db.collection('children')
                .doc(_id)
                .update({
                    data: {
                        task: currentTaskList
                    }
                }).then(res => {
                    console.log(res)
                    this.queryUser()
                })

        }
        // 隐藏对话框
        this.setData({
            allotTaskDialog: false,
        })
    },
    // 选择任务
    checkboxChange(e) {
        // console.log('checkbox发生change事件，携带value值为：', e.detail.value)
        const items = this.data.items
        const values = e.detail.value
        for (let i = 0, lenI = items.length; i < lenI; ++i) {
            items[i].checked = false
            for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
                if (items[i].value === values[j]) {
                    items[i].checked = true
                    break
                }
            }
        }
        this.setData({
            items
        })
    },

    // bindPickerChange: function (e) {
    //     // this.setData({
    //     //     index: e.detail.value
    //     // })

    //     const {
    //         _id,
    //         task,
    //         _openid
    //     } = this.data.currentUser
    //     let taskName = this.data.taskList[e.detail.value]
    //     if (_id) {
    //         let newTask = [taskName]
    //         if (task) {
    //             newTask = newTask.concat(task)
    //         }
    //         newTask = [...new Set(newTask)]
    //         db.collection('children').doc(_id).update({
    //             data: {
    //                 task: newTask
    //             },
    //             success: function (res) {
    //                 console.log('bindPickerChange', res)
    //                 this.queryUser()
    //             }
    //         })
    //     }
    // },
})