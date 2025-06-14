

const express = require('express')

const mongoose = require('mongoose')

const dotenv = require('dotenv')

const cors = require('cors')
const routes = require('./Routes')



dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

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

app.get('/', (req, res) => {
    res.status(200).json({message: 'Welcome to the FreshMart Supermarket backend API'})
})

app.use('/api', routes)



