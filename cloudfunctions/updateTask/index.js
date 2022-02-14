// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})


// 云函数入口函数
exports.main = async (event, context) => {
    // const wxContext = cloud.getWXContext()
    // let taskName = await event.taskName
    const {
        taskName,
        belongTime,
        deleteKey,
        userInfo
    } = event


    const db = cloud.database()
    const _ = db.command

    if (deleteKey) {
        // 所有的任务删除字段

    } else {
        // 所有的任务添加字段
        // db.collection('dailyTask').where({
        //     _openid: userInfo.openId,
        //     belongTime: belongTime
        // }).update({
        //     data: {
        //         'taskState':_.push({})
        //     }
        // })
    }

    // const {
    //     data: dailyTaskList
    // } = await db.collection('dailyTask').where({
    //     _openid: userInfo.openId,
    //     belongTime: belongTime
    // }).get()

    // for (const dl of dailyTaskList) {
    //     const _ = db.command
    //     let taskState = {
    //         ...dl.taskState
    //     }
    //     if (deleteKey) {
    //         let nts = {}
    //         for (const key in taskState) {
    //             if (Object.hasOwnProperty.call(taskState, key)) {
    //                 if (key !== taskName) {
    //                     nts[key] = taskState[key]
    //                 }
    //             }
    //         }
    //         taskState = nts
    //     } else {
    //         taskState[taskName] = false
    //     }
    //     console.log(deleteKey, taskState)
    //     db.collection('dailyTask').doc(dl._id).update({
    //         data: {
    //             taskState: {
    //                 ...taskState
    //             }
    //         },
    //         success: function (res) {
    //             console.log(res.data)
    //         },
    //         fail: function (err) {
    //             console.log('更细 dailyTask 失败 taskState', err)
    //         }
    //     })
    // }

    return {
        event
    }
}