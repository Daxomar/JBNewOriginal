import  { Router} from 'express';


import {
  getResellerPricing,
  setCustomPrice,
  getBundlesByResellerCode,
//   setBulkCustomPrices,
//   resetCustomPrice,
//   applyGlobalCommission
} from '../controllers/resellerBundlePrice.controller.js';

import  {  authorizeRoles,  protect,   } from '../middlewares/auth.middleware.js'



const resellerBundlePriceRouter = Router();



// PUBLIC: Get bundles with reseller's custom prices (for customers)
resellerBundlePriceRouter.get('/public/:resellerCode', getBundlesByResellerCode);


// Get all bundles with reseller's custom pricing
resellerBundlePriceRouter.get('/pricing',protect, getResellerPricing);

// Set custom price for single bundle
resellerBundlePriceRouter.post('/pricing/set', protect,  setCustomPrice);


export default resellerBundlePriceRouter;       