
import  { Router} from 'express';
import { initializePayment,verifyPayment ,handleWebhook  } from '../controllers/payment.controller.js';

const paymentRouter = Router();

// Initialize a transaction
paymentRouter.post('/paystack/initialize', initializePayment  );


// Verify a transaction by reference
paymentRouter.get('/paystack/verify/:reference', verifyPayment );

// Webhook endpoint
paymentRouter.post('/paystack/webhook', handleWebhook );

export default paymentRouter
;