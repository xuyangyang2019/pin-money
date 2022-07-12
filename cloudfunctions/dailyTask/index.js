// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const {
    OPENID,
    APPID
} = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
const db = cloud.database()




// 云函数入口函数
exports.main = async (event, context) => {
    // const {
    //     data: taskList
    // } = await db.collection('task').get()

    const {
        data: userList
    } = await db.collection('children').get()

    for (const user of userList) {
        let taskState = {}
        let createTime = new Date().toLocaleString()
        user.task.forEach(x => {
            taskState[x.name] = false
        })
        let dd = {
            // _openid: user._openid,
            _openid: OPENID,
            userId: user._id,
            userName: user.name,
            taskState: taskState,
            hasPaied: false,
            totalMoney: 0,
            createTime: createTime,
            belongTime: new Date(createTime).getTime()
        }
        db.collection('dailyTask').add({
            data: dd
        }).then(res => {
            console.log(res)
        })
    }


    return {
        event
    }
}