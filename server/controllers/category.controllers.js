const Test = require('../models/test.model')
const TestCategory = require('../models/testsCategory.model')
const TestsCategoryTest = require('../models/testsCategoryTest.model')
const { text2Url } = require('../helpers/string')

/**
 * Создание категории
 * @param req
 * @param res
 */
module.exports.saveCategory = async (req, res) => {
  try {
    const reqBody = JSON.parse(req.body.data)
    const code = text2Url(reqBody.code || reqBody.title)

    // Проверка на уникальность теста
    const candidate = await TestCategory.findOne({
      where: { code },
      attributes: ['id']
    })
    if (candidate) {
      res.status(409).json({
        message: 'Категория с такой ссылкой уже есть',
        code: 'url_busy',
        validate: true,
        returnObject: true
      })
      return
    }

    // Сохранение категории
    const category = {
      ...reqBody,
      code
    }
    // Добавляем путь к картинке, если с запросом пришел файл
    if (req.file && req.file.filename) {
      category.image = `/${req.file.filename}`
    }

    const categoryDbQuery = await TestCategory.create(category)

    if (categoryDbQuery.id) {
      res.json(categoryDbQuery)
    } else {
      res.status(404).json({ message: 'SQL Category ID create Error' })
    }
  } catch (e) {
    console.error('saveCategory error:', e)
  }
}

module.exports.editCategory = async (req, res) => {
  const categoryId = req.params && req.params.id
  const reqBody = JSON.parse(req.body.data)
  const code = text2Url(reqBody.code || reqBody.title)
  const isCodeChanged = reqBody.isCodeChanged

  // Если код изменился
  if (isCodeChanged) {
    const candidate = await TestCategory.findOne({
      where: { code },
      attributes: ['id']
    })
    if (candidate) {
      res.status(409).json({
        message: 'Категория с такой ссылкой уже есть',
        code: 'url_busy',
        validate: true,
        returnObject: true
      })
      return
    }
  }
  // Удаляет ненужные поля для бд
  delete reqBody.isCodeChanged

  if (categoryId) {
    try {
      const category = {
        ...reqBody,
        code
      }
      // Добавляем путь к картинке, если с запросом пришел файл
      if (req.file && req.file.filename) {
        category.image = `/${req.file.filename}`
      }

      // Обновление категории
      await TestCategory.update(category, { where: { id: categoryId } })

      res.json(category)
    } catch (e) {
      console.error('SQL Category edit Error', e)
      res.status(404).json({ message: 'SQL Category edit Error' })
    }
  } else {
    res.status(404).json({ message: 'editCategory - Нет id категории' })
  }
}

/**
 * Получение всех категорий
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.getCategories = async (req, res) => {
  try {
    const categories = await TestCategory.findAll({
      include: [
        { model: Test, as: 'tests' }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    })

    res.json(categories)
  } catch (e) {
    console.error('getCategories Error', e)
    res.status(404).json({ message: 'Categories fetch Error', validate: true })
  }
}

/**
 * Удаление категории, его результатов и вопросов по id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.deleteCategoryById = async (req, res) => {
  const categoryId = req.params && req.params.id

  try {
    const promises = [
      TestCategory.destroy({ where: { id: categoryId } }),
      TestsCategoryTest.destroy({ where: { testCategoryId: categoryId } })
    ]
    await Promise.all(promises)

    res.status(200).json()
  } catch (e) {
    console.error('deleteTestById Error', e)
    res.status(404).json({ message: 'deleteCategoryById Error', validate: true })
  }
}

/**
 * Удаляет сразу несколько категорий
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.deleteManyCategories = async (req, res) => {
  const { categoriesIds } = req.body

  try {
    const promises = [
      TestCategory.destroy({ where: { id: categoriesIds } }),
      TestsCategoryTest.destroy({ where: { testCategoryId: categoriesIds } })
    ]
    await Promise.all(promises)

    res.status(200).json()
  } catch (e) {
    console.error('deleteManyCategories error:', e)
    res.status(404).json({ message: 'deleteManyCategories Error', validate: true })
  }
}
