const { Router } = require('express')
const passport = require('passport')
const upload = require('../middleware/upload')
const { saveTest, editTest, getTests, getTestById, deleteTestById, deleteManyTests } = require('../controllers/test.controllers')
const router = Router()

/**
 * Создание теста
 */
router.post(
  '/save',
  passport.authenticate('jwt-admin', { session: false }),
  upload.single('image'),
  saveTest
)

/**
 * Редактирование конкретного теста
 */
router.post(
  '/edit/:id',
  passport.authenticate('jwt-admin', { session: false }),
  upload.single('image'),
  editTest
)

/**
 * Сохранение статуса теста
 */
router.post(
  '/save-status',
  passport.authenticate('jwt2', { session: false }),
  saveTest
)

/**
 * Получение всех тестов
 */
router.get(
  '/',
  getTests
)

/**
 * Получение всех тестов
 */
router.get(
  '/:id',
  getTestById
)

/**
 * Удаление теста по id
 */
router.delete(
  '/delete/:id',
  deleteTestById
)

/**
 * Удаление нескольких тестов
 */
router.delete(
  '/many/delete',
  deleteManyTests
)

module.exports = router
