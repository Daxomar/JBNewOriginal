import { generateWelcomeEmailTemplate, generateOTPEmailTemplate, generateTransactionReceiptTemplate, generateInviteEmailTemplate, generateApprovedEmailTemplate } from "./email-template.js";
import { accountEmail,  SendRemindertransporter, Welcometransporter, OTPtransporter, transactionReceiptTransporter, approvalEmailTransported, inviteEmailTransported } from "../config/nodemailer.js";
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




//INVITE EMAIL 
export const sendInviteEmail = async ({ 
  to,
  inviteUrl
 }) => {
  if (!to || !inviteUrl) throw new Error('Email and invite URL are required');

  const mailOptions = {
    from: accountEmail,
    to,
    subject: 'You’ve been invited to join JoyDataBundle 🚀',
    html: generateInviteEmailTemplate({
      inviteUrl
    })
  };

  try {
    const info = await inviteEmailTransported.sendMail(mailOptions);
    console.log('Invite email sent successfully');
    return info;
  } catch (error) {
    console.error('Error sending invite email:', error);
    throw error;
  }
};




//APPROVAL EMAIL SENDER
export const sendApprovedEmail = async ({ to, userName, loginUrl }) => {
  if (!to || !loginUrl) throw new Error('Email and login URL are required');

  const mailOptions = {
    from: accountEmail,
    to,
    subject: 'Your JoyDataBundle Account Has Been Approved ✅',
    html: generateApprovedEmailTemplate({
      userName,
      loginUrl
    })
  };

  try {
    const info = await approvalEmailTransported.sendMail(mailOptions);
    console.log('Approval email sent successfully');
    return info;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};
