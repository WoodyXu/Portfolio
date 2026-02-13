Page({
  data: {
    records: [],
    filteredRecords: [],
    currentFilter: 'all'
  },

  onLoad() {
    this.loadRecords()
  },

  onShow() {
    this.loadRecords()
  },

  loadRecords() {
    const records = wx.getStorageSync('records') || []
    const filteredRecords = this.filterRecordsByType(records, this.data.currentFilter)

    // 按日期降序排序
    const sortedRecords = filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date))

    this.setData({
      records: sortedRecords,
      filteredRecords: sortedRecords
    })
  },

  filterRecordsByType(records, type) {
    if (type === 'all') {
      return records
    }
    return records.filter(record => record.action === type)
  },

  filterRecords(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentFilter: type
    })

    const filteredRecords = this.filterRecordsByType(this.data.records, type)
    this.setData({
      filteredRecords: filteredRecords
    })
  }
})