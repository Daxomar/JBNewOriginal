import mongoose from 'mongoose';

const resellerBundlePriceSchema = new mongoose.Schema({
  resellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true,
    index: true
  },
  customPrice: {
    type: Number,
    required: true,
    min: 0
  },
  // Store base price snapshot for audit/validation
  basePriceSnapshot: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound unique index - one price per reseller per bundle
resellerBundlePriceSchema.index(
  { resellerId: 1, bundleId: 1 }, 
  { unique: true }
);

// Pre-save validation and auto-calculate commission
resellerBundlePriceSchema.pre('save', function(next) {
  // Validate custom price >= base price
  if (this.customPrice < this.basePriceSnapshot) {
    return next(new Error(
      `Custom price (${this.customPrice}) cannot be lower than base price (${this.basePriceSnapshot})`
    ));
  }
  
  // Auto-calculate commission
  this.commission = this.customPrice - this.basePriceSnapshot;
  next();
});

const ResellerBundlePrice = mongoose.model('ResellerBundlePrice', resellerBundlePriceSchema);

export default ResellerBundlePrice;