import  { Router} from 'express';

import  {  authorizeRoles,  protect,   } from '../middlewares/auth.middleware.js'
import { getTransactions } from '../controllers/transaction.controller.js';





const transactionRouter = Router();




//AN ADMIN ROUTE SO IT NEEDS PROTECTION
transactionRouter.get('/', protect, authorizeRoles("admin"), getTransactions);



export default transactionRouter;
