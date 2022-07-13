// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})


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
        user.task.forEach(x => {
            taskState[x] = false
        })
        let dd = {
            _openid: user._openid,
            userId: user._id,
            userName: user.name,
            taskState: taskState,
            hasPaied: false,
            totalMoney: 0,
            createTime: new Date().toLocaleString(),
            belongTime: new Date(new Date().toLocaleDateString()).getTime()
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