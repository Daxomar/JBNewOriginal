
import axios from "axios";
import Transaction from "../../models/transaction.model.js";
import BulkExport from "../../models/bulkexport.model.js";
import SubmittedNumber from "../../models/submittedNumber.model.js"; 

const BOSSU_API_BASEURL = process.env.BOSSU_API_BASEURL || "https://bossudatahub.com";
const BOSSU_API_KEY = process.env.BOSSU_API_KEY;
const BOSSU_API_TIMEOUT = Number(process.env.BOSSU_API_TIMEOUT) || 15000;
 
const bossuClient = axios.create({
  baseURL: BOSSU_API_BASEURL,
  // timeout: BOSSU_API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": BOSSU_API_KEY,
  },
});
 
const BOSSU_ENDPOINT = "/api.php";
const MTN_PREFIXES = ["024", "025", "053", "054", "055", "059"];

/** 0546635325 | 233546635325 | +233 54 663 5325 | 546635325  ->  0546635325 */
function normalizePhone(input) {
  if (!input) return null;
 
  let digits = String(input).replace(/\D/g, "");
 
  if (digits.startsWith("233")) digits = "0" + digits.slice(3);
  else if (digits.length === 9) digits = "0" + digits;
 
  return /^0\d{9}$/.test(digits) ? digits : null;
}
 
function isMtn(phone) {
  return MTN_PREFIXES.includes(phone.slice(0, 3));
}
export const verifyNumberHandler = async (req, res) => {
  const rawPhone = req.body?.phone || req.query?.phone;
 
  try {
    console.log("🔍 Verify number request:", rawPhone);
 
    const phone = normalizePhone(rawPhone);
 
    if (!phone) {
      console.warn("❌ Invalid phone:", rawPhone);
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit Ghana number, e.g. 0546635325",
      });
    }
 
    // Non-MTN doesn't need beneficiary approval — no API call needed.
    if (!isMtn(phone)) {
      console.log(`ℹ️ ${phone} is not MTN — verification not applicable`);
      return res.status(200).json({
        success: true,
        data: {
          phone,
          applicable: false,
          verified: true,
          message: "Beneficiary verification only applies to MTN numbers.",
        },
      });
    }
 
    const { data: body } = await bossuClient.post(BOSSU_ENDPOINT, {
      action: "verify_number",
      phone: phone,
    });
 
    const result = body?.data?.results?.[0] || {};
    const verified = Boolean(result.verified);
 
    console.log(`✅ ${phone} verified=${verified}`);
 
    return res.status(200).json({
      success: true,
      data: {
        phone,
        applicable: true,
        verified,
        message:
          result.message ||
          (verified
            ? "This number is on the verified beneficiary list."
            : "This number is not on the verified beneficiary list yet."),
      },
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Verification service timed out"
        : "Could not verify this number right now");
 
    console.error(`❌ Error verifying ${rawPhone}:`, message);
 
    return res.status(status).json({ success: false, message });
  }
};


export const submitNumberHandler = async (req, res) => {
  const rawPhone = req.body?.phone;
  const resellerCode = (req.body?.resellerCode || "").trim();
  const note = req.body?.note || "Joy Bundle customer";
 
  try {
    console.log(`📤 Submit number: ${rawPhone} (reseller: ${resellerCode || "direct"})`);
 
    const phone = normalizePhone(rawPhone);
 
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit Ghana number",
      });
    }
 
    if (!isMtn(phone)) {
      return res.status(400).json({
        success: false,
        message: "Only MTN numbers need beneficiary approval",
      });
    }
 
    const { data: body } = await bossuClient.post(BOSSU_ENDPOINT, {
      action: "submit_number",
      phones: [phone],
      note,
    });
 
    const entry = body?.data?.results?.[0] || {};
    const record = entry.record || {};
    const alreadyVerified = (body?.data?.skipped_already_verified || 0) > 0;
 
    // Save with the reseller code so they can message this customer later.
    await SubmittedNumber.findOneAndUpdate(
      { phone, resellerCode },
      {
        $set: {
          phone,
          resellerCode,
          network: record.network || "mtn",
          status: alreadyVerified ? "verified" : "submitted",
          providerRecordId: record.id || null,
          providerMessage: record.provider_message || null,
          note,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
 
    console.log(`✅ ${phone} recorded (alreadyVerified: ${alreadyVerified})`);
 
    return res.status(200).json({
      success: true,
      data: {
        phone,
        alreadyVerified,
        message: alreadyVerified
          ? "Good news — this number is already verified. You can buy data for it now."
          : "Submitted. We'll add this number to the beneficiary list and let you know once it's ready.",
      },
    });
  } catch (error) {
    // Double-click on the button racing the unique index.
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        data: {
          phone: normalizePhone(rawPhone),
          alreadyVerified: false,
          message: "This number is already queued for approval.",
        },
      });
    }
 
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || "Could not submit this number right now";
 
    console.error(`❌ Error submitting ${rawPhone}:`, message);
 
    return res.status(status).json({ success: false, message });
  }
};

export const bossuWebhookHandler = async (req, res) => {
  try {
    console.log('📩 Bossu webhook received');
    console.log('Raw payload:', JSON.stringify(req.body, null, 2));
 
    const { event, data } = req.body;
 
    // ✅ Check for nested data structure
    if (!data) {
      console.warn('❌ Bossu webhook missing data field');
      console.warn('Expected format: { event: "order.status_updated", data: {...} }');
      console.warn('Received:', req.body);
      return res.status(400).json({ 
        success: false, 
        error: 'Missing data field. Expected nested structure: { event, data }' 
      });
    }
 
    // Extract fields from data
    const { reference, status, order_id, network, package_name, recipient_phone, price, updated_at } = data;
 
    // Validate required fields
    if (!reference || !status) {
      console.warn('❌ Bossu webhook missing required fields in data:');
      console.warn('   reference:', reference);
      console.warn('   status:', status);
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: reference, status' 
      });
    }
 
    console.log(`✅ Valid webhook received`);
    console.log(`   Event: ${event}`);
    console.log(`   Reference: ${reference}`);
    console.log(`   Status: ${status}`);
    console.log(`   Order ID: ${order_id}`);
 
    // Route to appropriate handler
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return handleOrderCompleted({
          reference,
          order_id,
          status,
          network,
          package_name,
          recipient_phone,
          price,
          updated_at
        }, res);
      
      case 'failed':
        return handleOrderFailed({
          reference,
          order_id,
          status,
          network,
          package_name
        }, res);
      
      case 'cancelled':
        return handleOrderCancelled({
          reference,
          order_id,
          status
        }, res);
      
      case 'pending':
      case 'processing':
        return handleOrderProcessing({
          reference,
          order_id,
          status
        }, res);
      
      default:
        console.warn(`⚠️ Unknown status from Bossu: ${status}`);
        return res.status(200).json({ 
          received: true, 
          warning: `Unknown status: ${status}` 
        });
    }
  } catch (error) {
    console.error('❌ Error in Bossu webhook handler:', error);
    return res.status(200).json({ 
      received: true, 
      error: error.message 
    });
  }
};
 
async function handleOrderCompleted(data, res) {
  const { reference, order_id, status, network, package_name, recipient_phone, price, updated_at } = data;
 
  try {
    console.log(`🔄 Processing completed order: ${reference}`);
 
    const transaction = await Transaction.findOne({
      $or: [
        { reference },
        { 'bossuResponse.order_id': order_id }
      ]
    });
 
    if (!transaction) {
      console.warn(`⚠️ No transaction found for reference: ${reference}`);
      return res.status(200).json({
        received: true,
        message: 'Order completed but no matching transaction found'
      });
    }
 
    const updateResult = await Transaction.updateOne(
      { _id: transaction._id },
      {
        $set: {
          deliveryStatus: 'delivered', // Use the status from Bossu
          'bossuResponse.status': status,
          'bossuResponse.updated_at': updated_at || new Date(),
          updatedAt: new Date()
        }
      }
    );

    console.log("UPDATEDDDD", updateResult)
 
    console.log(`✅ Order completed and transaction updated`);
    console.log(`   Transaction ID: ${transaction._id}`);
    console.log(`   Reference: ${reference}`);
    console.log(`   Network: ${network}, Package: ${package_name}`);
    console.log(`   Recipient: ${recipient_phone}, Price: ${price}`);
 
    return res.status(200).json({
      success: true,
      message: 'Order marked as completed',
      transactionId: transaction._id,
      reference,
      status: 'delivered'
    });
 
  } catch (error) {
    console.error(`❌ Error handling completed order ${reference}:`, error);
    return res.status(200).json({ 
      received: true, 
      error: error.message 
    });
  }
}
 
async function handleOrderFailed(data, res) {
  const { reference, order_id, status, network, package_name } = data;
 
  try {
    console.log(`🔄 Processing failed order: ${reference}`);
 
    const transaction = await Transaction.findOne({
      $or: [
        { reference },
        { 'bossuResponse.order_id': order_id }
      ]
    });
 
    if (!transaction) {
      console.warn(`⚠️ No transaction found for failed order: ${reference}`);
      return res.status(200).json({
        received: true,
        message: 'Order failed but no matching transaction found'
      });
    }
 
    await Transaction.updateOne(
      { _id: transaction._id },
      {
        $set: {
          deliveryStatus: 'failed',
          'bossuResponse.status': 'failed',
          'bossuResponse.updated_at': new Date(),
          updatedAt: new Date()
        }
      }
    );
 
    console.log(`❌ Order failed: ${reference} - ${network} ${package_name}`);
 
    return res.status(200).json({
      success: true,
      message: 'Order marked as failed',
      transactionId: transaction._id,
      reference,
      status: 'failed'
    });
 
  } catch (error) {
    console.error(`❌ Error handling failed order ${reference}:`, error);
    return res.status(200).json({ 
      received: true, 
      error: error.message 
    });
  }
}
 
async function handleOrderCancelled(data, res) {
  const { reference, order_id, status } = data;
 
  try {
    console.log(`🔄 Processing cancelled order: ${reference}`);
 
    const transaction = await Transaction.findOne({
      $or: [
        { reference },
        { 'bossuResponse.order_id': order_id }
      ]
    });
 
    if (!transaction) {
      console.warn(`⚠️ No transaction found for cancelled order: ${reference}`);
      return res.status(200).json({
        received: true,
        message: 'Order cancelled but no matching transaction found'
      });
    }
 
    await Transaction.updateOne(
      { _id: transaction._id },
      {
        $set: {
          deliveryStatus: 'failed',
          'bossuResponse.status': 'cancelled',
          'bossuResponse.updated_at': new Date(),
          updatedAt: new Date()
        }
      }
    );
 
    console.log(`⚠️ Order cancelled: ${reference}`);
 
    return res.status(200).json({
      success: true,
      message: 'Order marked as cancelled',
      transactionId: transaction._id,
      reference,
      status: 'cancelled'
    });
 
  } catch (error) {
    console.error(`❌ Error handling cancelled order ${reference}:`, error);
    return res.status(200).json({ 
      received: true, 
      error: error.message 
    });
  }
}
 
async function handleOrderProcessing(data, res) {
  const { reference, order_id, status } = data;
 
  try {
    console.log(`⏳ Order processing: ${reference} - Status: ${status}`);
 
    const transaction = await Transaction.findOne({
      $or: [
        { reference },
        { 'bossuResponse.order_id': order_id }
      ]
    });
 
    if (!transaction) {
      return res.status(200).json({
        received: true,
        message: 'Processing order but no matching transaction found'
      });
    }
 
    await Transaction.updateOne(
      { _id: transaction._id },
      {
        $set: {
          deliveryStatus: status || 'processing',
          'bossuResponse.status': status,
          'bossuResponse.updated_at': new Date()
        }
      }
    );
 
    console.log(`⏳ Order ${reference} status: ${status}`);
 
    return res.status(200).json({
      received: true,
      message: `Order is ${status}`,
      reference,
      status
    });
 
  } catch (error) {
    console.error(`❌ Error handling processing order ${reference}:`, error);
    return res.status(200).json({ 
      received: true, 
      error: error.message 
    });
  }
}
 



export default {
  bossuWebhookHandler,
  verifyNumberHandler,
  submitNumberHandler,
};