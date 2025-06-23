# 🛒 FreshMart Supermarket API

A backend API project for a high-end supermarket, built to provide smooth and secure customer and admin interactions, including user registration, product browsing, order placement, and more.

# Postman Documentation Link

https://documenter.getpostman.com/view/44323489/2sB2x8DqxE

## ✨ Features

- ✅ User Authentication (Register/Login)
- 🔐 Forgot Password and Reset
- 🛍️ Browse Products and View Details
- 👨‍💼 Admin Access to:
  - Get all users
  - Create new categories
  - Create new products in a category
- 📦 User Order Management:
  - Place Orders
  - View My Orders

## 🛠 Technologies Used

- Express.js
- MongoDB with Mongoose
- JWT for Authentication
- bcrypt for Password Hashing
- dotenv for Environment Variables
- cors for Resource Sharing

## 🚀 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/pingoboxer/FreshMart-Supermarket.git
   cd FreshMart-Supermarket

2. Install dependecies

   npm install

3. Create a .env file in the root directory and set the following:

   MONGODB_URI = 'your_mongodb_connection_string'

   PORT = 8000

   ACCESS_TOKEN = your-secret-jwt-access-token

   REFRESH_TOKEN = your-secret-jwt-refresh-token


   EMAIL_USER = your-secret-admin-email-for-sending-user-emails

   EMAIL_PASS = your-secret-admin-email-password

   ADMIN_EMAIL = ['yourvariousadminemails@gmail.com']

4. Start the server

   npm start

📬 API Usage
Base URL: https://freshmart-supermarket.onrender.com

🔐 Auth Routes

POST /api/register – Register new user

POST /api/login – Login

POST /api/forgot-password – Request password reset

🛒 Product Routes

GET /api/browse-products – Get all products

GET /api/browse-products/:id – Get a specific product by ID

👨‍💼 Admin Routes

GET /api/all-users – Get all users

POST /api/create-category – Create category

POST /api/create-product – Create product in category

📦 Order Routes

POST /api/place-order – Place an order

GET /api/view-my-orders – View current user’s orders

📜 License
This project is licensed under the MIT License

👤 Author
Kpamor Raphael
GitHub: @pingoboxer