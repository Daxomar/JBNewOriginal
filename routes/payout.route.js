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


const payoutRouter = Router();



//TESTING ROUTES WITHOUT AUTH YET
payoutRouter.post('/request', requestPayout);
payoutRouter.get('/my-payouts',  getMyPayouts);
payoutRouter.get('/balance', getAvailableBalance);
payoutRouter.patch('/:payoutId/cancel',  cancelPayout);


// User routes with auth 
// payoutRouter.post('/request', authenticateToken, requestPayout);
// payoutRouter.get('/my-payouts', authenticateToken, getMyPayouts);
// payoutRouter.get('/balance', authenticateToken, getAvailableBalance);
// payoutRouter.patch('/:payoutId/cancel', authenticateToken, cancelPayout);



//TESTING ADMIN ROUTE WITHOUT AUTH YET
payoutRouter.get('/all', getAllPayouts);
payoutRouter.patch('/:payoutId/process', processPayout);

// Admin routes
// payoutRouter.get('/all', authenticateToken, isAdmin, getAllPayouts);
// payoutRouter.patch('/:payoutId/process', authenticateToken, isAdmin, processPayout);

export default payoutRouter;