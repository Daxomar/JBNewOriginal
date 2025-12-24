import mongoose from "mongoose";


const bundleSchema = new mongoose.Schema({
  Bundle_id: String, // JB-MTN-001
  Data:String,  // eg 1GB, 5GB
  name: String,   // Amazing Bubdle
  JBCP: Number,  //  20GHS
  JBSP: Number,  //  30GHS
  network: String, // MTN, Vodafone, AirtelTigo
  size: String, // e.g. "1GB", "5GB"
  Duration:String, // non-expiry
  isActive: {
  type: Boolean,
  default: true,
  index: true
},

recommendedRange:String,
});


const Bundle = mongoose.model('Bundle', bundleSchema);

export default Bundle;