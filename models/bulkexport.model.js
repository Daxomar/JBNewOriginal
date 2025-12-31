// models/BulkExport.js
import mongoose from 'mongoose';

const bulkExportSchema = new mongoose.Schema({
  // Unique export identifier
  exportId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },

  // Array of transaction IDs in this export
  transactionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  }],

  // Number of transactions in this export
  count: {
    type: Number,
    required: true
  },

  // Status of the export itself
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
    index: true
  },

  network: String,


  // When the export was created
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // When all transactions were marked as delivered
  completedAt: Date,

  // Any notes or errors related to this export
  notes: String

}, { timestamps: true });


const BulkExport = mongoose.model('BulkExport', bulkExportSchema);

export default BulkExport; 

