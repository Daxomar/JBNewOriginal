import  { Router} from 'express';

import  {  authorizeRoles,  protect,   } from '../middlewares/auth.middleware.js'
import { 
    getTransactions, 
    bulkExportTransactions, 
    getBulkExportTransactions, 
    bulkMarkDelivered, 
    getAllBulkExports

 } from '../controllers/transaction.controller.js';

 import { generalLimiter, lenientLimiter, strictLimiter } from "../middlewares/ratelimiter.middleware.js";





const transactionRouter = Router();


transactionRouter.post('/bulk-export', protect, authorizeRoles("admin"), generalLimiter, bulkExportTransactions);

// Get list of bulk exports - GENERAL (read-only, admin)
transactionRouter.get('/bulk-exports/list', protect, authorizeRoles("admin"), generalLimiter, getAllBulkExports);

// Get specific bulk export - GENERAL (read-only, admin)
transactionRouter.get('/bulk-export/:exportId', protect, authorizeRoles("admin"), generalLimiter, getBulkExportTransactions);

// Mark as delivered - STRICT (write operation)
transactionRouter.patch('/bulk-export/:exportId/mark-delivered', protect, authorizeRoles("admin"), lenientLimiter, bulkMarkDelivered);

// Get all transactions - GENERAL (read-only, admin)
transactionRouter.get('/', protect, authorizeRoles("admin"), lenientLimiter, getTransactions);

export default transactionRouter;
