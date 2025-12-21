// routes/payoutRoutes.js
import  { Router} from 'express';
import {
  requestPayout,
  getMyPayouts,
  getAvailableBalance,
  cancelPayout,
  getAllPayouts,
  processPayout,
} from '../controllers/payout.controller.js';
import  {  authorizeRoles,  protect,  } from '../middlewares/auth.middleware.js'

const payoutRouter = Router();



/* ============================
   USER ROUTES (AUTHENTICATED)
   ============================ */

// Request a payout
payoutRouter.post('/request', protect, requestPayout);

// Get my payouts history
payoutRouter.get('/my-payouts', protect, getMyPayouts);

// Get available balance (NEEDS PROTECTION!)
payoutRouter.get('/balance', protect, getAvailableBalance);

// Cancel my payout (future feature)
// payoutRouter.patch('/:payoutId/cancel', protect, cancelPayout);

/* ============================
   ADMIN ROUTES
   ============================ */

// Get all payouts (admin dashboard)
payoutRouter.get('/all', protect, authorizeRoles("admin"), getAllPayouts);

// Process/approve a payout (admin action)
payoutRouter.patch('/:payoutId/process', protect, authorizeRoles("admin"), processPayout);

export default payoutRouter;