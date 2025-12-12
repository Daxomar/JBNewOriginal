import { generateWelcomeEmailTemplate, generateOTPEmailTemplate, generateTransactionReceiptTemplate } from "./email-template.js";
import { accountEmail,  SendRemindertransporter, Welcometransporter, OTPtransporter, transactionReceiptTransporter } from "../config/nodemailer.js";
import dayjs from 'dayjs';




//WELCOME EMAIL FUNCTION
export const sendWelcomeEmail = async ({ to, userName }) => {
  if (!to) throw new Error('Email address is required');
  
  const mailOptions = {
    from: accountEmail,
    to: to,
     subject: 'Welcome to Dave SubDub! 🎉',
     html: generateWelcomeEmailTemplate({ 
      userName,
      accountSettingsLink: 'https://yourapp.com/dashboard',
      supportLink: 'https://yourapp.com/support'
    })
  };


  try {
    const info = await Welcometransporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};






// OTP EMAIL FUNCTION 
export const sendOTPEmail = async ({ to, userName, otpCode, expiryMinutes }) => {
  if (!to || !otpCode) throw new Error('Email and OTP code are required');
  
  const mailOptions = {
    from: accountEmail,
    to: to,
    subject: 'Your Verification Code - Dave SubDub',
    html: generateOTPEmailTemplate({ 
      userName,
      otpCode,
      expiryMinutes,
      supportLink: 'https://yourapp.com/support'
    })
  };

  try {
    const info = await OTPtransporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};






// TRANSACTION RECEIPT EMAIL FUNCTION
export const sendTransactionReceiptEmail = async ({
  to,
  userName,
  amount,
  bundleName,
  reference,
  date,
  phoneNumber,
  paymentMethod,
}) => {
  if (!to) throw new Error("Email address is required");

  const mailOptions = {
    from: accountEmail,
    to,
    subject: "JoyBundle Payment Receipt ✔",
    html: generateTransactionReceiptTemplate({
      userName,
      amount,
      bundleName,
      reference,
      date,
      phoneNumber,
      paymentMethod,
    }),
  };

  try {
    const info = await transactionReceiptTransporter.sendMail(mailOptions);
    console.log("Receipt email sent successfully");
    return info;
  } catch (error) {
    console.error("Error sending receipt email:", error);
    throw error;
  }
};
