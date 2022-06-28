// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
    const {
        hasPaied,
        userInfo
    } = event
    let {
        OPENID,
        APPID
    } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

    // 先取出集合记录总数
    const countResult = await db.collection('dailyTask')
        .where({
            _openid: OPENID
        })
        .count()
    const total = countResult.total

    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection('dailyTask')
            .where({
                _openid: OPENID
            })
            .skip(i * MAX_LIMIT)
            .limit(MAX_LIMIT)
            .get()
        tasks.push(promise)
    }
    // 等待所有
    const {
        data,
        errMsg
    } = (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
            data: acc.data.concat(cur.data),
            errMsg: acc.errMsg,
        }
    })

    let userList = []
    let userMap = {}
    let payedMap = {}
    let noPayMap = {}


    // totalMoney: 3
    // userId: "5b049cc8621dd7780ecde91f676468bd"
    // userName: "浩然"
    // hasPaied: true

    data.forEach(x => {
        userList.push(x.userId)
        if (!userMap[x.userId]) {
            userMap[x.userId] = x.userName
        }
        if (x.userId === '54ad1eea620b80c710210da47e8be1f2' || x.userId === 'bf4a0bf2620b80c30ec72e9b0b8e2abd') {
            console.log(x)
        }
        if (x.hasPaied) {
            if (payedMap[x.userId]) {
                payedMap[x.userId] = payedMap[x.userId] + x.totalMoney
            } else {
                payedMap[x.userId] = x.totalMoney
            }
        } else {
            if (noPayMap[x.userId]) {
                noPayMap[x.userId] = noPayMap[x.userId] + x.totalMoney
            } else {
                noPayMap[x.userId] = x.totalMoney
            }
        }
    })
    return {
        // data: data,
        userList: [...new Set(userList)],
        userMap: userMap,
        payedMap: payedMap,
        noPayMap: noPayMap,
        errMsg: errMsg
    }

    // return (await Promise.all(tasks)).reduce((acc, cur) => {
    //     return {
    //         data: acc.data.concat(cur.data),
    //         errMsg: acc.errMsg,
    //     }
    // })


}