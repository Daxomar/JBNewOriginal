import  { Router} from 'express';

import { getTransactions } from '../controllers/transaction.controller.js';





const transactionRouter = Router();




//AN ADMIN ROUTE SO IT NEEDS PROTECTION
transactionRouter.get('/', getTransactions);



export default transactionRouter;
