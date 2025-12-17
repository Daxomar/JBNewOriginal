import Commission from '../models/commission.model.js';
import User from '../models/user.model.js';
import Bundle from '../models/bundle.model.js'
import Transaction from '../models/transaction.model.js';

// Get commissions for logged-in reseller
export const getMyCommissions = async (req, res) => {
    try {
      // For testing: get resellerId from query parameter
        // For production: use req.user.id from JWT
        const resellerId = req.query.resellerId;

       
           if (!resellerId) {
            return res.status(400).json({
                success: false,
                message: 'Reseller ID is required'
            });
        }

        
        // Query parameters for filtering
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get commissions
        const commissions = await Commission.find({ 
            reseller: resellerId 
        })
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean();
        
        // Get details for each commission
        const commissionsWithDetails = await Promise.all(
            commissions.map(async (commission) => {
                // Get transaction details
                const transaction = await Transaction.findById(commission.transaction)
                    .select('reference amount status createdAt')
                    .lean();
                
                // Get bundle details
                const bundle = await Bundle.findById(commission.bundle)
                    .select('name')
                    .lean();
                
                // Return formatted data
                return {
                    id: commission._id,
                    date: commission.createdAt,
                    orderId: transaction?.reference || 'N/A',
                    bundle: bundle?.name || 'Unknown Bundle',
                    orderAmount: transaction?.amount || 0,
                    commission: commission.amount,
                    percentage: commission.percentage,
                    status: commission.status,
                    month: commission.month
                };
            })
        );
        
        // Get total count for pagination
        const totalCommissions = await Commission.countDocuments({ 
            reseller: resellerId 
        });
        
       ;
     
        
        res.json({
            success: true,
            commissions: commissionsWithDetails,
            pagination: {
                page,
                limit,
                total: totalCommissions,
                pages: Math.ceil(totalCommissions / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching commissions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch commissions',
            error: error.message 
        });
    }
};







// Get commission statistics
export const getCommissionStats = async (req, res) => {
    try {
        const resellerId = req.user.id;
        
        const stats = await Commission.aggregate([
            { $match: { reseller: new mongoose.Types.ObjectId(resellerId) } },
            {
                $group: {
                    _id: null,
                    totalEarned: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'earned'] }, '$amount', 0] 
                        } 
                    },
                    totalPaid: { 
                        $sum: { 
                            $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] 
                        } 
                    },
                    totalCommissions: { $sum: 1 }
                }
            }
        ]);
        
        const result = stats[0] || {
            totalEarned: 0,
            totalPaid: 0,
            totalCommissions: 0
        };
        
        res.json({
            success: true,
            stats: result
        });
        
    } catch (error) {
        console.error('Error fetching commission stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch statistics' 
        });
    }
};

// Get commissions by month
export const getCommissionsByMonth = async (req, res) => {
    try {
        const resellerId = req.user.id;
        const { month } = req.query; // Format: "2025-12"
        
        const query = { reseller: resellerId };
        if (month) {
            query.month = month;
        }
        
        const commissions = await Commission.find(query)
            .sort({ createdAt: -1 })
            .lean();
        
        // Get details for each commission
        const commissionsWithDetails = await Promise.all(
            commissions.map(async (commission) => {
                const transaction = await Transaction.findById(commission.transaction)
                    .select('reference amount')
                    .lean();
                
                const bundle = await Bundle.findById(commission.bundle)
                    .select('name')
                    .lean();
                
                return {
                    ...commission,
                    orderId: transaction?.reference || 'N/A',
                    bundleName: bundle?.name || 'Unknown Bundle',
                    orderAmount: transaction?.amount || 0
                };
            })
        );
        
        const total = commissions.reduce((sum, c) => sum + c.amount, 0);
        
        res.json({
            success: true,
            month: month || 'all',
            commissions: commissionsWithDetails,
            total,
            count: commissions.length
        });
        
    } catch (error) {
        console.error('Error fetching monthly commissions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch monthly commissions' 
        });
    }
};