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
import { strictLimiterIpBased, generalLimiter, strictLimiter } from "../middlewares/ratelimiter.middleware.js";


const resellerBundlePriceRouter = Router();



// Public endpoints - no auth needed, IP-based general limit
resellerBundlePriceRouter.get('/public', generalLimiter, getBundlesByResellerCode);

resellerBundlePriceRouter.get('/public/:resellerCode', generalLimiter, getBundlesByResellerCode);

// Get all bundles with reseller's custom pricing - authenticated, general limit (read-only)
resellerBundlePriceRouter.get('/pricing', protect, generalLimiter, getResellerPricing);

// Set custom price for single bundle - authenticated, strict limit (write operation)
resellerBundlePriceRouter.post('/pricing/set', protect, generalLimiter, setCustomPrice);


export default resellerBundlePriceRouter;       