// models/Payout.js
import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    reseller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payoutCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    netAmount: {
      type: Number, // amount - payoutCharge
      required: true,
    },
    network: {
      type: String,
      required: true,
      enum: ['MTN', 'Vodafone', 'AirtelTigo'],
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin who processed it
    },
    rejectionReason: {
      type: String,
    },
    transactionReference: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;