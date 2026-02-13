/**
 * 本地存储工具类
 * 提供投资组合数据的存储和读取方法
 */

// 存储键名
const STORAGE_KEYS = {
  PORTFOLIO: 'portfolio',
  RECORDS: 'records'
}

/**
 * 保存投资组合数据
 * @param {Array} portfolio - 投资组合数组
 */
function savePortfolio(portfolio) {
  try {
    wx.setStorageSync(STORAGE_KEYS.PORTFOLIO, portfolio)
    return true
  } catch (error) {
    console.error('保存投资组合失败:', error)
    return false
  }
}

/**
 * 读取投资组合数据
 * @returns {Array} 投资组合数组
 */
function getPortfolio() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.PORTFOLIO) || []
  } catch (error) {
    console.error('读取投资组合失败:', error)
    return []
  }
}

/**
 * 保存交易记录
 * @param {Array} records - 交易记录数组
 */
function saveRecords(records) {
  try {
    wx.setStorageSync(STORAGE_KEYS.RECORDS, records)
    return true
  } catch (error) {
    console.error('保存交易记录失败:', error)
    return false
  }
}

/**
 * 读取交易记录
 * @returns {Array} 交易记录数组
 */
function getRecords() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.RECORDS) || []
  } catch (error) {
    console.error('读取交易记录失败:', error)
    return []
  }
}

/**
 * 清除所有数据
 */
function clearAllData() {
  try {
    wx.removeStorageSync(STORAGE_KEYS.PORTFOLIO)
    wx.removeStorageSync(STORAGE_KEYS.RECORDS)
    return true
  } catch (error) {
    console.error('清除数据失败:', error)
    return false
  }
}

/**
 * 导出数据
 * @returns {Object} 导出的数据对象
 */
function exportData() {
  return {
    portfolio: getPortfolio(),
    records: getRecords(),
    exportTime: new Date().toISOString(),
    version: '1.0.0'
  }
}

/**
 * 导入数据
 * @param {Object} data - 导入的数据对象
 */
function importData(data) {
  if (!data || !Array.isArray(data.portfolio) || !Array.isArray(data.records)) {
    console.error('数据格式无效')
    return false
  }

  try {
    savePortfolio(data.portfolio)
    saveRecords(data.records)
    return true
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}

module.exports = {
  savePortfolio,
  getPortfolio,
  saveRecords,
  getRecords,
  clearAllData,
  exportData,
  importData
}