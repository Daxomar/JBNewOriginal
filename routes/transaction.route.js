import  { Router} from 'express';

import  {  authorizeRoles,  protect,   } from '../middlewares/auth.middleware.js'
import { 
    getTransactions, 
    bulkExportTransactions, 
    getBulkExportTransactions, 
    bulkMarkDelivered, 
    getAllBulkExports

 } from '../controllers/transaction.controller.js';





const transactionRouter = Router();


// Specific routes FIRST
transactionRouter.post('/bulk-export', protect, authorizeRoles("admin"),  bulkExportTransactions);
transactionRouter.get('/bulk-exports/list',  protect, authorizeRoles("admin"), getAllBulkExports);
transactionRouter.get('/bulk-export/:exportId', protect, authorizeRoles("admin"),  getBulkExportTransactions);
transactionRouter.patch('/bulk-export/:exportId/mark-delivered', protect, authorizeRoles("admin"), bulkMarkDelivered);

// Generic routes LAST
transactionRouter.get('/', protect, authorizeRoles("admin"), getTransactions);


export default transactionRouter;
