// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})


// 云函数入口函数
exports.main = async (event, context) => {
    // const wxContext = cloud.getWXContext()
    let taskName = await event.taskName
    let taskState = {}
    taskState[taskName] = false
    // console.log(taskState)

    const db = cloud.database()
    const {
        data: dailyTaskList
    } = await db.collection('dailyTask').where({
        _openid: event.userInfo.openId,
        belongTime: event.belongTime
    }).get()

    for (const dl of dailyTaskList) {
        const _ = db.command
        db.collection('dailyTask').doc(dl._id).update({
            data: {
                taskState: {
                    ...dl.taskState,
                    ...taskState
                }
            },
            success: function (res) {
                console.log(res.data)
            }
        })
    }

    return {
        event
    }
}