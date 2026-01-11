import  { Router} from 'express';
import { changeActiveStatus, createBundleInDb, getAllBundles, updateBundle } from '../controllers/bundle.controller.js';
import { strictLimiter, generalLimiter,lenientLimiter, strictLimiterIpBased} from "../middlewares/ratelimiter.middleware.js";
import {  authorizeRoles, protect,  } from '../middlewares/auth.middleware.js'



const bundleRouter = Router();

//CREATE BUNDLE IN DB

bundleRouter.post('/createBundleInDb',protect, authorizeRoles("admin"), generalLimiter , createBundleInDb )

bundleRouter.patch('/:bundleId/toggle-status',protect,authorizeRoles("admin"), lenientLimiter , changeActiveStatus )

bundleRouter.patch('/:bundleId/update',protect,authorizeRoles("admin"),  lenientLimiter , updateBundle )


// // GET BUNDLE TYPES FROM DB
bundleRouter.get('/getBundleFromDb', generalLimiter, getAllBundles )
// bundleRouter.get('/getBundleFromDb',strictLimiterIpBased , getAllBundles )
// bundleRouter.get('/getBundleFromDb',lenientLimiter, getAllBundles )

export default bundleRouter;






