// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {
    const {
        userId,
        openId,
        tasks,
        name,
        belongTime
    } = event

    // let {
    //     OPENID,
    //     APPID
    // } = await cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

    let taskState = {}
    tasks.forEach(x => {
        taskState[x] = false
    })

    const {
        data: userInfo
    } = await db.collection('dailyTask').where({
        _openid: openId,
        userId: userId,
        belongTime: belongTime,
    }).get()

    if (userInfo.length > 0) {
        return db.collection('dailyTask')
            .doc(userInfo[0]._id).update({
                data: {
                    taskState: _.set(taskState),
                    totalMoney: 0,
                },
            })
    } else {
        let dd = {
            _openid: openId,
            userId: userId,
            userName: name,
            taskState: taskState,
            hasPaied: false,
            totalMoney: 0,
            createTime: new Date().toLocaleString(),
            belongTime: belongTime
        }
        return db.collection('dailyTask').add({
            data: dd
        })

    }
}