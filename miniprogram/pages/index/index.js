//index.js
const app = getApp()

Page({
  data: {
    childrenList: [],
    taskList: [],
    currentUserId: '',
    currentUserName: '',
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 查看是否授权
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       wx.getUserInfo({
    //         success: res => {
    //           console.log(res.userInfo)
    //           this.setData({
    //             avatarUrl: res.userInfo.avatarUrl,
    //             userInfo: res.userInfo
    //           })
    //         }
    //       })
    //     }
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onQueryChildren()
    this.onQueryTask()
  },

  onQueryChildren: function () {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('children').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        this.setData({
          childrenList: res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        // console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  onQueryTask: function () {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('task').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        this.setData({
          taskList: res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        // console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  /**
   * 添加任务
   */
  onChoseUser: function (e) {
    console.log('onChoseUser', e.currentTarget.dataset.user)
    if (e.currentTarget.dataset.user) {
      const {
        _id,
        name
      } = e.currentTarget.dataset.user
      this.setData({
        currentUserName: name,
        currentUserId: _id,
      })
    }
  },

  switch1Change: function (e) {
    // console.log(e)
    console.log('onRemove', e.currentTarget.dataset.task)

    // if (this.data.userName) {
    //   const db = wx.cloud.database()
    //   db.collection('children').add({
    //     data: {
    //       name: this.data.userName,
    //     },
    //     success: res => {
    //       // 在返回结果中会包含新创建的记录的 _id
    //       let oldData = [...this.data.childrenList, {
    //         _id: res._id,
    //         _openid: app.globalData.openid,
    //         name: this.data.userName,
    //       }]
    //       this.setData({
    //         childrenList: oldData,
    //         userName: '',
    //       })
    //       wx.showToast({
    //         title: '新增记录成功',
    //       })
    //       // console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
    //     },
    //     fail: err => {
    //       wx.showToast({
    //         icon: 'none',
    //         title: '新增记录失败'
    //       })
    //       console.error('[数据库] [新增记录] 失败：', err)
    //     }
    //   })
    // } else {
    //   wx.showToast({
    //     title: '数据格式不正确，不能添加！',
    //     icon: 'error'
    //   })
    // }
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  }
})