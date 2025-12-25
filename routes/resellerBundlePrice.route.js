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



// PUBLIC: Get bundles with reseller's custom prices (for customers)  I have two because one doesnt take any reseller code and uses the system code instead should humans decide to remove it from the url mhawhahaha
resellerBundlePriceRouter.get('/public', getBundlesByResellerCode);

resellerBundlePriceRouter.get('/public/:resellerCode', getBundlesByResellerCode);


// Get all bundles with reseller's custom pricing
resellerBundlePriceRouter.get('/pricing',protect, getResellerPricing);

// Set custom price for single bundle
resellerBundlePriceRouter.post('/pricing/set', protect,  setCustomPrice);


export default resellerBundlePriceRouter;       