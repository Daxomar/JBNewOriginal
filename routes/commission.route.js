import  { Router} from 'express';

import { 
    getMyCommissions, 
    getCommissionStats, 
    getCommissionsByMonth 
} from '../controllers/commission.controller.js';

const commissionRouter = Router();





// Get my commissions (with pagination) //testing purpose only
commissionRouter.get('/my-commissions', getMyCommissions);

// production use this resellerID should be gotten from the JWT token
// commissionRouter.get('/my-commissions', getMyCommissions);

// Get commission statistics
commissionRouter.get('/stats', getCommissionStats);

// Get commissions by month
commissionRouter.get('/by-month', getCommissionsByMonth);

export default commissionRouter;