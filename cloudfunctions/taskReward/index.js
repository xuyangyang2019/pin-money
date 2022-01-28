// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event) => {
    let rewardMap = {}
    const {
        data: taskData
    } = await cloud.database().collection('task').get()
    taskData.forEach(x => {
        rewardMap[x._id] = x.reward
        rewardMap[x.name] = x.reward
    })

    return {
        event,
        rewardMap: rewardMap,
    }
}