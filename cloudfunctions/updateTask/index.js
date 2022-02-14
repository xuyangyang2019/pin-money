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

    const {
        data: dailyTaskList
    } = await db.collection('dailyTask').where({
        _openid: userInfo.openId,
        belongTime: belongTime
    }).get()

    for (const dl of dailyTaskList) {
        const _ = db.command
        let taskState = {
            ...dl.taskState
        }
        if (deleteKey) {
            let nts = {}
            for (const key in taskState) {
                if (Object.hasOwnProperty.call(taskState, key)) {
                    if (key !== taskName) {
                        nts[key] = taskState[key]
                    }
                }
            }
            db.collection('dailyTask').doc(dl._id).update({
                data: {
                    taskState: _.set({
                        ...nts
                    })
                },
                success: function (res) {
                    console.log(res.data)
                }
            })
        } else {
            taskState[taskName] = false
            db.collection('dailyTask').doc(dl._id).update({
                data: {
                    taskState: {
                        ...taskState
                    }
                },
                success: function (res) {
                    console.log(res.data)
                }
            })
        }
    }

    return {
        event
    }
}