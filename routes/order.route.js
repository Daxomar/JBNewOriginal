import  { Router} from 'express';


import { trackOrdersByPhone, trackOrderById } from '../controllers/order.controller.js';
import { generalLimiter, lenientLimiter } from "../middlewares/ratelimiter.middleware.js";


const orderRouter = Router();


// Public endpoint - no auth needed

orderRouter.get('/track', generalLimiter, trackOrdersByPhone);
// orderRouter.get('/track/:transactionId', lenientLimiter, trackOrderById);


export default orderRouter;
