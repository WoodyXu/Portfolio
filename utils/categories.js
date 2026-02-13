/**
 * 投资品种分类定义
 * 包含一级分类和二级分类
 */

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
 * 根据分类ID获取分类信息
 * @param {string} categoryId - 分类ID
 * @returns {Object|null} 分类信息
 */
function getCategoryById(categoryId) {
  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i]
    if (category.id === categoryId) {
      return category
    }

    const subcategory = category.subcategories.find(sub => sub.id === categoryId)
    if (subcategory) {
      return {
        ...subcategory,
        parentCategory: category
      }
    }
  }
  return null
}

/**
 * 获取所有一级分类ID
 * @returns {Array} 一级分类ID数组
 */
function getPrimaryCategoryIds() {
  return CATEGORIES.map(category => category.id)
}

/**
 * 获取所有二级分类ID
 * @returns {Array} 二级分类ID数组
 */
function getSecondaryCategoryIds() {
  return CATEGORIES.reduce((result, category) => {
    return result.concat(category.subcategories.map(sub => sub.id))
  }, [])
}

/**
 * 获取一级分类下的所有二级分类
 * @param {string} primaryCategoryId - 一级分类ID
 * @returns {Array} 二级分类数组
 */
function getSubcategoriesByPrimaryId(primaryCategoryId) {
  const category = CATEGORIES.find(cat => cat.id === primaryCategoryId)
  return category ? category.subcategories : []
}

/**
 * 获取分类名称
 * @param {string} categoryId - 分类ID
 * @returns {string} 分类名称
 */
function getCategoryName(categoryId) {
  const category = getCategoryById(categoryId)
  return category ? category.name : '未知分类'
}

/**
 * 获取完整的分类路径
 * @param {string} categoryId - 分类ID
 * @returns {string} 分类路径（如：权益类资产 > 港股）
 */
function getCategoryPath(categoryId) {
  const category = getCategoryById(categoryId)
  if (!category) {
    return '未知分类'
  }

  if (category.parentCategory) {
    return `${category.parentCategory.name} > ${category.name}`
  }

  return category.name
}

module.exports = {
  CATEGORIES,
  getCategoryById,
  getPrimaryCategoryIds,
  getSecondaryCategoryIds,
  getSubcategoriesByPrimaryId,
  getCategoryName,
  getCategoryPath
}