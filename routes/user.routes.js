import  { Router} from 'express';

import  { authorize,  authorizeRoles,  protect,  userAuthCookie,   } from '../middlewares/auth.middleware.js'
import { creatAccountByAdmin, getReseller, getResellers, resellerLink, getResellerCommission} from '../controllers/user.controller.js'

const userRouter = Router();

//GET /users - Get all users
//GET /users/:id - Get a user by ID
//POST /users - Create a new user
//PUT /users/:id - Update a user by ID
//DELETE /users/:id - Delete a user by ID



//ADMIN ENDPOINT
userRouter.get('/', protect, authorizeRoles("admin"),  getResellers);    // I have to later add the admin authorization middleWare over here too later for strict acces


//USER ENDPOINT
userRouter.get('/me', protect, getReseller);  

//CUSTOMER ENDPOINT PUBLIC 
userRouter.get('/public/commission/:resellerCode', getResellerCommission);


//RESSELLER LINK ENDPOINT
userRouter.get('/reseller-link', resellerLink)

//ADMIN GET RESELLER ENDPOINT
userRouter.get('/:id', protect, authorizeRoles("admin"), getReseller);  //I added the right authorization middleware over here



//ADMIN ENDPOINT
userRouter.post('/', protect, authorizeRoles("admin"), creatAccountByAdmin);


//ADMIN ENDPOINT
// userRouter.put('/:id', (req, res)=> res.send({title: 'Update user by ID endpoint is working!'}));
// userRouter.put('/:id',protect,  updateUserByAdmin);   // Will define this today


//ADMIN ENDPOINT
userRouter.delete('/:id', (req, res)=> res.send({title: 'Delete user by ID endpoint is working!'}));


export default userRouter;
