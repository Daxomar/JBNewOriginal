import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD } from './env.js';


export const accountEmail = "daxohnero@gmail.com";

// This one is for my EmailRemiders of subscriptions
export const SendRemindertransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: accountEmail,
    pass: EMAIL_PASSWORD,
  },
}); 



// This one is for Welcome Emails
export const Welcometransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
       user: accountEmail,
       pass: EMAIL_PASSWORD,
    },
 });  



//This one is for OTP Emails
export const OTPtransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: accountEmail,
      pass: EMAIL_PASSWORD,
    },
  });


//This one is for Transaction Receipt Emails
  export const transactionReceiptTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: accountEmail,
      pass: EMAIL_PASSWORD,
    },
  });


  //This one is for invite Emails from Admin
  export const inviteEmailTransported = nodemailer.createTransport({
    service: "gmail",
   auth: {
      user: accountEmail,
      pass: EMAIL_PASSWORD,
    },
  });



  //This one is for approval Email from admin
  export const approvalEmailTransported = nodemailer.createTransport({
    service: "gmail",
   auth: {
      user: accountEmail,
      pass: EMAIL_PASSWORD,
    },
  });




