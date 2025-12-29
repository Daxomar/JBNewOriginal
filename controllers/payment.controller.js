import axios from 'axios';
import { createHmac } from 'crypto';
import User from '../models/user.model.js';
import Bundle from '../models/bundle.model.js'
import Transaction from '../models/transaction.model.js';
import ResellerBundlePrice from '../models/resellerBundlePrice.model.js';
// import { PAYSTACK_SECRET_KEY} from "../config/env.js";
import { processWebhookEvent  } from '../utils/paymentHelper.js';
import {getResellerBundlePrice} from '../utils/getResellerBundlePrice.js'


//CHANGE THIS TO YOUR ACTUAL PAYSTACK SECRET KEY IN PRODUCTION
const PAYSTACK_SECRET_KEY = "sk_test_b4ecf231f7a4b52f2c5f933b5f5584e1d8dc9321";  //my test key not real right now
if (!PAYSTACK_SECRET_KEY) {
    // Fail fast so developers know to set the env var
    throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
}


// Constants
const PAYSTACK_CHARGE_PERCENTAGE = 0.03; // 3%





const paystack = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    },
});

// Utility to create a simple unique reference (can be replaced with UUID)
function makeReference(prefix = 'ref') {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

/*
    Controller: initializePayment
    Expects JSON body: { email: string, amount: number, currency?: 'NGN'|'GHS'|... , metadata?: object, callback_url?: string }
    amount: number in main currency units (e.g., 1000 means ₦1000). This function will convert to kobo (multiply by 100)
*/
// export async function initializePayment(req, res) {
//     try {
//         const { email, amount, currency = 'GHS', metadata = {}, callback_url } = req.body || {};

//         if (!email || !amount || isNaN(amount) || amount <= 0) {
//             return res.status(400).json({ status: false, message: 'email and amount are required and amount must be > 0' });
//         }

//         // Paystack expects amount in kobo (for NGN) or the smallest currency unit
//         const payload = {
//             email,
//             amount: Math.round(Number(amount) * 100),
//             metadata,
//             currency,
//             reference: makeReference('pay'),
//         };
//         if (callback_url) payload.callback_url = callback_url;

//         const { data } = await paystack.post('/transaction/initialize', payload);
//         // data contains authorization_url, access_code, reference, etc.
//         return res.status(200).json(data);
//     } catch (err) {
//         const status = err.response?.status || 500;
//         const data = err.response?.data || { status: false, message: err.message };
//         return res.status(status).json(data);
//     }
// }



const SYSTEM_RESELLER_CODE = process.env.SYSTEM_RESELLER_CODE ; // Example system reseller code

export async function initializePayment(req, res) {
    try {

        //I will use req.params later when i have a frontend to pass reseller code
        // const {resellerCode} = req.params

        const { email, bundleId, phoneNumberReceivingData, resellerCode , callback_url } = req.body || {};

        
        if (!email || !bundleId || !phoneNumberReceivingData) {
            return res.status(400).json({
                status: false,
                message: "email, bundleId and Phone Number receiving data are required"
            });
        }

        // 1. Fetch bundle details from DB
        const bundle = await Bundle.findOne({ Bundle_id: bundleId });

        if (!bundle) {
            return res.status(404).json({
                status: false,
                message: "Bundle not found"
            });
        }



        // Check if bundle is active
        if (!bundle.isActive) {
            return res.status(400).json({
                status: false,
                message: "This bundle is currently unavailable"
            });
        }





        
       let reseller = null;



        if (resellerCode && resellerCode === SYSTEM_RESELLER_CODE) {
      return res.status(400).json({
        success: false,
        message: 'MotherFucker you cannot use the system reseller code here directly via the URL be smarter'
      });
    }
    
    // Now the FallBack happens when i want it to
    const codeToUse = resellerCode || SYSTEM_RESELLER_CODE;


    // Find reseller by code



     reseller = await User.findOne({ 
      resellerCode: codeToUse,
      role: 'user',
    //   ...(resellerCode && { isSystemAccount: { $ne: true } })
      // Assuming resellers have role 'user'
    //   isAccountVerified: true 
    });



      if(!reseller){
            return res.status(404).json({
                status:false,
                message:"Reseller not found, invalid reseller code"
            })
        }

   
    //    console.log("Reseller Code received:", resellerCode);
    //    if(resellerCode){
    //     reseller = await User.findOne({ 
    //         resellerCode,
    //         // role:'user',
    //         // isApproved: true
    //     })



      

    //    }

       //RSBP -- ResellerBundlePrice
      const RSBP = await getResellerBundlePrice (reseller._id, bundle._id)   // me picking up the actual reseller._id = "6322344..." and actual bundle id too as well bundle._id = "66663344..."
       


       //Commission Calculation Based on Reseller Rate
    //    const commissionAmount = bundle.JBSP * (reseller?.commissionRate || 0) / 100;
       const commissionAmount = RSBP.commission;

       const finalAmount = bundle.JBSP + commissionAmount + ((bundle.JBSP + commissionAmount) * PAYSTACK_CHARGE_PERCENTAGE) ;

       console.log("Commission Amount:", commissionAmount);
       console.log("Final Amount to charge customer:", finalAmount);


       //JB Profit Calculation 
       const JBProfit = bundle.JBSP - bundle.JBCP;
       console.log("JoyBundle Profit on this sale:", JBProfit);




        // 2. Build metadata (so I know exactly what bundle they bought)
        const metadata = {
            //bundle
            bundleId: bundle.Bundle_id,
            bundleName: bundle.name,
            bundleData: bundle.Data,
            network: bundle.network,
            price: finalAmount,

            ///delivery
            phoneNumberReceivingData: phoneNumberReceivingData,

            //reseller
            resellerCode: codeToUse || null,
            resellerId: reseller?._id?.toString() || null,
            resellerName : reseller?.name || null,
            resellerCommissionPercentage: reseller?.commissionRate || null,
            resellerProfit: commissionAmount || null
        };
        

 console.log(metadata)


      //making the reference more unique by adding JBpay
    const reference =  makeReference("JBpay")

      const transaction = await Transaction.create({
        email,
        bundleId: bundle._id,
        bundleIdName: bundle.Bundle_id,
        bundleName: bundle.name,
        resellerCode: codeToUse || null,
        baseCost: bundle.JBSP,
        amount: finalAmount,
        JBProfit: JBProfit,
        currency: 'GHS',
        reference,
        status: 'pending',
        metadata: metadata,
    })


        // 3. Convert price into minor currency unit (GHS → pesewas)
        const amountInPesewas = Math.round(Number(finalAmount) * 100);

        // 4. Prepare Paystack payload
        const payload = {
            email,
            amount: amountInPesewas,
            currency: "GHS",
            metadata,
            transactionId: transaction._id.toString(),
            reference: reference
        };


    //    if (callback_url){
    //     payload.callback_url = `${callback_url}?reference=${reference}`
    //    }


        //  commented this out
        //This automatically appends the reference to the callback url paystack does that naturally for us haha 
        if (callback_url) payload.callback_url = callback_url;

        // 5. Initialize payment via Paystack
        const { data } = await paystack.post('/transaction/initialize', payload);
        
        return res.status(200).json({
            status: true,
            message: "Payment initialized",
            data,
            

        });

    } catch (err) {
        console.error(err);
        const status = err.response?.status || 500;
        const data = err.response?.data || { status: false, message: err.message };
        return res.status(status).json(data);
    }
}



/*
    Controller: verifyPayment
    Query or params: reference (string)
    Example: GET /verify?reference=xxxxx or GET /verify/:reference
*/
export async function verifyPayment(req, res) {
    try {
        const reference = (req.query.reference || req.params.reference || (req.body && req.body.reference));
        if (!reference) {
            return res.status(400).json({ status: false, message: 'reference is required' });
        }

        const { data } = await paystack.get(`/transaction/verify/${encodeURIComponent(reference)}`);
        console.log(data)
        // data contains status, message, data (transaction object)
        return res.status(200).json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const data = err.response?.data || { status: false, message: err.message };
        return res.status(status).json(data);
    }
}

/*
    Controller: handleWebhook
    Paystack posts to your webhook endpoint. To verify signature you must compute HMAC SHA512 of raw body using your PAYSTACK_SECRET_KEY.
    NOTE: Express must be configured to provide raw body (e.g., using a raw body middleware) and attached to req.rawBody.
    Example middleware setup (outside this file):
        app.use('/webhook', express.json({
            verify: (req, res, buf) => { req.rawBody = buf }
        }));
*/


// // Separate async function for processing and Creating Transaction in DB
// async function processWebhookEvent(event) {
//     const { reference, status, channel, metadata } = event.data;

//     // Find the pending transaction
//     const transaction = await Transaction.findOne({ reference });
    
//     if (!transaction) {
//         console.error('Transaction not found for reference:', reference);
//         return;
//     }

//     // Prevent duplicate processing
//     if (transaction.status === 'success' || transaction.status === 'failed') {
//         console.log('Transaction already processed:', reference);
//         return;
//     }

//     // Handle successful charges
//     if (event.event === 'charge.success') {
//         transaction.status = 'success';
//         transaction.channel = channel;
//         transaction.provider_response = {
//             gateway_response: event.data.gateway_response,
//             paid_at: event.data.paid_at,
//             ip_address: event.data.ip_address
//         };
        
//         await transaction.save();

//         console.log('Transaction completed successfully:', reference);
//     }
    
//     // Handle failed charges
//     else if (event.event === 'charge.failed') {
//         transaction.status = 'failed';
//         transaction.provider_response = {
//             reason: event.data.gateway_response,
//             failed_at: event.data.paid_at || new Date()
//         };
        
//         await transaction.save();
        
//         console.log('Transaction failed:', reference);
//     }
    
//     // Log other events but don't process
//     else {
//         console.log('Ignoring event:', event.event);
//     }
// }

export async function handleWebhook(req, res) {
    try {
        const signature = req.headers['x-paystack-signature'];
        if (!signature) {
            return res.status(400).send('Missing signature');
        }

        const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
        const computed = createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  



        if (computed !== signature) {
            return res.status(401).send('Invalid signature');
        }

        // At this point the payload is verified. You can handle events like charge.success
        const event = req.body;
        // Minimal example: log and return 200
        // TODO: replace with your business logic (update DB, fulfill order, etc.)
        console.log('Paystack webhook received:', event.event, event.data?.reference);
        console.log("full webhook data:", event);
        
        //I reply back to paystack quickly first
         res.status(200).json({ status: true});

        // external Utility function to process webhook asynchronously 
        processWebhookEvent(event).catch(err => {
            console.error('Async webhook processing error:', err);
        })
        
        return;


    } catch (err) {
        console.error('Webhook handler error', err);
        return res.status(500).json({ status: false, message: 'server error' });
    }
}









