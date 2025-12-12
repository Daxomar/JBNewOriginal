import  { Router} from 'express';


import { trackOrdersByPhone, trackOrderById } from '../controllers/order.controller.js';



const orderRouter = Router();


// Public endpoint - no auth needed
orderRouter.get('/track', trackOrdersByPhone);
orderRouter.get('/track/:transactionId', trackOrderById);


export default orderRouter;
