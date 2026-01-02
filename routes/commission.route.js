import  { Router} from 'express';

import { 
    getMyCommissions, 
    getCommissionStats, 
    getCommissionsByMonth 
} from '../controllers/commission.controller.js';


import  {  protect,  } from '../middlewares/auth.middleware.js'
import { strictLimiter, generalLimiter } from "../middlewares/ratelimiter.middleware.js";

const commissionRouter = Router();





// Get my commissions (with pagination) //testing purpose only

commissionRouter.get('/my-commissions', protect, generalLimiter, getMyCommissions);

// production use this resellerID should be gotten from the JWT token
// commissionRouter.get('/my-commissions', getMyCommissions);

// Get commission statistics
// commissionRouter.get('/stats', getCommissionStats);

// Get commissions by month
// commissionRouter.get('/by-month', getCommissionsByMonth);

export default commissionRouter;