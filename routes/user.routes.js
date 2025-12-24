import  { Router} from 'express';

import  {  authorizeRoles,  protect,   } from '../middlewares/auth.middleware.js'
import { creatAccountByAdmin, getReseller, getResellers, resellerLink, getResellerCommission, inviteReseller,approveReseller,rejectReseller} from '../controllers/user.controller.js'

const userRouter = Router();

// //GET /users - Get all users
// //GET /users/:id - Get a user by ID
// //POST /users - Create a new user
// //PUT /users/:id - Update a user by ID
// //DELETE /users/:id - Delete a user by ID



// //ADMIN ENDPOINT
// // userRouter.get('/', protect, authorizeRoles("admin"),  getResellers);    // I have to later add the admin authorization middleWare over here too later for strict acces
// userRouter.get('/',  getResellers);    // I have to later add the admin authorization middleWare over here too later for strict acces

// // ADMIN ENDPOINT
// userRouter.post('/invite', inviteReseller)


// //USER ENDPOINT
// // userRouter.get('/me', protect, getReseller);  

// //TEST USER ENDPOINT RESELLER
// userRouter.get('/me', getReseller);  

// //CUSTOMER ENDPOINT PUBLIC 
// userRouter.get('/public/commission/:resellerCode', getResellerCommission);


// //RESSELLER LINK ENDPOINT --
// userRouter.get('/reseller-link', resellerLink)

// //ADMIN GET RESELLER ENDPOINT
// userRouter.get('/:id', protect, authorizeRoles("admin"), getReseller);  //I added the right authorization middleware over here



// //ADMIN ENDPOINT
// userRouter.post('/', protect, authorizeRoles("admin"), creatAccountByAdmin);


// //ADMIN ENDPOINT
// // userRouter.put('/:id', (req, res)=> res.send({title: 'Update user by ID endpoint is working!'}));
// // userRouter.put('/:id',protect,  updateUserByAdmin);   // Will define this today


// //ADMIN ENDPOINT
// userRouter.delete('/:id', (req, res)=> res.send({title: 'Delete user by ID endpoint is working!'}));






//CUSTOMER ENDPOINT PUBLIC 
userRouter.get('/public/commission/:resellerCode', getResellerCommission);




/* ============================
   ADMIN ROUTES (STRICT)
   ============================ */

// Create reseller account by admin
userRouter.post(
  '/',
  protect,
  authorizeRoles("admin"),
  creatAccountByAdmin
);

// Get all resellers (admin dashboard)
userRouter.get(
  '/',
  protect,
  authorizeRoles("admin"),
  getResellers
);

// Invite reseller (admin action)
userRouter.post(
  '/invite',
  protect,
  authorizeRoles("admin"),
  inviteReseller
);

/* ============================
   RESELLER ROUTES (AUTHENTICATED)
   ============================ */

// Get logged-in reseller profile
userRouter.get(
  '/me',
  protect,
  getReseller
);

// Generate reseller referral link
userRouter.get(
  '/reseller-link',
  protect,
  resellerLink
);

/* ============================
   ADMIN ROUTES CONTINUED
   ============================ */

// Get reseller by ID (admin only) - MUST come after specific routes
userRouter.get(
  '/:id',
  protect,
  authorizeRoles("admin"),
  getReseller
);

userRouter.patch(
  '/:userId/approve',
  protect,
  authorizeRoles('admin'),
  approveReseller
);

// Reject user (Admin only)
userRouter.patch(
  '/:userId/reject',
  protect,
  authorizeRoles('admin'),
  rejectReseller
);

// Toggle approval status (Admin only) - Alternative single endpoint
// userRouter.patch(
//   '/:userId/toggle-approval',
//   protect,
//   authorizeRoles('admin'),
//   toggleUserApproval
// );



// Update reseller by ID (admin only – future)
// userRouter.put(
//   '/:id',
//   protect,
//   authorizeRoles("admin"),
//   updateUserByAdmin
// );

// Delete reseller by ID (admin only – future)
// userRouter.delete(
//   '/:id',
//   protect,
//   authorizeRoles("admin"),
//   deleteUserByAdmin
// );









export default userRouter;
