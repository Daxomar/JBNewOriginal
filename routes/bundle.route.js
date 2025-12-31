import  { Router} from 'express';
import { createBundleInDb, getAllBundles } from '../controllers/bundle.controller.js';
import { strictLimiter, generalLimiter,lenientLimiter, strictLimiterIpBased} from "../middlewares/ratelimiter.middleware.js";



const bundleRouter = Router();

//CREATE BUNDLE IN DB

bundleRouter.post('/createBundleInDb',generalLimiter , createBundleInDb )

// // GET BUNDLE TYPES FROM DB
bundleRouter.get('/getBundleFromDb', generalLimiter, getAllBundles )
// bundleRouter.get('/getBundleFromDb',strictLimiterIpBased , getAllBundles )
// bundleRouter.get('/getBundleFromDb',lenientLimiter, getAllBundles )

export default bundleRouter;






