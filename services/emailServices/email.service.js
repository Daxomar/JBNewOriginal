

// services/email.service.js
import { 
  generateWelcomeEmailTemplate, 
  generateOTPEmailTemplate, 
  generateTransactionReceiptTemplate, 
  generateInviteEmailTemplate, 
  generateApprovedEmailTemplate,
  generateCustomerRefundTemplate,
  generateResellerRefundTemplate,
} from "../../utils/email-template.js";
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY, EMAIL_FROM } from "../../config/env.js";

sgMail.setApiKey(SENDGRID_API_KEY);

// ============================================
// WELCOME EMAIL FUNCTION
// ============================================
export const sendWelcomeEmail = async ({ to, userName }) => {
  if (!to) throw new Error('Email address is required');
  
  const html = generateWelcomeEmailTemplate({ 
    userName,
    accountSettingsLink: 'https://yourapp.com/dashboard',
    supportLink: 'https://yourapp.com/support'
  });

  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: 'Welcome to JOYBUNDLE RESELLER PROGRAM!',
      html
    });

    console.log(`✅ Welcome email sent to ${to}`);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// ============================================
// OTP EMAIL FUNCTION
// ============================================
export const sendOTPEmail = async ({ to, userName, otpCode, expiryMinutes }) => {
  if (!to || !otpCode) throw new Error('Email and OTP code are required');
  
  const html = generateOTPEmailTemplate({ 
    userName,
    otpCode,
    expiryMinutes,
    supportLink: 'https://yourapp.com/support'
  });

  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: 'Your Verification Code - Joybundle',
      html
    });

    console.log(`✅ OTP email sent to ${to}`);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// ============================================
// TRANSACTION RECEIPT EMAIL FUNCTION
// ============================================
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

  const html = generateTransactionReceiptTemplate({
    userName,
    amount,
    bundleName,
    reference,
    date,
    phoneNumber,
    paymentMethod,
  });

  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: "JoyBundle Payment Receipt ✔",
      html
    });

    console.log(`✅ Receipt email sent to ${to}`);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error("Error sending receipt email:", error);
    throw error;
  }
};

// ============================================
// INVITE EMAIL FUNCTION
// ============================================
export const sendInviteEmail = async ({ to, inviteUrl }) => {
  if (!to || !inviteUrl) throw new Error('Email and invite URL are required');

  const html = generateInviteEmailTemplate({
    inviteUrl
  });

  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: 'You\'ve been invited to join JoyDataBundle 🚀',
      html
    });

    console.log(`✅ Invite email sent to ${to}`);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending invite email:', error);
    throw error;
  }
};

// ============================================
// APPROVAL EMAIL FUNCTION
// ============================================
export const sendApprovedEmail = async ({ to, userName, loginUrl }) => {
  if (!to || !loginUrl) throw new Error('Email and login URL are required');

  const html = generateApprovedEmailTemplate({
    userName,
    loginUrl
  });

  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: 'Your JoyDataBundle Account Has Been Approved ✅',
      html
    });

    console.log(`✅ Approval email sent to ${to}`);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};





export const sendCustomerRefundEmail = async ({
  to,
  userName,
  refundAmount,
  bundleName,
  reference,
  phoneNumber,
}) => {
  if (!to) throw new Error("Email address is required");
 
  const html = generateCustomerRefundTemplate({
    userName,
    refundAmount,
    bundleName,
    reference,
    phoneNumber,
  });
 
  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: "JoyBundle Refund Processed",
      html,
    });
    console.log(`✅ Refund email sent to ${to} (${reference})`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending customer refund email (${reference}):`, error);
    throw error;
  }
};





export const sendResellerRefundNotice = async ({
  to,
  resellerName,
  clawedBack,
  transactionsRefunded,
  payoutRejected,
  availableBalance,
}) => {
  if (!to) throw new Error("Email address is required");
 
  const html = generateResellerRefundTemplate({
    resellerName,
    clawedBack,
    transactionsRefunded,
    payoutRejected,
    availableBalance,
  });
 
  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: "JoyBundle Commission Adjustment",
      html,
    });
    console.log(`✅ Reseller notice sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending reseller refund notice (${to}):`, error);
    throw error;
  }
};