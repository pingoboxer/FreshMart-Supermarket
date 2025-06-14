
const express = require('express')

const { sendForgotPasswordEmail, validEmail } = require('../sendMail')
const { handleGetAllUsers, handleUserRegistration, handleCreateCategory, handleCreateProduct, handleBrowseProducts, handleProductById, handlePlaceOrder, handleMyOrders, handleLogin, handleForgotPassword, handleResetPassword } = require('../Controllers')
const { validateRegister, authorization, isAdmin, validateOrder } = require('../middleware')


const router = express.Router()

router.post('/register', validateRegister, handleUserRegistration)

router.post('/login', handleLogin)

router.post('/forgot-password', handleForgotPassword)

router.patch('/reset-password', handleResetPassword)

// MVC -R
// Model Controller Routes Middleware

// Middlewares / Authorization / Validations

// Deploy

router.get('/all-users', authorization, isAdmin, handleGetAllUsers)

router.post('/create-category', authorization, isAdmin, handleCreateCategory)

router.post('/create-product', authorization, isAdmin, handleCreateProduct)

router.get('/browse-products', authorization, handleBrowseProducts)

router.get('/browse-products/:id', authorization, handleProductById)

router.post('/place-order', authorization, validateOrder, handlePlaceOrder)

router.get('/view-my-orders', authorization, handleMyOrders)

module.exports = router