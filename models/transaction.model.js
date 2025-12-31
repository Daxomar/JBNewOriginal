import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },


  // this is the actual MongoDB ObjectId reference to the Bundle document
  bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true,
  },

//This is the bundleId i created myself to identify different bundles
  bundleIdName:{
    type: String,
    required: true,
  },


  bundleName: {
    type: String,
    required: true,
  },

resellerCode: {
    type: String,
       // allows multiple nulls
},


  baseCost:{
    type:Number,
    required:true,
  },


  amount: {
    type: Number,
    required: true,
  },


    JBProfit: {
    type: Number,
    required: true,
  },

  currency: {
    type: String,
    required: true,
    enum: ['GHS', 'NGN'],
  },

  reference: {
    type: String,
    required: true,
    unique: true,
  },

  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
    index: true
  },

  channel: {
    type: String,
    default: '',
  },

  provider_response: {
    type: Object,
    default: {},
  },

  metadata: {
    type: Object,
    default: {},
  },



    // NEW: Delivery tracking
  deliveryStatus: {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'failed'],
    default: 'pending',
    index: true
  },
  deliveredAt: Date,
  failureReason: String,
 
  exportId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ExportJob",
  index: true
}




}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
