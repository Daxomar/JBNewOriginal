// models/SubmittedNumber.js
import mongoose from 'mongoose';

const submittedNumberSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    resellerCode: {
      type: String,
      default: '', // '' means direct traffic, no reseller link
      trim: true,
      index: true,
    },
    network: {
      type: String,
      required: true,
      enum: ['MTN', 'Vodafone', 'AirtelTigo'],
      default: 'MTN',
    },
    status: {
      type: String,
      enum: ['submitted', 'verified', 'failed'],
      default: 'submitted',
    },
    providerRecordId: {
      type: String, // Bossu's record.id
    },
    providerMessage: {
      type: String, // Bossu's provider_message
    },
    note: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
    },
    notifiedAt: {
      type: Date, // Set once the reseller has messaged the customer
    },
  },
  { timestamps: true }
);

// One record per number per reseller, so two resellers can each track
// the same customer independently.
submittedNumberSchema.index({ phone: 1, resellerCode: 1 }, { unique: true });

const SubmittedNumber = mongoose.model('SubmittedNumber', submittedNumberSchema);

export default SubmittedNumber;