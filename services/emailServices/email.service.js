// // services/email.service.js
// import { 
//   generateWelcomeEmailTemplate, 
//   generateOTPEmailTemplate, 
//   generateTransactionReceiptTemplate, 
//   generateInviteEmailTemplate, 
//   generateApprovedEmailTemplate 
// } from "../../utils/email-template.js";
// import { EMAIL_FROM } from "../../config/env.js";
// import emailQueue from "../../queues/emailQueue/emailQueue.js";

// // ============================================
// // WELCOME EMAIL FUNCTION
// // ============================================
// export const sendWelcomeEmail = async ({ to, userName }) => {
//   if (!to) throw new Error('Email address is required');
  
//   const html = generateWelcomeEmailTemplate({ 
//     userName,
//     accountSettingsLink: 'https://yourapp.com/dashboard',
//     supportLink: 'https://yourapp.com/support'
//   });

//   try {
//     await emailQueue.add(
//       {
//         to,
//         from: EMAIL_FROM,
//         subject: 'Welcome to JOYBUNDLE RESELLER PROGRAM! ',
//         html
//       },
//       {
//         attempts: 3,
//         backoff: { type: 'exponential', delay: 2000 }
//       }
//     );

//     console.log(`✅ Welcome email queued for ${to}`);
//     return { success: true, message: 'Email queued' };
//   } catch (error) {
//     console.error('Error queuing welcome email:', error);
//     throw error;
//   }
// };

// // ============================================
// // OTP EMAIL FUNCTION
// // ============================================
// export const sendOTPEmail = async ({ to, userName, otpCode, expiryMinutes }) => {
//   if (!to || !otpCode) throw new Error('Email and OTP code are required');
  
//   const html = generateOTPEmailTemplate({ 
//     userName,
//     otpCode,
//     expiryMinutes,
//     supportLink: 'https://yourapp.com/support'
//   });

//   try {
//     await emailQueue.add(
//       {
//         to,
//         from: EMAIL_FROM,
//         subject: 'Your Verification Code - Joybundle',
//         html
//       },
//       {
//         attempts: 3,
//         backoff: { type: 'exponential', delay: 2000 }
//       }
//     );

//     console.log(`✅ OTP email queued for ${to}`);
//     return { success: true, message: 'OTP email queued' };
//   } catch (error) {
//     console.error('Error queuing OTP email:', error);
//     throw error;
//   }
// };

// // ============================================
// // TRANSACTION RECEIPT EMAIL FUNCTION
// // ============================================
// export const sendTransactionReceiptEmail = async ({
//   to,
//   userName,
//   amount,
//   bundleName,
//   reference,
//   date,
//   phoneNumber,
//   paymentMethod,
// }) => {
//   if (!to) throw new Error("Email address is required");

//   const html = generateTransactionReceiptTemplate({
//     userName,
//     amount,
//     bundleName,
//     reference,
//     date,
//     phoneNumber,
//     paymentMethod,
//   });

//   try {
//     await emailQueue.add(
//       {
//         to,
//         from: EMAIL_FROM,
//         subject: "JoyBundle Payment Receipt ✔",
//         html
//       },
//       {
//         attempts: 3,
//         backoff: { type: 'exponential', delay: 2000 }
//       }
//     );

//     console.log(`✅ Receipt email queued for ${to}`);
//     return { success: true, message: 'Receipt email queued' };
//   } catch (error) {
//     console.error("Error queuing receipt email:", error);
//     throw error;
//   }
// };

// // ============================================
// // INVITE EMAIL FUNCTION
// // ============================================
// export const sendInviteEmail = async ({ to, inviteUrl }) => {
//   if (!to || !inviteUrl) throw new Error('Email and invite URL are required');

//   const html = generateInviteEmailTemplate({
//     inviteUrl
//   });

//   try {
//     await emailQueue.add(
//       {
//         to,
//         from: EMAIL_FROM,
//         subject: 'You\'ve been invited to join JoyDataBundle 🚀',
//         html
//       },
//       {
//         attempts: 3,
//         backoff: { type: 'exponential', delay: 2000 }
//       }
//     );

//     console.log(`✅ Invite email queued for ${to}`);
//     return { success: true, message: 'Invite email queued' };
//   } catch (error) {
//     console.error('Error queuing invite email:', error);
//     throw error;
//   }
// };

// // ============================================
// // APPROVAL EMAIL FUNCTION
// // ============================================
// export const sendApprovedEmail = async ({ to, userName, loginUrl }) => {
//   if (!to || !loginUrl) throw new Error('Email and login URL are required');

//   const html = generateApprovedEmailTemplate({
//     userName,
//     loginUrl
//   });

//   try {
//     await emailQueue.add(
//       {
//         to,
//         from: EMAIL_FROM,
//         subject: 'Your JoyDataBundle Account Has Been Approved ✅',
//         html
//       },
//       {
//         attempts: 3,
//         backoff: { type: 'exponential', delay: 2000 }
//       }
//     );

//     console.log(`✅ Approval email queued for ${to}`);
//     return { success: true, message: 'Approval email queued' };
//   } catch (error) {
//     console.error('Error queuing approval email:', error);
//     throw error;
//   }
// };






// services/email.service.js
import { 
  generateWelcomeEmailTemplate, 
  generateOTPEmailTemplate, 
  generateTransactionReceiptTemplate, 
  generateInviteEmailTemplate, 
  generateApprovedEmailTemplate 
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