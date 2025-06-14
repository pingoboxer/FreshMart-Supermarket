const User = require("../models/userModel");
const { validEmail } = require("../sendMail")

const jwt = require('jsonwebtoken')

const validateRegister = (req, res, next) => {
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

        next()

    } catch (error) {
        console.error('Validation error:', error);
        return res.status(500).json({ message: 'Internal server error during validation' });
    }
}

const authorization = async (req, res, next) => {

    const token = req.header("authorization")

    if (!token) {
        return res.status(401).json({ message: "Please login!" })
    }

    const splitToken = token.split(" ")

    const realToken = splitToken[1]

    const decoded = jwt.verify(realToken, `${process.env.ACCESS_TOKEN}`)
    if (!decoded) {
        return res.status(401).json({ message: "Invalid token!" })
    }

    const user = await User.findById(decoded.id)

    if (!user) {
        return res.status(404).json({ message: "User account not found!" })
    }

    req.user = user
    
    next()
}

const isAdmin = async (req, res, next) => {
    const user = req.user;

    if (user.role !== 'admin') {
        return res.status(403).json({ message: "You are not authorized to access this resource!" });
    }

    next();
}

const isRegularUser = async (req, res, next) => {
    const user = req.user;

    if (user.role !== 'user') {
        return res.status(403).json({ message: "You are not authorized to access this resource!" });
    }

    next();
}

const validateOrder = (req, res, next) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Products must be a non-empty array' });
  }

  for (const item of products) {
    if (!item.product || !item.quantity) {
      return res.status(400).json({ message: 'Each product must have a product ID and quantity' });
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a number greater than 0' });
    }
  }

  next();
}


module.exports = {
    validateRegister,
    authorization,
    isAdmin,
    isRegularUser,
    validateOrder
}