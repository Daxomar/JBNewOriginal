import  { Router} from 'express';
import { createBundleInDb, getAllBundles } from '../controllers/bundle.controller.js';

const bundleRouter = Router();

//CREATE BUNDLE IN DB
bundleRouter.post('/createBundleInDb', createBundleInDb )

// GET BUNDLE TYPES FROM DB
bundleRouter.get('/getBundleFromDb', getAllBundles )

export default bundleRouter;






