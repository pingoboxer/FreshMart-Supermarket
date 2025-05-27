
const nodemailer = require('nodemailer')

const sendForgotPasswordEmail = async (email, token) => {

    try {
        const mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL_USER}`,
                pass: `${process.env.EMAIL_PASS}`
            }
        })

        const mailDetails = {
            from: `${process.env.EMAIL_USER}`,
            to: `${email}`,
            subject: 'Password Reset Request',
            html: `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                    <div class="container" style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); width: 90%; max-width: 600px;">
                        <div class="logo" style="text-align: center; margin-bottom: 30px; font-size: 1.5em; color: #333; font-weight: bold;">
                            FreshMart
                        </div>
                        <h1 style="color: #007bff; margin-bottom: 20px; text-align: center;">Password Reset Request</h1>
                        <p style="margin-bottom: 15px;">Hello,</p>
                        <p style="margin-bottom: 15px;">You have requested to reset your password for your FreshMart account. Please click the button below to proceed with the password reset:</p>
                        <div class="button-container" style="text-align: center; margin-top: 30px;">
                            <a href="http://www.freshmart-supermarket.com/reset-password/${token}" class="reset-button" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Your Password</a>
                        </div>
                        <p style="margin-bottom: 15px;">If the button does not work for any reason, please click on the link below.</p>
                        <a href="http://www.freshmart-supermarket.com/reset-password/${token}" style="color: #007bff; text-decoration: none;">Reset Password Link</a>
                        <p style="font-size: 0.9em; color: #777; margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">This link is valid for a limited time. If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
                        <p class="note" style="font-size: 0.9em; color: #777; margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">Thank you for using FreshMart!</p>
                    </div>
                </body>`
        }

        await mailTransport.sendMail(mailDetails)
    } catch (error) {
        console.error('Error sending email:', error)
        res.status(500).json({ message: error.message })
    }

}

const validEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = {
    sendForgotPasswordEmail,
    validEmail
}