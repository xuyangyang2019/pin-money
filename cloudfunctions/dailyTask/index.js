// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})


// 云函数入口函数
exports.main = async (event, context) => {
    // const wxContext = cloud.getWXContext()
    
    const db = cloud.database()
    const {
        data: taskList
    } = await db.collection('task').get()
    const {
        data: userList
    } = await db.collection('children').get()

    let taskState = {}
    taskList.forEach(x => {
        taskState[x.name] = false
    })
    for (const user of userList) {
        let dd = {
            _openid: user._openid,
            userId: user._id,
            userName: user.name,
            taskState: taskState,
            totalMoney: 0,
            createTime: new Date().toLocaleString(),
            belongTime: new Date(new Date().toLocaleDateString()).getTime()
        }
        console.log(dd)
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