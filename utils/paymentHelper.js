import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';
import Commission from '../models/commission.model.js';

// Separate async function for processing and Creating Transaction in DB
export async function processWebhookEvent(event) {
    const { reference, status, channel, metadata } = event.data;

    // Find the pending transaction
    const transaction = await Transaction.findOne({ reference });
    
    if (!transaction) {
        console.error('Transaction not found for reference:', reference);
        return;
    }

    // Prevent duplicate processing
    if (transaction.status === 'success' || transaction.status === 'failed') {
        console.log('Transaction already processed:', reference);
        return;
    }

   // Handle successful charges
if (event.event === 'charge.success') {
    transaction.status = status;
    transaction.channel = channel;
    transaction.provider_response = {
        gateway_response: event.data.gateway_response,
        paid_at: event.data.paid_at,
        ip_address: event.data.ip_address
    };
    
    await transaction.save();

    // ✅ Commission logic - only after payment confirmed
    if (transaction.resellerCode && transaction.metadata?.resellerProfit) {
        const commissionAmount = transaction.metadata.resellerProfit;
        
        try {
            // 1. Create Commission record
            await Commission.create({
                reseller: transaction.metadata?.resellerId,
                resellerName: transaction.metadata?.resellerName,
              
                transaction: transaction._id,
                bundle: transaction.bundleId,
                amount: commissionAmount,
                percentage: transaction.metadata?.resellerCommissionPercentage,
                status: "earned",
                month: new Date().toISOString().slice(0, 7) // "2025-12"
            });
            
            // 2. Update reseller's total commission (accumulative)
            await User.findByIdAndUpdate(
                transaction.metadata?.resellerId,
                { 
                    $inc: { 
                        totalCommissionEarned: commissionAmount,
                        totalSales: 1
                    }
                }
            );
            
            console.log(`✅ Commission: GHS ${commissionAmount} credited to ${transaction.metadata?.resellerName}`);
            
        } catch (error) {
            console.error('❌ Error processing commission:', error);
            // Don't throw - transaction already succeeded
            // Log for manual review/reconciliation
        }
    }

    console.log('Transaction completed successfully:', reference);
}

// Handle failed charges
else if (event.event === 'charge.failed') {
    transaction.status = status;
    transaction.provider_response = {
        reason: event.data.gateway_response,
        failed_at: event.data.paid_at || new Date()
    };
    
    await transaction.save();
    
    // ❌ NO commission for failed payments
    console.log('Transaction failed:', reference);
}

// Log other events but don't process
else {
    console.log('Ignoring event:', event.event);
}
}