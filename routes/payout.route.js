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
import { strictLimiter, generalLimiter } from "../middlewares/ratelimiter.middleware.js";
const payoutRouter = Router();



/* ============================
   USER ROUTES (AUTHENTICATED)
   ============================ */

// Request payout - STRICT (authenticated, sensitive financial operation)
payoutRouter.post('/request', protect, strictLimiter, requestPayout);

// Get my payouts history - GENERAL (read-only, authenticated)
payoutRouter.get('/my-payouts', protect, generalLimiter, getMyPayouts);

// Get available balance - GENERAL (read-only, authenticated)
payoutRouter.get('/balance', protect, generalLimiter, getAvailableBalance);

// Cancel my payout - STRICT (sensitive operation)
// payoutRouter.patch('/:payoutId/cancel', protect, strictLimiter, cancelPayout);

/* ============================
   ADMIN ROUTES
   ============================ */

// Get all payouts - GENERAL (read-only, admin only)
payoutRouter.get('/all', protect, authorizeRoles("admin"), generalLimiter, getAllPayouts);

// Process/approve a payout - STRICT (sensitive admin action)
payoutRouter.patch('/:payoutId/process', protect, authorizeRoles("admin"), strictLimiter, processPayout);

export default payoutRouter;