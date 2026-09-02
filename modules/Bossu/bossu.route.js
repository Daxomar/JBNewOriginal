import  { Router} from 'express';
import { bossuWebhookHandler, submitNumberHandler, verifyNumberHandler } from './bossuapi.controller.js';

const  bossuRouter = Router();

bossuRouter.post('/bossu-webhook', bossuWebhookHandler)
bossuRouter.post('/verify-number', verifyNumberHandler)
bossuRouter.post('/submit-number', submitNumberHandler)

export default bossuRouter;       
