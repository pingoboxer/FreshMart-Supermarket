

const express = require('express')

const mongoose = require('mongoose')

const dotenv = require('dotenv')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const User = require('./userModel')



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


app.post('/register', async (req, res) => {

        try {
            const { email, password, firstName, lastName } = req.body

            if (!email) {
                return res.status(400).json({ message: 'Email is required' })
            }
            if (!password) {
                return res.status(400).json({ message: 'Password is required' })
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' })
            }

            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long' })
            }

            const hashedPassword = await bcrypt.hash(password, 12)

            const newUser = new User({
                email,
                password: hashedPassword,
                firstName,
                lastName
            })

            await newUser.save()

            res.status(201).json({ message: 'User registered successfully' })
        }
        catch (error) {
            console.error('Internal server error while registering user:')
            res.status(500).json({ message: error.message })
        }
    })

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