import ResellerBundlePrice from '../models/resellerBundlePrice.model.js';
import Bundle from '../models/bundle.model.js';

/**
 * Get reseller's selling price for a specific bundle
 * Returns custom price if set, otherwise returns base price (JBSP)
 */
export const getResellerBundlePrice = async (resellerId, bundleId) => {
  try {
    // Try to get custom price
    const customPrice = await ResellerBundlePrice.findOne({
      resellerId,
      bundleId,
      isActive: true
    });

    if (customPrice) {
      return {
        price: customPrice.customPrice,
        commission: customPrice.commission,
        hasCustomPrice: true
      };
    }

    // Fall back to base price (JBSP)
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
      throw new Error('Bundle not found');
    }

    return {
      price: bundle.JBSP, // Use JBSP as base price
      commission: 0,
      hasCustomPrice: false
    };
  } catch (error) {
    console.error('Get reseller bundle price error:', error);
    throw error;
  }
};