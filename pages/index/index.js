Page({
  data: {
    totalAmount: 0,
    assetDistribution: [],
    recentRecords: [],
    expandedCategories: [], // 存储展开的一级分类ID
    expandedSubcategories: [] // 存储展开的二级分类ID
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    // 从存储加载投资组合数据
    const portfolio = wx.getStorageSync('portfolio') || []
    const records = wx.getStorageSync('records') || []

    // 计算总金额
    const totalAmount = portfolio.reduce((sum, item) => {
      return sum + item.quantity * item.price
    }, 0)

    // 计算资产分布（包含二级分类和投资标的）
    const assetDistribution = this.calculateAssetDistribution(portfolio)
    console.log('资产分布数据:', assetDistribution)

    // 获取最近交易记录
    const recentRecords = records.slice(0, 5).reverse().map(record => ({
      ...record,
      actionText: record.action === 'buy' ? '买入' : record.action === 'sell' ? '卖出' : '更新'
    }))

    // 计算最新更新时间
    let lastUpdateTime = ''
    if (portfolio.length > 0) {
      const portfolioUpdateTimes = portfolio.map(item => item.lastUpdate || '')
      const recordUpdateTimes = records.map(record => record.date || '')
      const allUpdateTimes = [...portfolioUpdateTimes, ...recordUpdateTimes].filter(time => time !== '')
      if (allUpdateTimes.length > 0) {
        lastUpdateTime = allUpdateTimes.reduce((latest, time) => {
          return time > latest ? time : latest
        })
      }
    }

    this.setData({
      totalAmount: totalAmount.toFixed(2),
      assetDistribution,
      recentRecords,
      expandedCategories: [],
      expandedSubcategories: [],
      lastUpdateTime: lastUpdateTime || '暂无更新'
    })
  },

  calculateAssetDistribution(portfolio) {
    const categories = [
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

    // 计算总金额
    const totalAmount = portfolio.reduce((sum, item) => {
      return sum + item.quantity * item.price
    }, 0)

    return categories.map(category => {
      // 计算一级分类总金额
      const primaryAmount = portfolio.reduce((sum, item) => {
        if (item.primaryCategory === category.name) {
          return sum + item.quantity * item.price
        }
        return sum
      }, 0)

      // 计算二级分类
      const subcategories = category.subcategories.map(subCategory => {
        const subAmount = portfolio.reduce((sum, item) => {
          if (item.categoryId === subCategory.id) {
            return sum + item.quantity * item.price
          }
          return sum
        }, 0)

        // 获取该二级分类下的投资标的
        const items = portfolio.filter(item => item.categoryId === subCategory.id)

        return {
          ...subCategory,
          amount: subAmount.toFixed(2),
          percentage: totalAmount > 0 ? ((subAmount / totalAmount) * 100).toFixed(1) : '0',
          items: items.map(item => {
            const itemAmount = item.quantity * item.price
            const itemData = {
              ...item,
              total: itemAmount.toFixed(2),
              percentage: totalAmount > 0 ? ((itemAmount / totalAmount) * 100).toFixed(1) : '0'
            }
            console.log('投资标的数据:', itemData)
            return itemData
          }),
          isExpanded: false
        }
      }).filter(subCategory => parseFloat(subCategory.amount) > 0)

      return {
        id: category.id,
        name: category.name,
        amount: primaryAmount.toFixed(2),
        percentage: totalAmount > 0 ? ((primaryAmount / totalAmount) * 100).toFixed(1) : '0',
        subcategories: subcategories,
        isExpanded: false
      }
    }).filter(category => parseFloat(category.amount) > 0)
  },

  // 切换一级分类展开/折叠状态
  toggleCategoryExpansion(e) {
    const categoryId = e.currentTarget.dataset.categoryId
    const assetDistribution = [...this.data.assetDistribution]
    const categoryIndex = assetDistribution.findIndex(item => item.id === categoryId)

    if (categoryIndex !== -1) {
      assetDistribution[categoryIndex].isExpanded = !assetDistribution[categoryIndex].isExpanded

      // 如果折叠一级分类，同时折叠其下所有二级分类
      if (!assetDistribution[categoryIndex].isExpanded) {
        assetDistribution[categoryIndex].subcategories.forEach(subCategory => {
          subCategory.isExpanded = false
        })
      }

      this.setData({
        assetDistribution
      })
    }
  },

  // 切换二级分类展开/折叠状态
  toggleSubcategoryExpansion(e) {
    const categoryId = e.currentTarget.dataset.categoryId
    const subcategoryId = e.currentTarget.dataset.subcategoryId
    const assetDistribution = [...this.data.assetDistribution]
    const categoryIndex = assetDistribution.findIndex(item => item.id === categoryId)

    if (categoryIndex !== -1) {
      const subcategoryIndex = assetDistribution[categoryIndex].subcategories.findIndex(item => item.id === subcategoryId)

      if (subcategoryIndex !== -1) {
        assetDistribution[categoryIndex].subcategories[subcategoryIndex].isExpanded =
          !assetDistribution[categoryIndex].subcategories[subcategoryIndex].isExpanded

        this.setData({
          assetDistribution
        })
      }
    }
  },

  goToBuy() {
    wx.navigateTo({
      url: '/pages/manage/manage?action=buy'
    })
  },

  goToSell() {
    wx.navigateTo({
      url: '/pages/manage/manage?action=sell'
    })
  },

  goToUpdate() {
    wx.navigateTo({
      url: '/pages/manage/manage?action=update'
    })
  },

  // 切换全展开/折叠视图
  toggleFullView() {
    const assetDistribution = [...this.data.assetDistribution]
    const allExpanded = assetDistribution.every(category => category.isExpanded)

    assetDistribution.forEach(category => {
      category.isExpanded = !allExpanded
      category.subcategories.forEach(subCategory => {
        subCategory.isExpanded = !allExpanded
      })
    })

    this.setData({
      assetDistribution
    })
  }
})