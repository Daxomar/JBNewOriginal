import { generateWelcomeEmailTemplate, generateOTPEmailTemplate } from "./email-template.js";
import { accountEmail,  SendRemindertransporter, Welcometransporter, OTPtransporter } from "../config/nodemailer.js";
import dayjs from 'dayjs';





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
