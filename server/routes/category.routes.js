const { Router } = require('express')
const passport = require('passport')
const upload = require('../middleware/upload')
const { saveCategory, getCategories, editCategory, deleteCategoryById, deleteManyCategories } = require('../controllers/category.controllers')
const router = Router()

/**
 * Создание категории
 */
router.post(
  '/save',
  passport.authenticate('jwt-admin', { session: false }),
  upload.single('image'),
  saveCategory
)

/**
 * Редактирование конкретной категории
 */
router.post(
  '/edit/:id',
  passport.authenticate('jwt-admin', { session: false }),
  upload.single('image'),
  editCategory
)

/**
 * Получение всех категорий
 */
router.get(
  '/',
  getCategories
)

/**
 * Удаление категории по id
 */
router.delete(
  '/delete/:id',
  deleteCategoryById
)

/**
 * Удаление нескольких категорий
 */
router.delete(
  '/many/delete',
  deleteManyCategories
)

module.exports = router
