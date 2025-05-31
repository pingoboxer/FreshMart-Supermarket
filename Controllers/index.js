const User = require("../models/userModel")
const Category = require("../models/modelCategory")
const Product = require("../models/productModel")
const { validEmail } = require("../sendMail")
const { findUserService, findProductService, findProductByIdService } = require("../service")

const bcrypt = require('bcrypt')



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

        const existingCategory = await Category.findById(category)
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

    const product = await findProductByIdService()

    res.status(200).json({ product })
}

const handlePlaceOrder = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware
        const { products } = req.body; // [{ product, quantity }, ...]

        let totalAmount = 0;
        const orderItems = [];

        for (const item of products) {

            const product = await Product.findById(item.product)

            if (!product) { 
                return res.status(404).json({ message: 'Product not found' })
            }

            if (product.stock < product.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            
            if (product.quantity <= 0) {
                return res.status(400).json({ message: 'Quantity must be greater than zero' });
            }
            // Update stock
            product.stock -= product.quantity;
            
            await product.save();

            totalAmount += product.price * product.quantity

            orderItems.push({ product: product._id, quantity: product.quantity })
        }

        const order = new Order({
            user: userId,
            products: orderItems,
            totalAmount,
            status: 'Successful'
        })

        await order.save()

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
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

module.exports = {
    handleGetAllUsers,
    handleUserRegistration,
    handleCreateCategory,
    handleCreateProduct,
    handleBrowseProducts,
    handleProductById,
    handlePlaceOrder,
    handleMyOrders
}

