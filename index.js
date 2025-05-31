

const express = require('express')

const mongoose = require('mongoose')

const dotenv = require('dotenv')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const User = require('./models/userModel')
const Category = require('./models/modelCategory')
const Product = require('./models/productModel')

const { sendForgotPasswordEmail, validEmail } = require('./sendMail')
const { handleGetAllUsers, handleUserRegistration, handleCreateCategory, handleCreateProduct, handleBrowseProducts, handleProductById, handlePlaceOrder, handleMyOrders } = require('./Controllers')
const { validateRegister, authorization, isAdmin } = require('./middleware')
const Order = require('./models/order')



dotenv.config()

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 5000

mongoose
    .connect(process.env.MONGODB_URI).then(() => {
        console.log('MongoDB connected...')

        app.listen(PORT, () => {
            console.log(`Server started running on port ${PORT}...`)
        })
    }).catch((err) => {
        console.log('MongoDB connection error:', err)
    })


app.post('/register', validateRegister, handleUserRegistration)

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'User account does not exist' })
        }

        const isPasswordValid = await bcrypt.compare(password, user?.password)
        if (!isPasswordValid) {
            return res.status(404).json({ message: 'Invalid email or password' })
        }

        const accessToken = jwt.sign(
            { id: user?._id }, 
            process.env.ACCESS_TOKEN, 
            { expiresIn: '5m' }
        )

        const refreshToken = jwt.sign(
            { id: user?._id }, 
            process.env.REFRESH_TOKEN, 
            { expiresIn: '30d' }
        )

        res.status(200).json({ 
            message: "Login successful",
            accessToken,
            user: {
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName
            },
            refreshToken
        })
    } catch (error) {
        console.error('Internal server error while logging in user:')
        res.status(500).json({ message: error.message })
    }
})

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'User account does not exist' })
        }
        
        const accessToken = jwt.sign(
            { user }, 
            `${process.env.ACCESS_TOKEN}`, 
            { expiresIn: '5m' }
        )
        await sendForgotPasswordEmail(email, accessToken)

        res.status(200).json({ message: 'Password reset link sent to your email' })
    } catch (error) {
        console.error('Internal server error while processing forgot password request:')
        res.status(500).json({ message: error.message })
    }
})

app.patch('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }
        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'User account does not exist' })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()

        res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
        console.error('Internal server error while resetting password:')
        res.status(500).json({ message: error.message })
    }
})

// MVC -R
// Model Controller Routes Middleware

// Middlewares / Authorization / Validations

// Deploy

app.get('/all-users', authorization, isAdmin, handleGetAllUsers)

app.post('/create-category', authorization, isAdmin, handleCreateCategory)

app.post('/create-product', authorization, isAdmin, handleCreateProduct)

app.get('/browse-products', authorization, handleBrowseProducts)

app.get('/browse-products/:id', authorization, handleProductById)

app.post('/place-order', authorization, handlePlaceOrder)

app.get('/view-my-orders', authorization, handleMyOrders)


