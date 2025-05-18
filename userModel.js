const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: { type: String, require: true, unique: true, trim: true },
    password: { type: String, require: true },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    role: { type: String, enum: ['user', 'admin'], default: "user" },
    verified: {type: Boolean, default: false}
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User