Page({
  data: {
    action: 'buy',
    selectedItemIndex: -1,
    maxSellQuantity: undefined,
    formData: {
      date: '',
      code: '',
      name: '',
      quantity: '',
      price: '',
      primaryCategoryIndex: 0,
      secondaryCategoryIndex: 0
    },
    categories: [
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
  },

  onLoad(options) {
    // 获取操作类型（buy/sell/update）
    if (options.action) {
      this.setData({
        action: options.action
      })
    }

    // 初始化日期为今天
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // 处理分类数据，供 picker 组件使用
    const primaryCategoryNames = this.data.categories.map(item => item.name)
    const secondaryCategoryNames = this.data.categories[0].subcategories.map(item => item.name)

    // 加载投资组合中的标的数据，供选择使用
    const portfolio = wx.getStorageSync('portfolio') || []
    const availableItems = portfolio.map(item => ({
      code: item.code,
      name: item.name
    }))

    this.setData({
      'formData.date': dateStr,
      'primaryCategoryNames': primaryCategoryNames,
      'secondaryCategoryNames': secondaryCategoryNames,
      'availableItems': availableItems
    })
  },

  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  onCodeChange(e) {
    this.setData({
      'formData.code': e.detail.value
    })
  },

  onNameChange(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  onQuantityChange(e) {
    let quantity = e.detail.value

    // 如果是卖出操作，验证数量不大于最大可卖出数量
    if (this.data.action === 'sell' && this.data.maxSellQuantity !== undefined) {
      if (parseFloat(quantity) > this.data.maxSellQuantity) {
        quantity = this.data.maxSellQuantity.toString()
        wx.showToast({
          title: `卖出数量不能大于持有数量（${this.data.maxSellQuantity} 股）`,
          icon: 'none'
        })
      }
    }

    this.setData({
      'formData.quantity': quantity
    })
  },

  onPriceChange(e) {
    this.setData({
      'formData.price': e.detail.value
    })
  },

  onPrimaryCategoryChange(e) {
    const primaryCategoryIndex = e.detail.value
    const secondaryCategoryNames = this.data.categories[primaryCategoryIndex].subcategories.map(item => item.name)

    this.setData({
      'formData.primaryCategoryIndex': primaryCategoryIndex,
      'formData.secondaryCategoryIndex': 0,
      'secondaryCategoryNames': secondaryCategoryNames
    })
  },

  onCodeSelect(e) {
    const selectedItemIndex = e.detail.value
    const selectedItem = this.data.availableItems[selectedItemIndex]

    if (selectedItem) {
      // 获取该标的的完整信息
      const portfolio = wx.getStorageSync('portfolio') || []
      const existingItem = portfolio.find(item => item.code === selectedItem.code)

      if (existingItem) {
        // 找到对应的一级分类和二级分类的索引
        const primaryCategoryIndex = this.data.categories.findIndex(category => category.name === existingItem.primaryCategory)
        let secondaryCategoryIndex = 0
        if (primaryCategoryIndex !== -1) {
          secondaryCategoryIndex = this.data.categories[primaryCategoryIndex].subcategories.findIndex(subCategory => subCategory.id === existingItem.categoryId)
        }

        this.setData({
          selectedItemIndex: selectedItemIndex,
          'formData.code': existingItem.code,
          'formData.name': existingItem.name,
          'formData.primaryCategoryIndex': primaryCategoryIndex,
          'formData.secondaryCategoryIndex': secondaryCategoryIndex,
          'secondaryCategoryNames': this.data.categories[primaryCategoryIndex].subcategories.map(subCategory => subCategory.name)
        })

        // 如果是卖出操作，获取该标的的最大可卖出数量
        if (this.data.action === 'sell') {
          this.setData({
            maxSellQuantity: existingItem.quantity
          })
        }
      }
    }
  },

  onNameSelect(e) {
    const selectedItemIndex = e.detail.value
    const selectedItem = this.data.availableItems[selectedItemIndex]

    if (selectedItem) {
      // 获取该标的的完整信息
      const portfolio = wx.getStorageSync('portfolio') || []
      const existingItem = portfolio.find(item => item.name === selectedItem.name)

      if (existingItem) {
        // 找到对应的一级分类和二级分类的索引
        const primaryCategoryIndex = this.data.categories.findIndex(category => category.name === existingItem.primaryCategory)
        let secondaryCategoryIndex = 0
        if (primaryCategoryIndex !== -1) {
          secondaryCategoryIndex = this.data.categories[primaryCategoryIndex].subcategories.findIndex(subCategory => subCategory.id === existingItem.categoryId)
        }

        this.setData({
          selectedItemIndex: selectedItemIndex,
          'formData.code': existingItem.code,
          'formData.name': existingItem.name,
          'formData.primaryCategoryIndex': primaryCategoryIndex,
          'formData.secondaryCategoryIndex': secondaryCategoryIndex,
          'secondaryCategoryNames': this.data.categories[primaryCategoryIndex].subcategories.map(subCategory => subCategory.name)
        })

        // 如果是卖出操作，获取该标的的最大可卖出数量
        if (this.data.action === 'sell') {
          this.setData({
            maxSellQuantity: existingItem.quantity
          })
        }
      }
    }
  },

  onSecondaryCategoryChange(e) {
    this.setData({
      'formData.secondaryCategoryIndex': e.detail.value
    })
  },

  submitForm(e) {
    const { action, formData, categories } = this.data
    const { date, code, name, quantity, price, primaryCategoryIndex, secondaryCategoryIndex } = formData

    // 验证表单
    if (!date || !code || !name || !price) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if ((action === 'buy' || action === 'sell') && !quantity) {
      wx.showToast({
        title: '请填写数量',
        icon: 'none'
      })
      return
    }

    // 保存到存储
    const portfolio = wx.getStorageSync('portfolio') || []
    const records = wx.getStorageSync('records') || []

    const primaryCategory = categories[primaryCategoryIndex]
    const secondaryCategory = primaryCategory.subcategories[secondaryCategoryIndex]
    const categoryId = secondaryCategory.id
    const categoryName = secondaryCategory.name
    const primaryCategoryName = primaryCategory.name
    const recordId = Date.now()

    // 根据操作类型处理
    if (action === 'buy') {
      // 检查是否已存在该标的
      const existingItemIndex = portfolio.findIndex(item => item.code === code)
      if (existingItemIndex !== -1) {
        // 更新现有标的
        const existingItem = portfolio[existingItemIndex]
        existingItem.quantity += parseFloat(quantity)
        existingItem.price = parseFloat(price)
        existingItem.categoryId = categoryId
        existingItem.category = categoryName
        existingItem.primaryCategory = primaryCategoryName
      } else {
        // 添加新标的
        portfolio.push({
          code,
          name,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          categoryId,
          category: categoryName,
          primaryCategory: primaryCategoryName,
          lastUpdate: date
        })
      }
    } else if (action === 'sell') {
      const existingItemIndex = portfolio.findIndex(item => item.code === code)
      if (existingItemIndex !== -1) {
        const existingItem = portfolio[existingItemIndex]
        if (existingItem.quantity >= parseFloat(quantity)) {
          existingItem.quantity -= parseFloat(quantity)
          existingItem.price = parseFloat(price)
          existingItem.categoryId = categoryId
          existingItem.category = categoryName
          existingItem.primaryCategory = primaryCategoryName

          // 如果数量为0，移除该标的
          if (existingItem.quantity <= 0) {
            portfolio.splice(existingItemIndex, 1)
          }
        } else {
          wx.showToast({
            title: '卖出数量不能大于持有数量',
            icon: 'none'
          })
          return
        }
      } else {
        wx.showToast({
          title: '该标的不存在',
          icon: 'none'
        })
        return
      }
    } else if (action === 'update') {
      const existingItemIndex = portfolio.findIndex(item => item.code === code)
      if (existingItemIndex !== -1) {
        const existingItem = portfolio[existingItemIndex]
        existingItem.price = parseFloat(price)
        existingItem.categoryId = categoryId
        existingItem.category = categoryName
        existingItem.primaryCategory = primaryCategoryName
        existingItem.lastUpdate = date
      } else {
        wx.showToast({
          title: '该标的不存在',
          icon: 'none'
        })
        return
      }
    }

    // 保存记录
    const recordData = {
      id: recordId,
      action,
      code,
      name,
      quantity: action === 'update' ? null : parseFloat(quantity),
      price: parseFloat(price),
      categoryId,
      category: categoryName,
      primaryCategory: primaryCategoryName,
      categoryPath: `${primaryCategoryName} > ${categoryName}`,
      date
    }

    // 只有买入和卖出操作才有数量和金额
    if (action === 'buy' || action === 'sell') {
      recordData.amount = parseFloat(quantity) * parseFloat(price)
    }

    records.push(recordData)

    // 保存到本地存储
    wx.setStorageSync('portfolio', portfolio)
    wx.setStorageSync('records', records)

    // 显示成功信息
    wx.showToast({
      title: `${action === 'buy' ? '买入' : action === 'sell' ? '卖出' : '更新'}成功`,
      icon: 'success'
    })

    // 返回到首页
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  }
})