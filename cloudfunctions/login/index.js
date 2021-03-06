// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
// 如果 init 时不传 env 参数，后续 API 调用将默认请求到第一个创建的环境，但这种方式并不总是预期的，因此这种方式已废弃，请务必明确传入 env 参数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})


/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  console.log('login event ', event)
  console.log('login context ', context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const wxContext = await cloud.getWXContext()
  console.log('wxContext 数据 ', wxContext)

  const {
    ENV,
    OPENID,
    APPID,
    UNIONID
  } = wxContext

  // cloud.updateConfig({
  //   env: ENV
  // })

  return {
    ENV,
    OPENID,
    APPID,
    UNIONID,
  }
}