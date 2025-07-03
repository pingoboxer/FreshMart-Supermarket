const User = require("../models/userModel")
const Category = require("../models/modelCategory")
const Product = require("../models/productModel")
const { validEmail, sendForgotPasswordEmail } = require("../sendMail")
const { findUserService, findProductService, findProductByIdService } = require("../service")

const mongoose = require('mongoose')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Order = require('../models/order')


const handleLogin = async (req, res) => {
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
            { expiresIn: '5h' }
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
}

const handleForgotPassword = async (req, res) => {
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
            { expiresIn: '5h' }
        )
        await sendForgotPasswordEmail(email, accessToken)

        res.status(200).json({ message: 'Password reset link sent to your email' })
    } catch (error) {
        console.error('Internal server error while processing forgot password request:')
        res.status(500).json({ message: error.message })
    }
}

const handleResetPassword = async (req, res) => {
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
}

const handleGetAllUsers = async (req, res) => {

    const allUsers = await findUserService()

    res.status(200).json({
    message: "All users fetched successfully",
    data: allUsers
    })
}

const handleUserRegistration = async (req, res) => {

    try {
        const { email, password, firstName, lastName } = req.body;
        
        const errors = [];

        if (!email) {
            errors.push('Email is required');
        } 

        if (!password) {
            errors.push('Password is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: errors });
        }

        if (!validEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' })
        }
        
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        if (process.env.ADMIN_EMAIL.toLowerCase().includes(email.toLowerCase())) {
            const admin = new User({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'admin'
            })

            await admin.save()

            res.status(201).json({ 
                message: 'Admin registered successfully',
                newUser: {
                    email: admin.email,
                    firstName: admin.firstName,
                    lastName: admin.lastName
                }
            })
            return;
        }

        const newUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName
        })

        await newUser.save()

        res.status(201).json({ 
            message: 'User registered successfully',
            newUser: {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            }
        })
    }
    catch (error) {
        console.error('Internal server error while registering user:')
        res.status(500).json({ message: error.message })
    }
}

const handleCreateCategory = async (req, res) => {
    try {
        const { name } = req.body

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' })
        }
        const existingCategory = await Category.findOne({ name })
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' })
        }
        if (name.length < 3) {
            return res.status(400).json({ message: 'Category name must be at least 3 characters long' })
        }
        if (name.length > 50) {
            return res.status(400).json({ message: 'Category name must not exceed 50 characters' })
        }
        const category = new Category({ name })
        await category.save()

        res.status(201).json({ message: 'Category created successfully', category })
    } catch (error) {
        console.error('Internal server error while creating category:', error)
        res.status(500).json({ message: error.message })
    }
}

const handleCreateProduct = async (req, res) => {
    try {
        const { name, price, category, description, stock } = req.body

        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Name, price, and category are required' })
        }

        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number' })
        }

        if (typeof stock !== 'undefined' && (typeof stock !== 'number' || stock < 0)) {
            return res.status(400).json({ message: 'Stock must be a non-negative number' })
        }

        const existingCategory = await Category.findOne({ name: category })
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' })
        }

        const product = new Product({
            name,
            price,
            category: existingCategory._id,
            description,
            stock: stock || 0
        })

        await product.save()

        res.status(201).json({ message: 'Product created successfully', product })
    } catch (error) {
        console.error('Internal server error while creating product:', error)
        res.status(500).json({ message: error.message })
    }
}

const handleBrowseProducts = async (req, res) => {
    const products = await findProductService()
    if (!products || products.length === 0) {
        return res.status(404).json({ message: 'No products found' })
    }
    
    res.status(200).json(products)
}

const handleProductById = async (req, res) => {
    const productId = req.params.id
    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' })
    }

    const product = await findProductByIdService(productId)
    if (!product) {
        return res.status(404).json({ message: 'Product not found' })
    }
    if (product.status !== 200) {
        return res.status(product.status).json({ message: product.data })
    }

    res.status(200).json({ product })
}

const handlePlaceOrder = async (req, res) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const userId = req.user.id; // from auth middleware
        const { products } = req.body; // [{ product, quantity }, ...]

        let totalAmount = 0;
        const orderItems = [];

        for (const item of products) {

            const product = await Product.findById(item.product)

            if (!product) {
                await session.abortTransaction()
                return res.status(404).json({ message: 'Product not found' })
            }

            if (product.stock < item.quantity) {
                await session.abortTransaction()
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            
            // Update stock
            product.stock -= item.quantity;
            
            await product.save({ session })

            totalAmount += product.price * item.quantity

            orderItems.push({ product: product._id, quantity: item.quantity })
        }

        const order = new Order({
            user: userId,
            products: orderItems,
            totalAmount,
            status: 'Successful'
        })

        await order.save({ session })

        // Update user's order history
        const user = await User.findById(userId)
        
        user.orders.push(order._id)
        await user.save({ session })
        await session.commitTransaction()
        session.endSession()
        // Return the order details
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        await session.abortTransaction()
        session.endSession()


        console.error('Internal server error while placing order:', error)
        res.status(500).json({ message: error.message })
    }
}


const handleMyOrders = async (req, res) => {
    try {
        const userId = req.user.id
        const orders = await Order.find({ user: userId }).populate('products.product')

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' })
        }

        res.status(200).json(orders)
    } catch (error) {
        console.error('Internal server error while fetching user orders:')
        res.status(500).json({ message: error.message })
    }
}

const handleRestockProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const { quantity } = req.body

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity are required' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        product.stock += quantity
        await product.save()

        res.status(200).json({ message: 'Product restocked successfully', product })
    } catch (error) {
        console.error('Internal server error while restocking product:', error)
        res.status(500).json({ message: error.message })
    }
} 

const handleModifyProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const { name, price, category, description, stock } = req.body

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        if (name) {
            product.name = name
        }
        if (price) {
            if (typeof price !== 'number' || price <= 0) {
                return res.status(400).json({ message: 'Price must be a positive number' })
            }
            product.price = price
        }
        if (category) {
            const existingCategory = await Category.findOne({ name: category })
            if (!existingCategory) {
                return res.status(404).json({ message: 'Category not found' })
            }
            product.category = existingCategory._id
        }
        if (description) {
            product.description = description
        }
        if (typeof stock !== 'undefined') {
            if (typeof stock !== 'number' || stock < 0) {
                return res.status(400).json({ message: 'Stock must be a non-negative number' })
            }
            product.stock = stock
        }
        await product.save()
        res.status(200).json({ message: 'Product modified successfully', product })
    } catch (error) {
        console.error('Internal server error while modifying product:', error)
        res.status(500).json({ message: error.message })
    }
}

const handleDeleteProduct = async (req, res) => {
    try {
        const productId = req.params.id

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        await product.deleteOne()

        res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
        console.error('Internal server error while deleting product:', error)
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleGetAllUsers,
    handleUserRegistration,
    handleCreateCategory,
    handleCreateProduct,
    handleBrowseProducts,
    handleProductById,
    handlePlaceOrder,
    handleMyOrders,
    handleRestockProduct,
    handleModifyProduct,
    handleDeleteProduct
}

