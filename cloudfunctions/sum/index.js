// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})


// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  console.log(context)
  let sum = await event.a + event.b
  const {
    data:counterData
  } = await cloud.database().collection('counters').get()

  let counterMap = {}
  counterData.forEach(x => {
    if (counterMap[x._openid]) {
      counterMap[x._openid] = counterMap[x._openid] + x.count
    } else {
      counterMap[x._openid] = x.count
    }
  })

  return {
    sum: sum,
    counterMap: counterMap
  }
}