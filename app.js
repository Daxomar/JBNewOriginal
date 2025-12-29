import express from 'express';
import cookieParser from 'cookie-parser';
import { PORT } from './config/env.js';
import cors from 'cors'

//ROUTERS
import userRouter from './routes/user.routes.js'
import authRouter from './routes/auth.routes.js';
import paymentRouter from './routes/payment.route.js';
import bundleRouter from './routes/bundle.route.js';
import orderRouter from './routes/order.route.js';
import commissionRouter from './routes/commission.route.js';
import payoutRouter from './routes/payout.route.js';
import transactionRouter from './routes/transaction.route.js';
import resellerBundlePriceRouter from './routes/resellerBundlePrice.route.js';

//DATABASE CONNECTION
import connectToDatabase from './database/mongodb.js';

//MIDDLEWARES
import errorMiddleware from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';



const app = express();

// Trust proxy for Render
app.set('trust proxy', true);

// CORS configuration - MUST be before other middlewares
const allowedOrigins = [
  "https://5d6b8b3e9de6.ngrok-free.app",
  "https://joy-bundle-frontend.vercel.app",
 " https://www.joydatabundle.com",
 "https://joydatabundle.com",
  "http://localhost:3000",
  "http://localhost:5000"
];


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Pass true, not the origin
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH",],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "ngrok-skip-browser-warning"

  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));






// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5000",
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     if (
//       allowedOrigins.includes(origin) ||
//       origin.includes("ngrok-free.app") // allow any NGROK tunnels
//     ) {
//       return callback(null, true);
//     }

//     console.log("CORS blocked origin:", origin);
//     callback(new Error(`Origin ${origin} not allowed by CORS`));
//   },

//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "Accept",
//     "Origin",
//     "ngrok-skip-browser-warning"
//   ],
//   exposedHeaders: ["Set-Cookie"],
//   optionsSuccessStatus: 200
// }));













// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5000",
//   "https://b942cc9a52e4.ngrok-free.app",
// "https://c53d2e6cbcf9.ngrok-free.app"

// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like Postman, mobile apps, etc.)
//     if (!origin) return callback(null, true);

//     // Allow localhost + any ngrok subdomain
//     if (allowedOrigins.includes(origin) || /https:\/\/[a-z0-9-]+\.ngrok-free\.app$/.test(origin)) {
//       callback(null, true);
//     } else {
//       console.log("CORS blocked origin:", origin);
//       callback(new Error(`Origin ${origin} not allowed by CORS`));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "Accept",
//     "Origin"
//   ],
//   exposedHeaders: ["Set-Cookie"],
//   optionsSuccessStatus: 200
// }));







// Other middlewares AFTER CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



// Apply Arcjet middleware to ALL routes EXCEPT webhook
app.use((req, res, next) => {
  // Skip Arcjet for Paystack webhook
  if (req.path === '/api/v1/payments/paystack/webhook') {
    return next();
  }
  
  // Apply Arcjet for all other routes
  arcjetMiddleware(req, res, next);
});




// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/bundles', bundleRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/commissions', commissionRouter);
app.use('/api/v1/payout', payoutRouter);
app.use('/api/v1/transaction', transactionRouter);
app.use('/api/v1/resellerBundlePrice', resellerBundlePriceRouter );



// Error middleware should be last
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send("Welcome to the dataBundle App Backend!");
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

console.log('Server is running on port 5000');

app.listen(PORT, async () => {
  console.log(`JoyDataBundle is running on  http://localhost:${PORT}`);
  await connectToDatabase();
}); 
