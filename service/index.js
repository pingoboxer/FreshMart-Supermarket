const User = require("../models/userModel")
const Product = require("../models/productModel")


const findUserService = async () => {
    try {
        const allUsers = await User.find()
        return allUsers

    } catch (error) {
        console.error("Error fetching users:", error)
        res.User.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const findProductService = async () => {
    try {
        const allProducts = await Product.find()
        return allProducts

    } catch (error) {
        console.error("Error fetching products:", error)
        res.Product.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const findProductByIdService = async (req, res) => {
    try {
        const productId = req.params.Id
        const product = await Product.findById(productId).populate('category', 'name')
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        res.status(200).json({ product })
    } catch (error) {
        console.error('Internal server error while fetching product details:', error)
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    findUserService,
    findProductService,
    findProductByIdService
}