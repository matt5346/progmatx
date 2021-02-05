const union = require('lodash/union')
const keyBy = require('lodash/keyBy')
const Test = require('../models/test.model')
const TestResult = require('../models/testResult.model')
const TestQuestion = require('../models/testQuestion.model')
const TestQuestionAnswer = require('../models/testQuestionAnswer.model')
const TestsCategoryTest = require('../models/testsCategoryTest.model')
const TestsCategory = require('../models/testsCategory.model')
const TestStatus = require('../models/testStatus.model')
const { text2Url } = require('../helpers/string')
const { FOR_DYNAMIC_ID } = require('../constants/test')

/**
 * Создание теста
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.saveTest = async (req, res) => {
  try {
    const reqBody = JSON.parse(req.body.data)
    const results = reqBody.results
    const questions = reqBody.questions
    const categories = reqBody.categories
    const code = text2Url(reqBody.code || reqBody.title)

    // Проверка на уникальность теста
    const candidate = await Test.findOne({
      where: { code },
      attributes: ['id']
    })
    if (candidate) {
      res.status(409).json({
        message: 'Тест с такой ссылкой уже есть',
        code: 'url_busy',
        validate: true,
        returnObject: true
      })
      return
    }

    // Удаляет ненужные поля для сохранения в базу
    delete reqBody.categories
    delete reqBody.results
    delete reqBody.questions

    // Сохранение самого теста
    const test = {
      ...reqBody,
      code
    }
    // Добавляем путь к картинке, если с запросом пришел файл
    if (req.file && req.file.filename) {
      test.image = `/${req.file.filename}`
    }

    const testDbQuery = await Test.create(test)
    const testId = testDbQuery.id

    if (testId) {
      test.id = testId

      // Устанавливает связь категорий и теста
      if (categories) {
        test.categories = await setTestCategories(categories, testId)
      }

      // Сохранение результатов теста (шаблоны)
      if (results && results.length) {
        test.results = await createTestResults(results, testId)
      }
      // Сохранение вопросов теста
      if (questions && questions.length) {
        test.questions = await createTestQuestions(questions, testId)
      }

      res.json(test)
    } else {
      res.status(404).json({ message: 'SQL Test ID create Error' })
    }
  } catch (e) {
    console.error('e', e)
    res.status(404).json({ message: 'SQL Test create Error' })
  }
}

/**
 * Редактирование конкретного теста
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.editTest = async (req, res) => {
  const testId = req.params && req.params.id
  const reqBody = JSON.parse(req.body.data)
  const code = text2Url(reqBody.code || reqBody.title)
  const isCodeChanged = reqBody.isCodeChanged
  const categories = reqBody.categories
  const currentCategories = reqBody.currentCategories
  const results = reqBody.results
  const questions = reqBody.questions

  // Если код изменился
  if (isCodeChanged) {
    const candidate = await Test.findOne({
      where: { code },
      attributes: ['id']
    })
    if (candidate) {
      res.status(409).json({
        message: 'Тест с такой ссылкой уже есть',
        code: 'url_busy',
        validate: true,
        returnObject: true
      })
      return
    }
  }

  // Удаляет ненужные поля для сохранения в базу
  delete reqBody.categories
  delete reqBody.currentCategories
  delete reqBody.results
  delete reqBody.questions

  if (testId) {
    try {
      /**
       * Объект теста
       * @type {{code: string}}
       */
      const test = {
        ...reqBody,
        code
      }
      // Добавляем путь к картинке, если с запросом пришел файл
      if (req.file && req.file.filename) {
        test.image = `/${req.file.filename}`
      }

      // Обновление теста
      await Test.update(test, { where: { id: testId } })

      // Обновление категорий, результатов и вопрсов теста
      if (categories) {
        test.categories = await updateTestCategories({ categories, currentCategories, testId })
      }
      test.results = await updateTestResults(results, testId)
      test.questions = await updateTestQuestions(questions, testId)

      res.json(test)
    } catch (e) {
      console.error('SQL Test edit Error', e)
      res.status(404).json({ message: 'SQL Test edit Error' })
    }
  } else {
    res.status(404).json({ message: 'editTest - Нет id теста' })
  }
}

module.exports.saveTestStatus = async (req, res) => {
  try {
    const reqBody = req.body

    const testStatus = await TestStatus.create(reqBody)

    res.json(testStatus)
  } catch (e) {
    console.error('saveTestStatus Error', e)
    res.status(404).json({ message: 'SQL saveTestStatus Error', validate: true })
  }
}

/**
 * Получение всех тестов
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.getTests = async (req, res) => {
  try {
    const tests = await Test.findAll({
      include: [
        { model: TestResult, as: 'results' },
        {
          model: TestQuestion,
          as: 'questions',
          include: [
            { model: TestQuestionAnswer, as: 'answers' }
          ]
        },
        { model: TestsCategory, as: 'categories' },
        { model: TestStatus, as: 'statuses' }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    })

    res.json(tests)
  } catch (e) {
    console.error('getTests Error', e)
    res.status(404).json({ message: 'SQL Tests fetch Error', validate: true })
  }
}

module.exports.getTestById = async (req, res) => {
  try {
    const testId = req.params && req.params.id
    const test = await Test.findOne({
      include: [
        { model: TestResult, as: 'results' },
        {
          model: TestQuestion,
          as: 'questions',
          include: [
            { model: TestQuestionAnswer, as: 'answers' }
          ]
        },
        { model: TestsCategory, as: 'categories' },
        { model: TestStatus, as: 'statuses' }
      ],
      where: { id: testId }
    })

    res.json(test)
  } catch (e) {
    console.error('getTests Error', e)
    res.status(404).json({ message: 'SQL Tests fetch Error', validate: true })
  }
}

/**
 * Удаление теста, его результатов и вопросов по id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports.deleteTestById = async (req, res) => {
  const testId = req.params && req.params.id

  try {
    const destroyOptions = { where: { testId } }
    const promises = [
      Test.destroy({ where: { id: testId } }),
      TestResult.destroy(destroyOptions),
      TestQuestion.destroy(destroyOptions),
      TestQuestionAnswer.destroy(destroyOptions),
      TestsCategoryTest.destroy(destroyOptions)
    ]
    await Promise.all(promises)

    res.status(200).json()
  } catch (e) {
    console.error('deleteTestById Error', e)
    res.status(404).json({ message: 'SQL Tests Remove Error', validate: true })
  }
}

module.exports.deleteManyTests = async (req, res) => {
  const { testsIds } = req.body

  try {
    const destroyOptions = { where: { testId: testsIds } }
    const promises = [
      Test.destroy({ where: { id: testsIds } }),
      TestResult.destroy(destroyOptions),
      TestQuestion.destroy(destroyOptions),
      TestQuestionAnswer.destroy(destroyOptions),
      TestsCategoryTest.destroy(destroyOptions)
    ]
    await Promise.all(promises)

    res.status(200).json()
  } catch (e) {
    console.error('deleteManyCategories error:', e)
    res.status(404).json({ message: 'deleteManyCategories Error', validate: true })
  }
}

// =============================================================
/**
 * Сохранение результатов (шаблонов) теста
 * @param {Array} testResults - массив результатов теста
 * @param {Number} testId - id теста
 * @returns {Promise<null|any>}
 */
async function createTestResults (testResults, testId) {
  testResults = testResults.map((item) => {
    return { ...item, testId }
  })

  try {
    return await TestResult.bulkCreate(testResults)
  } catch (e) {
    console.error('createTestResults TestResult.bulkCreate Error', e)
    return null
  }
}

/**
 * Обновляет результаты теста
 * @param results
 * @param testId
 * @returns {Promise<*[]>}
 */
async function updateTestResults (results, testId) {
  /**
   * массив для добавления новых шаблонов
   * @type {*[]}
   */
  let testNewResultsDbQuery = []
  /**
   * Массив для изменения уже добавленных шаблонов
   * @type {*[]}
   */
  const oldTestResults = []
  /**
   * Массив шаблонов теста из запроса
   * @type {*[]}
   */
  const testResults = results
  /**
   * массив id шаблонов из запроса
   * для новых шаблонов в массив добавляется уникальный id
   * для дальнейшего мерджа с currentResultsIds
   * @type {unknown[]}
   */
  const testResultsIds = testResults.map((item, index) => {
    if (item.id) { return item.id }
    return FOR_DYNAMIC_ID + index
  })
  /**
   * массив шаблонов теста из БД
   * @type {boolean|*|*[]}
   */
  const currentResults = await getResultsByTestId(testId) || []
  /**
   * Массив id шаблонов теста из БД
   * @type {*[]}
   */
  const currentResultsIds = currentResults.map(item => item.id) || []
  /**
   * Массив с id шаблонов, для обработки всех элементов, в том числе удаленных
   */
  const cycleForProcessing = union(testResultsIds, currentResultsIds)

  // Изменение результатов теста (шаблоны)

  // Если у теста уже были шаблоны
  if (currentResults && currentResults.length) {
    // Если с запросом пришли шаблоны
    if (testResults && testResults.length) {
      const newTestResults = []
      for (let i = 0; i < cycleForProcessing.length; i++) {
        // Пример -------------------------
        // currentResultsIds = [1, 2, 3, 4]
        // testResultsIds = [2, 3, 5]
        // cycleForProcessing = [1, 2, 3, 4, 5]

        // Если id есть в массивах из базы и из запроса (шаблон был и остался)
        // Редактируем шаблон
        if (currentResultsIds.includes(cycleForProcessing[i]) && testResultsIds.includes(cycleForProcessing[i])) { // 2, 3
          const result = testResults.find(item => item.id === cycleForProcessing[i])

          if (result && result.id) {
            await TestResult.update(result, { where: { id: result.id } })
            oldTestResults.push(result)
          } else {
            handleError('Edit test: No "result" for edit')
          }
        } else if (currentResultsIds.includes(cycleForProcessing[i])) {
          // Удаляем шаблоны из базы 1, 4
          await TestResult.destroy({
            where: { id: cycleForProcessing[i] }
          })
        } else if (!currentResultsIds.includes(cycleForProcessing[i]) && testResultsIds.includes(cycleForProcessing[i])) { // Сохраняем шаблон 5
          const resultIndex = +cycleForProcessing[i].split(FOR_DYNAMIC_ID)[1]
          const result = testResults[resultIndex]

          newTestResults.push(result)
        }
      }
      // Сохраняем результаты тестов в базу
      testNewResultsDbQuery = await createTestResults(newTestResults, testId) || []
    } else { // Если с запросом не пришли шаблоны - удаляем все
      await TestResult.destroy({
        where: { testId }
      })
    }
  } else if (testResults && testResults.length) { // Если у теста не были шаблоны и пришли новые
    testNewResultsDbQuery = await createTestResults(testResults, testId) || []
  }

  return [...oldTestResults, ...testNewResultsDbQuery]
}

/**
 * Создание вопросов теста вместе с ответами
 * @param testQuestions
 * @param testId
 * @returns {Promise<null|any>}
 */
async function createTestQuestions (testQuestions, testId) {
  testQuestions = testQuestions.map((item) => {
    return { ...item, testId }
  })

  try {
    const testQuestionsDb = await TestQuestion.bulkCreate(testQuestions)

    for (let i = 0; i < testQuestionsDb.length; i++) {
      const question = testQuestions[i]
      const questionDb = testQuestionsDb[i]

      if (question.answers && question.answers.length) {
        const answers = question.answers.map((item) => {
          return { ...item, questionId: questionDb.id, testId }
        })

        testQuestionsDb[i].dataValues.answers = await TestQuestionAnswer.bulkCreate(answers)
      }
    }

    return testQuestionsDb
  } catch (e) {
    console.error('createTestQuestions TestQuestion.bulkCreate Error', e)
    return null
  }
}

/**
 * Обновляет вопросы теста
 * @param questions
 * @param testId
 * @returns {Promise<*[]>}
 */
async function updateTestQuestions (questions, testId) {
  /**
   * массив для добавления новых вопросов
   * @type {*[]}
   */
  let testNewQuestionsDbQuery = []
  /**
   * Массив для изменения уже добавленных вопросов
   * @type {*[]}
   */
  const oldTestQuestions = []
  /**
   * массив id вопросов из запроса
   * для новых вопросов в массив добавляется уникальный id
   * для дальнейшего мерджа с currentQuestionsIds
   * @type {unknown[]}
   */
  const testQuestionsIds = questions.map((item, index) => {
    if (item.id) { return item.id }
    return FOR_DYNAMIC_ID + index
  })
  /**
   * массив вопросов теста из БД
   * @type {boolean|*|*[]}
   */
  const currentQuestions = await getQuestionsByTestId(testId) || []
  /**
   * Массив id вопросов теста из БД
   * @type {*[]}
   */
  const currentQuestionsIds = currentQuestions.map(item => item.id) || []
  /**
   * Массив с id вопросов, для обработки всех элементов, в том числе удаленных
   */
  const cycleForProcessing = union(testQuestionsIds, currentQuestionsIds)

  // Изменение вопросов теста

  // Если у теста уже были вопросы
  if (currentQuestions && currentQuestions.length) {
    // Если с запросом пришли вопросы
    if (questions && questions.length) {
      const newTestQuestions = []
      for (let i = 0; i < cycleForProcessing.length; i++) {
        // Пример -------------------------
        // currentQuestionsIds = [1, 2, 3, 4]
        // testQuestionsIds = [2, 3, 5]
        // cycleForProcessing = [1, 2, 3, 4, 5]

        // Если id есть в массивах из базы и из запроса (вопрос был и остался)
        // Редактируем вопрос
        if (currentQuestionsIds.includes(cycleForProcessing[i]) && testQuestionsIds.includes(cycleForProcessing[i])) { // 2, 3
          const question = questions.find(item => item.id === cycleForProcessing[i])

          if (question && question.id) {
            const questionId = question.id
            const answers = question.answers
            // Обновляем вопросы
            await TestQuestion.update(question, { where: { id: questionId } })
            if (answers && answers.length) {
              question.answers = await updateTestQuestionAnswers(answers, questionId)
            }

            oldTestQuestions.push(question)
          } else {
            handleError('Edit test: No "question" for edit')
          }
        } else if (currentQuestionsIds.includes(cycleForProcessing[i])) {
          // Удаляем вопросы и их ответы из базы 1, 4
          await TestQuestion.destroy({
            where: { id: cycleForProcessing[i] }
          })
          await TestQuestionAnswer.destroy({
            where: { questionId: cycleForProcessing[i] }
          })
        } else if (!currentQuestionsIds.includes(cycleForProcessing[i]) && testQuestionsIds.includes(cycleForProcessing[i])) { // Сохраняем вопрос 5
          const questionIndex = +cycleForProcessing[i].split(FOR_DYNAMIC_ID)[1]
          const question = questions[questionIndex]

          newTestQuestions.push(question)
        }
      }
      // Сохраняем вопросы тестов в базу
      testNewQuestionsDbQuery = await createTestQuestions(newTestQuestions, testId)
    } else { // Если с запросом не пришли вопросы - удаляем все
      await TestQuestion.destroy({
        where: { testId }
      })
      await TestQuestionAnswer.destroy({
        where: { testId }
      })
    }
  } else if (questions && questions.length) { // Если у теста не были вопросы и пришли новые
    testNewQuestionsDbQuery = await createTestQuestions(questions, testId)
  }

  return [...oldTestQuestions, ...testNewQuestionsDbQuery]
}

/**
 * Создание ответов вопроса
 * @param answers
 * @param questionId
 * @returns {Promise<null|any>}
 */
async function createTestQuestionAnswers (answers, questionId) {
  answers = answers.map((item) => {
    return { ...item, questionId }
  })

  try {
    return await TestQuestionAnswer.bulkCreate(answers)
  } catch (e) {
    console.error('createTestQuestionAnswers TestQuestionAnswer.bulkCreate Error', e)
    return null
  }
}

/**
 * Обновляет ответы вопроса
 * @param answers
 * @param questionId
 * @returns {Promise<*[]>}
 */
async function updateTestQuestionAnswers (answers, questionId) {
  /**
   * массив для добавления новых ответов
   * @type {*[]}
   */
  let testNewAnswersDbQuery = []
  /**
   * Массив для изменения уже добавленных ответов
   * @type {*[]}
   */
  const oldTestAnswers = []
  /**
   * массив id ответов из запроса
   * для новых ответов в массив добавляется уникальный id
   * для дальнейшего мерджа с currentAnswersIds
   * @type {unknown[]}
   */
  const testAnswersIds = answers.map((item, index) => {
    if (item.id) { return item.id }
    return FOR_DYNAMIC_ID + index
  })
  /**
   * массив ответов вопроса из БД
   * @type {boolean|*|*[]}
   */
  const currentAnswers = await getAnswersByQuestionId(questionId) || []
  /**
   * Массив id ответов вопроса из БД
   * @type {*[]}
   */
  const currentAnswersIds = currentAnswers.map(item => item.id) || []
  /**
   * Массив с id ответов, для обработки всех элементов, в том числе удаленных
   */
  const cycleForProcessing = union(testAnswersIds, currentAnswersIds)

  // Изменение ответов вопроса

  // Если у вопроса уже были ответы
  if (currentAnswers && currentAnswers.length) {
    // Если с запросом пришли ответы
    if (answers && answers.length) {
      const newTestAnswers = []
      for (let i = 0; i < cycleForProcessing.length; i++) {
        // Пример -------------------------
        // currentAnswersIds = [1, 2, 3, 4]
        // testAnswersIds = [2, 3, 5]
        // cycleForProcessing = [1, 2, 3, 4, 5]

        // Если id есть в массивах из базы и из запроса (ответ был и остался)
        // Редактируем ответ
        if (currentAnswersIds.includes(cycleForProcessing[i]) && testAnswersIds.includes(cycleForProcessing[i])) { // 2, 3
          const answer = answers.find(item => item.id === cycleForProcessing[i])

          if (answer && answer.id) {
            const answerId = answer.id
            // Обновляем ответы
            await TestQuestionAnswer.update(answer, { where: { id: answerId } })

            oldTestAnswers.push(answer)
          } else {
            handleError('Edit test: No "answer" for edit')
          }
        } else if (currentAnswersIds.includes(cycleForProcessing[i])) {
          // Удаляем ответы из базы 1, 4
          await TestQuestionAnswer.destroy({
            where: { id: cycleForProcessing[i] }
          })
        } else if (!currentAnswersIds.includes(cycleForProcessing[i]) && testAnswersIds.includes(cycleForProcessing[i])) { // Сохраняем ответ 5
          const answerIndex = +cycleForProcessing[i].split(FOR_DYNAMIC_ID)[1]
          const answer = answers[answerIndex]

          newTestAnswers.push(answer)
        }
      }
      // Сохраняем ответы вопросов в базу
      testNewAnswersDbQuery = await createTestQuestionAnswers(newTestAnswers, questionId)
    } else { // Если с запросом не пришли ответы - удаляем все
      await TestQuestionAnswer.destroy({
        where: { questionId }
      })
    }
  } else if (answers && answers.length) { // Если у вопроса не были ответы и пришли новые
    testNewAnswersDbQuery = await createTestQuestionAnswers(answers, questionId)
  }

  return [...oldTestAnswers, ...testNewAnswersDbQuery]
}

/**
 * Обновляет связь категорий и теста
 * @param categories
 * @param currentCategories
 * @param testId
 * @returns {Promise<*[]>}
 */
async function updateTestCategories ({ categories, currentCategories, testId }) {
  /**
   * Массив для добавления новых категорий
   * @type {*[]}
   */
  let testNewCategoriesDbQuery = []
  /**
   * Массив для старых категорий
   * @type {Array}
   */
  const oldTestCategories = []
  /**
   * Массив id категорий из запроса
   * для дальнейшего мерджа с currentCategoriesIds
   * @type {*[]}
   */
  const testCategoriesIds = categories.map(item => item.id)
  /**
   * Массив id категорий, которые были у теста
   * @type {*[]}
   */
  const currentCategoriesIds = currentCategories.map(item => item.id) || []
  /**
   * Массив с id категорий, для обработки всех элементов, в том числе удаленных
   */
  const cycleForProcessing = union(testCategoriesIds, currentCategoriesIds)

  // Изменение связей категорий и теста
  // Если у теста уже были категории
  if (currentCategories && currentCategories.length) {
    // Если с запросом пришли категории
    if (categories && categories.length) {
      /**
       * Объект категорий где ключи - id
       */
      const testCategoriesKeyBy = keyBy(categories, 'id')
      /**
       * Массив новых категорий для создания связи с тестом
       * @type {Array}
       */
      const newTestCategories = []
      for (let i = 0; i < cycleForProcessing.length; i++) {
        const testCategoryId = +cycleForProcessing[i]
        if (!testCategoryId) {
          console.error('Есть ошибка конвертации id категории теста')
          continue
        }
        // Пример -------------------------
        // currentCategoriesIds = [1, 2, 3, 4]
        // testCategoriesIds = [2, 3, 5]
        // cycleForProcessing = [1, 2, 3, 4, 5]

        // Если категории были и остались
        if (currentCategoriesIds.includes(testCategoryId) && testCategoriesIds.includes(testCategoryId)) {
          const category = testCategoriesKeyBy[testCategoryId]

          oldTestCategories.push(category)
        } else if (currentCategoriesIds.includes(testCategoryId)) {
          // Удаляем связь категории из базы 1, 4
          await TestsCategoryTest.destroy({
            where: { testCategoryId }
          })
        } else if (!currentCategoriesIds.includes(testCategoryId) && testCategoriesIds.includes(testCategoryId)) { // Сохраняем шаблон 5
          const category = testCategoriesKeyBy[testCategoryId]

          newTestCategories.push(category)
        }
      }
      // Устанавливаем связь теста и категорий
      testNewCategoriesDbQuery = await setTestCategories(newTestCategories, testId) || []
    } else { // Если с запросом не пришли категории - удаляем все связи
      await TestsCategoryTest.destroy({
        where: { testId }
      })
    }
  } else if (categories && categories.length) { // Если у теста не были категории и пришли новые
    testNewCategoriesDbQuery = await setTestCategories(categories, testId) || []
  }

  return [...testNewCategoriesDbQuery, ...oldTestCategories]
}

/**
 * Создание связи между тестом и категориями
 * @param categories
 * @param testId
 * @returns {Promise<null|any>}
 */
async function setTestCategories (categories, testId) {
  categories = categories.map((item) => {
    return { testId, testCategoryId: item.id || 0 }
  })

  try {
    return await TestsCategoryTest.bulkCreate(categories)
  } catch (e) {
    console.error('setTestCategories TestsCategoryTest.bulkCreate Error', e)
    return null
  }
}

/**
 * Получает результаты теста по id
 * @param testId
 * @returns {Promise<null|boolean|any>}
 */
async function getResultsByTestId (testId) {
  if (!testId) { return false }

  try {
    return await TestResult.findAll({
      where: { testId }
    })
  } catch (e) {
    console.error('getResultsByTestId TestResult.findAll Error', e)
    return null
  }
}

/**
 * Получает вопросы теста по id
 * @param testId
 * @returns {Promise<null|boolean|any>}
 */
async function getQuestionsByTestId (testId) {
  if (!testId) { return false }

  try {
    return await TestQuestion.findAll({
      where: { testId }
    })
  } catch (e) {
    console.error('getQuestionsByTestId TestQuestion.findAll Error', e)
    return null
  }
}

/**
 * Получает ответы вопросов по id
 * @param questionId
 * @returns {Promise<null|boolean|any>}
 */
async function getAnswersByQuestionId (questionId) {
  if (!questionId) { return false }

  try {
    return await TestQuestionAnswer.findAll({
      where: { questionId }
    })
  } catch (e) {
    console.error('getAnswersByQuestionId TestQuestionAnswer.findAll Error', e)
    return null
  }
}

/**
 * Обработчик ошибок
 * @param error
 */
function handleError (error) {
  console.error('handleError', error)
  throw new Error(error)
}
