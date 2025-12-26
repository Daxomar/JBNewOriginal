// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: [true, 'User Name is required'],
        trim: true,
        minLength: 2,
        maxLength: 50,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

   email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 5,
        maxLength: 100,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },

       password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: 6,

    },
    accessToken: {
        type: String,
    },


    refreshToken: {
        type: String,
    },


    verifyOtp: {
        type: String,
        default: ''
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0
    },


    status:{
        type: String,
        default: 'pending'
    },

    isApproved:{
        type: Boolean,
        default: false
    },


    isAccountVerified: {
        type: Boolean,
        default: false
    },

    resetOtp: {
        type: String,
        default: ''
    },

    resetOtpExpireAt: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        emum: ["user", "admin", "moderator"],
        default: "user"
    },


resellerCode: {
    type: String,
    unique: true,
    sparse: true,   // allows multiple nulls
    trim: true,
},

 commissionRate: {
    type: Number,
    default: 5,        // Default 5% for new resellers
    min: 0,            // Minimum 0%
    max: 20,           // Maximum 20% cap (you set this)
  },


totalCommissionEarned: {
    type: Number,
    default: 0,
},

totalCommissionPaidOut: {
    type: Number,
    default: 0,
},

totalSales: {
  type: Number,
  default: 0
},

//Fot future use - system accounts that cannot login
  isSystemAccount: Boolean,
  canLogin: Boolean

  },
  { timestamps: true }
);



const User = mongoose.model('User', userSchema);

export default User;

 
 



