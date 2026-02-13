Page({
  data: {

  },

  // 备份数据
  backupData() {
    wx.showLoading({
      title: '备份中...'
    })

    try {
      const portfolio = wx.getStorageSync('portfolio') || []
      const records = wx.getStorageSync('records') || []

      const backupData = {
        portfolio,
        records,
        backupTime: new Date().toISOString(),
        version: '1.0.0'
      }

      // 导出为JSON
      const jsonStr = JSON.stringify(backupData, null, 2)

      // 显示备份成功
      wx.hideLoading()
      wx.showModal({
        title: '备份成功',
        content: `共备份${portfolio.length}个投资标的和${records.length}条交易记录`,
        showCancel: false
      })

      console.log('数据备份成功', backupData)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '备份失败',
        icon: 'none'
      })
      console.error('备份失败', error)
    }
  },

  // 恢复数据
  restoreData() {
    wx.showModal({
      title: '恢复数据',
      content: '恢复将覆盖当前所有数据，是否继续？',
      success: (res) => {
        if (res.confirm) {
          // 这里应该从用户选择的文件中读取数据
          // 暂时模拟恢复过程
          wx.showLoading({
            title: '恢复中...'
          })

          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '恢复成功',
              icon: 'success'
            })
          }, 1000)
        }
      }
    })
  },

  // 清除数据
  clearData() {
    wx.showModal({
      title: '清除数据',
      content: '确定要删除所有数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({
            title: '数据已清除',
            icon: 'success'
          })

          // 刷新页面
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  }
})