/**
 * 投资计算工具类
 * 提供投资组合相关的计算方法
 */

// 投资品种分类定义
const CATEGORIES = [
  {
    id: 'equity',
    name: '权益类资产',
    subcategories: [
      { id: 'equity_a', name: 'A股' },
      { id: 'equity_h', name: '港股' },
      { id: 'equity_us', name: '美股' },
      { id: 'equity_other', name: '其他权益资产' }
    ]
  },
  {
    id: 'fixed_income',
    name: '固收类资产',
    subcategories: [
      { id: 'fixed_income_pure', name: '纯债' },
      { id: 'fixed_income_convertible', name: '可转债' },
      { id: 'fixed_income_secondary', name: '二级债' },
      { id: 'fixed_income_other', name: '其他固收资产' }
    ]
  },
  {
    id: 'alternative',
    name: '另类资产',
    subcategories: [
      { id: 'alternative_gold', name: '黄金' },
      { id: 'alternative_silver', name: '白银' },
      { id: 'alternative_reits', name: 'REITs' },
      { id: 'alternative_other', name: '其他另类资产' }
    ]
  },
  {
    id: 'cash',
    name: '现金类资产',
    subcategories: [
      { id: 'cash_deposit', name: '银行存款' },
      { id: 'cash_money', name: '货币基金' },
      { id: 'cash_repo', name: '逆回购' },
      { id: 'cash_other', name: '其他现金资产' }
    ]
  }
]

/**
 * 计算投资组合总金额
 * @param {Array} portfolio - 投资组合数组
 * @returns {number} 总金额
 */
function calculateTotalAmount(portfolio) {
  return portfolio.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.price || 0)
  }, 0)
}

/**
 * 计算资产分布
 * @param {Array} portfolio - 投资组合数组
 * @param {number} totalAmount - 总金额（可选，用于优化性能）
 * @returns {Array} 资产分布数组
 */
function calculateAssetDistribution(portfolio, totalAmount = null) {
  if (!totalAmount) {
    totalAmount = calculateTotalAmount(portfolio)
  }

  // 计算各类资产总金额
  const distribution = CATEGORIES.map(category => {
    // 计算一级分类总金额
    const primaryAmount = portfolio.reduce((sum, item) => {
      // 检查是否属于该一级分类
      const isPrimaryCategory = category.subcategories.some(sub =>
        sub.id === item.categoryId || (item.primaryCategory && item.primaryCategory === category.name)
      )
      return isPrimaryCategory ? sum + item.quantity * item.price : sum
    }, 0)

    // 计算二级分类金额
    const secondaryDistribution = category.subcategories.map(sub => {
      const subAmount = portfolio.reduce((sum, item) => {
        return (item.categoryId === sub.id || (item.category && item.category === sub.name)) ?
          sum + item.quantity * item.price : sum
      }, 0)
      return {
        id: sub.id,
        name: sub.name,
        amount: subAmount.toFixed(2),
        percentage: primaryAmount > 0 ? ((subAmount / primaryAmount) * 100).toFixed(1) : 0
      }
    }).filter(item => parseFloat(item.amount) > 0)

    return {
      id: category.id,
      name: category.name,
      amount: primaryAmount.toFixed(2),
      percentage: totalAmount > 0 ? ((primaryAmount / totalAmount) * 100).toFixed(1) : 0,
      subcategories: secondaryDistribution
    }
  }).filter(item => parseFloat(item.amount) > 0)

  return distribution
}

/**
 * 计算单笔交易金额
 * @param {number} quantity - 数量
 * @param {number} price - 价格
 * @returns {number} 交易金额
 */
function calculateTransactionAmount(quantity, price) {
  return (quantity || 0) * (price || 0)
}

/**
 * 格式化数字为金额字符串
 * @param {number} amount - 金额
 * @param {number} decimalPlaces - 小数位数，默认2位
 * @returns {string} 格式化后的金额字符串
 */
function formatAmount(amount, decimalPlaces = 2) {
  return Number(amount).toFixed(decimalPlaces)
}

/**
 * 格式化百分比
 * @param {number} percentage - 百分比数值
 * @param {number} decimalPlaces - 小数位数，默认1位
 * @returns {string} 格式化后的百分比字符串
 */
function formatPercentage(percentage, decimalPlaces = 1) {
  return Number(percentage).toFixed(decimalPlaces) + '%'
}

/**
 * 转换旧数据结构（兼容处理）
 * @param {Array} portfolio - 旧版本投资组合数据
 * @returns {Array} 新版本投资组合数据
 */
function convertLegacyData(portfolio) {
  // 检查是否已包含categoryId字段
  const hasCategoryId = portfolio.some(item => item.categoryId)

  if (hasCategoryId) {
    return portfolio
  }

  // 旧版本数据转换
  return portfolio.map(item => {
    // 尝试匹配类别
    let categoryId = 'unknown'
    let primaryCategory = '未知分类'

    for (const category of CATEGORIES) {
      const sub = category.subcategories.find(sub => sub.name === item.category)
      if (sub) {
        categoryId = sub.id
        primaryCategory = category.name
        break
      }

      if (category.name === item.category) {
        // 如果是一级分类，默认选择第一个二级分类
        categoryId = category.subcategories[0].id
        primaryCategory = category.name
        break
      }
    }

    return {
      ...item,
      categoryId,
      primaryCategory
    }
  })
}

module.exports = {
  calculateTotalAmount,
  calculateAssetDistribution,
  calculateTransactionAmount,
  formatAmount,
  formatPercentage,
  convertLegacyData
}