import Transaction from '../models/transaction.model.js';

// Utility function (conceptual, would live in a separate file)
const normalizePhoneNumber = (phone) => {
    if (typeof phone !== 'string' || !phone.trim()) return null;
    // Example: remove all non-digit characters except for a leading plus sign
    return phone.replace(/[^0-9+]/g, '');
};


export const trackOrdersByPhone = async (req, res) => {
    // Default and parse pagination parameters
   
    const { phoneNumber } = req.query;

    try {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        // 1. Strict Validation Check
        if (!normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: "A valid phone number is required for tracking."
            });
        }

         //Pagination setup
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 10;
         const skip = (page - 1) * limit;

        console.log("Tracking orders for phone number:", normalizedPhone); 

        // Query by nested field
       const query = { 
        'metadata.phoneNumberReceivingData': normalizedPhone,
        status: 'success' 
     };


         // SELECT ONLY NEEDED FIELDS
    const selectFields = [
      '_id',
      'reference',
      'bundleName',
      'amount',
      'status',
      'deliveryStatus', // NEW - for tracking
      'deliveredAt',    // NEW - when delivered
      'failureReason',  // NEW - if failed
      'createdAt',
      'metadata.bundleData',
      'metadata.network',
      'metadata.phoneNumberReceivingData'
    ].join(' ');



        // 2. Parallel Query Execution
        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .sort({ createdAt: -1 }) // Latest first
                .skip(skip)
                .limit(limit)
                .select(selectFields) // Exclude version key
                .lean(),
                
            Transaction.countDocuments(query)
        ]);



        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this phone number."
            });
        }


        const totalPages = Math.ceil(total / limit);
        const hasMore = skip + transactions.length < total;
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        return res.status(200).json({
            success: true,
            data: {
                orders: transactions,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalPages,
                    totalOrders: total,
                    hasMore: hasMore,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    prevPage: hasPrevPage ? page - 1 : null,
                }
            }
        });
    } catch (error) {
        // 3. Verbose internal logging
        console.error("Track orders error (Phone:", phoneNumber, "):", error);
        return res.status(500).json({
            success: false,
            message: "Failed to track orders due to a server error."
        });
    }
};





export const trackOrderById = async (req, res) => {
    try {
        const { transactionId } = req.params;

        // Note: Mongoose's findById will automatically handle validation for ObjectId structure
        const transaction = await Transaction.findById(transactionId)
            .select('-__v')
            .lean();

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        // 3. Verbose internal logging
        console.error("Track order by ID error (ID:", req.params.transactionId, "):", error);
        // Handle invalid MongoDB ID format explicitly if desired, otherwise 500 is fine
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ success: false, message: "Order not found." });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to track order due to a server error."
        });
    }
};