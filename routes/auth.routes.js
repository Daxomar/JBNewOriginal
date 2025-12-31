import { Router} from 'express';
import { signUp, signIn, signOut, sendVerifyOtp, verifyEmail, isAuthenicated, sendResetOtp, resetPassword, verifyresetOtp,  refresh } from '../controllers/auth.controller.js';
// import arcjetMiddleware from '../middlewares/arcjet.middleware.js';
import {userAuthCookie, protect} from '../middlewares/auth.middleware.js';
import { strictLimiter, strictLimiterIpBased, generalLimiter,lenientLimiter} from "../middlewares/ratelimiter.middleware.js";


const authRouter = Router();

authRouter.post('/sign-up', strictLimiterIpBased, signUp);
authRouter.post('/sign-in', strictLimiterIpBased, signIn);
authRouter.post('/sign-out', protect, signOut);
authRouter.post('/send-verify-otp', protect, strictLimiter, sendVerifyOtp);
authRouter.post('/verify-account', protect, strictLimiter, verifyEmail);
authRouter.get('/is-auth', protect, lenientLimiter, isAuthenicated);
authRouter.post('/send-reset-otp', strictLimiterIpBased, sendResetOtp);
authRouter.post('/verify-reset-otp', strictLimiterIpBased, verifyresetOtp);
authRouter.post('/reset-password', strictLimiterIpBased, resetPassword);
authRouter.post('/refresh', lenientLimiter, refresh);







export default authRouter;