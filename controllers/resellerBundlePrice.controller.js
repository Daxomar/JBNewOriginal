import ResellerBundlePrice from '../models/resellerBundlePrice.model.js';
import Bundle from '../models/bundle.model.js';
import User from '../models/user.model.js';



//.ENV THIS GOES TO LATER HOHO
// const SYSTEM_RESELLER_CODE = process.env.SYSTEM_RESELLER_CODE 
const SYSTEM_RESELLER_CODE = 'SYS_JB_a8f39c1e4b7d0f29';


export const getBundlesByResellerCode = async (req, res) => {
  try {
    const { resellerCode } = req.params;


    // 1. Reject direct usage of system code (if user tried to pass it)
    if (resellerCode && resellerCode === SYSTEM_RESELLER_CODE) {
      return res.status(400).json({
        success: false,
        message: 'MotherFucker you cannot use the system reseller code here directly via the URL be smarter'
      });
    }
    
    // Now the FallBack happens when i want it to
    const codeToUse = resellerCode || SYSTEM_RESELLER_CODE;


    // Find reseller by code
    const reseller = await User.findOne({ 
      resellerCode: codeToUse,
      role: 'user',
      ...(resellerCode && { isSystemAccount: { $ne: true } })
      // Assuming resellers have role 'user'
    //   isAccountVerified: true 
    });


    if (!reseller) {
      return res.status(404).json({ 
        success: false,
        message: 'Reseller not found' 
      });
    }

    // Get all active bundles
    const bundles = await Bundle.find({ isActive: true });

    // Get reseller's custom prices
    const customPrices = await ResellerBundlePrice.find({ 
      resellerId: reseller._id,
      isActive: true 
    });

    // Create price lookup map
    const priceMap = {};
    customPrices.forEach(price => {
      priceMap[price.bundleId.toString()] = price.customPrice;
    });

    // Merge bundle data with custom pricing (NO commission data exposed)
    const bundlesForCustomer = bundles.map(bundle => ({
      _id: bundle._id,
      Bundle_id: bundle.Bundle_id,
      name: bundle.name,
      Data: bundle.Data,
      JBCP : bundle.JBCP,
      JBSP : bundle.JBSP,
      network: bundle.network,
      volume: bundle.volume,
      price: priceMap[bundle._id.toString()] || bundle.JBSP || bundle.price, // Customer sees final price
      validity: bundle.validity,
      description: bundle.description,
      isActive: bundle.isActive
    }));

    res.json({
      success: true,
      data: bundlesForCustomer,
      reseller: {
        name: reseller.name,
        resellerCode: reseller.resellerCode
      }
    });

  } catch (error) {
    console.error('Get bundles by reseller code error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch bundles',
      error: error.message 
    });
  }
};











export const getResellerPricing = async (req, res) => {
  try {
    const { id } = req.user 
   const resellerId = id;
    // Get all active bundles
    const bundles = await Bundle.find({ isActive: true });

    // Get reseller's custom prices
    const customPrices = await ResellerBundlePrice.find({ 
      resellerId,
      isActive: true 
    });

    // Create price lookup map
    const priceMap = {};
    customPrices.forEach(price => {
      priceMap[price.bundleId.toString()] = {
        customPrice: price.customPrice,
        commission: price.commission,
        lastUpdated: price.updatedAt
      };
    });

    // Merge bundle data with pricing
    const bundlesWithPricing = bundles.map(bundle => {
      const pricing = priceMap[bundle._id.toString()];
      
      return {
        _id: bundle._id,
        name: bundle.name,
        network: bundle.network,
        volume: bundle.Data,
        basePrice: bundle.JBSP,
        validity: bundle.Duration,
        description: bundle.description,
        customPrice: pricing?.customPrice || bundle.JBSP,
        commission: pricing?.commission || 0,
        hasCustomPrice: !!pricing,
        lastUpdated: pricing?.lastUpdated
      };
    });

    res.json({
      success: true,
      data: bundlesWithPricing
    });

  } catch (error) {
    console.error('Get reseller pricing error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch pricing',
      error: error.message 
    });
  }
};


export const setCustomPrice = async (req, res) => {
  try {
    // const resellerId = req.user._id;

     const { id } = req.user
    const resellerId = id;
    const { bundleId, customPrice } = req.body;

    // Validation
    if (!bundleId || customPrice === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Bundle ID and custom price are required' 
      });
    }

    // Get bundle to validate
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
      return res.status(404).json({ 
        success: false,
        message: 'Bundle not found' 
      });
    }

    // Validate price >= base price
    if (customPrice <= bundle.JBSP) {
      return res.status(400).json({ 
        success: false,
        message: `Custom price (${customPrice}) must be more than the base price (${bundle.JBSP})` 
      });
    }

    // Upsert custom price
    const updatedPrice = await ResellerBundlePrice.findOneAndUpdate(
      { resellerId, bundleId },
      {
        customPrice,
        basePriceSnapshot: bundle.JBSP,
        commission: customPrice - bundle.JBSP
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    );

    res.json({
      success: true,
      message: 'Custom price updated successfully',
      data: {
        bundleId: updatedPrice.bundleId,
        customPrice: updatedPrice.customPrice,
        commission: updatedPrice.commission,
        basePrice: bundle.JBSP
      }
    });

  } catch (error) {
    console.error('Set custom price error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update price',
      error: error.message 
    });
  }
};