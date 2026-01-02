// controllers/payoutController.js
import Payout from '../models/payout.model.js';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Constants
const PAYOUT_CHARGE_PERCENTAGE = 1.5; // 1.5%
const MIN_PAYOUT_AMOUNT = 10; // Minimum GH₵10

// Helper function to calculate available balance
const calculateAvailableBalance = (user) => {
    const totalEarned = user.totalCommissionEarned || 0;
    const totalPaidOut = user.totalCommissionPaidOut || 0;
    return totalEarned - totalPaidOut;
};


// Helper function to get the actual pending payout 
const getPendingPayoutAmount = async (user) => {
    const pendingPayout = await Payout.findOne({
        reseller: user.resellerId,
        status: { $in: ['pending', 'processing'] },
    }).session(session);

    return pendingPayout.netAmount || 0
}


// Helper function to calculate payout charge
const calculatePayoutCharge = (amount) => {
    return (amount * PAYOUT_CHARGE_PERCENTAGE) / 100;
};











// Request payout
export const requestPayout = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { id } = req.user
        const resellerId = id  //MANUALLY TESTING THIS NOW
        const { amount, network, phoneNumber, accountName, password } = req.body;

        // Validation
        if (!amount || !network || !phoneNumber || !accountName || !password) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'All fields are required: amount, network, phoneNumber, accountName, password',
            });
        }

        // Validate amount
        if (amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0',
            });
        }

        if (amount < MIN_PAYOUT_AMOUNT) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Minimum payout amount is GH₵${MIN_PAYOUT_AMOUNT}`,
            });
        }

        // Validate network
        const validNetworks = ['MTN', 'Vodafone', 'AirtelTigo'];
        if (!validNetworks.includes(network)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Invalid network. Choose from: MTN, Vodafone, AirtelTigo',
            });
        }

        // Validate phone number format (Ghana)
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format. Use format: 0XXXXXXXXX',
            });
        }

        // Fetch user
        const user = await User.findById(resellerId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await session.abortTransaction();
            return res.status(401).json({
                success: false,
                message: 'Invalid password',
            });
        }

        // Calculate available balance
        const availableBalance = calculateAvailableBalance(user);


        

        if (availableBalance <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance. No funds available for withdrawal.',
            });
        }

        if (amount > availableBalance) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Available: GH₵${availableBalance.toFixed(2)}`,
            });
        }

        // Check for pending payouts
        const pendingPayout = await Payout.findOne({
            reseller: resellerId,
            status: { $in: ['pending', 'processing'] },
        }).session(session);

        if (pendingPayout) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'You already have a pending payout request. Please wait for it to be processed.',
            });
        }

        // Calculate charges
        const payoutCharge = calculatePayoutCharge(amount);
        const netAmount = amount - payoutCharge;

        // Create payout request
        const payout = await Payout.create(
            [
                {
                    reseller: resellerId,
                    amount,
                    payoutCharge,
                    netAmount,
                    network,
                    phoneNumber,
                    accountName,
                    status: 'pending',
                    requestedAt: new Date(),
                },
            ],
            { session }
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: 'Payout request submitted successfully. It will be processed within 24-48 hours.',
            data: {
                payout: payout[0],
                breakdown: {
                    requestedAmount: amount,
                    processingFee: payoutCharge,
                    youWillReceive: netAmount,
                },
            },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Payout request error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process payout request',
            error: error.message,
        });
    }
};

// Get user's payout history
export const getMyPayouts = async (req, res) => {
    try {

        const { id } = req.user
        const resellerId = id 

      

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const payouts = await Payout.find({ reseller: resellerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Payout.countDocuments({ reseller: resellerId });

        // Get available balance
        const user = await User.findById(resellerId).select('totalCommissionEarned totalCommissionPaidOut');
    

        const availableBalance = calculateAvailableBalance(user);


        // Get pending payout amount
        const pendingPayouts = await Payout.find({
            reseller: resellerId,
            status: { $in: ['pending', 'processing'] },
        });

        const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.netAmount, 0);


        res.json({
            success: true,
            data: {
                payouts,
                availableBalance,
                pendingAmount,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Get payouts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payouts',
            error: error.message,
        });
    }
};

// Get available balance
export const getAvailableBalance = async (req, res) => {
    try {
        const resellerId = req.user.id;

        const user = await User.findById(resellerId).select('totalCommissionEarned totalCommissionPaidOut');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const availableBalance = calculateAvailableBalance(user);

        // Get pending payout amount
        const pendingPayouts = await Payout.find({
            reseller: resellerId,
            status: { $in: ['pending', 'processing'] },
        });

        const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);

        res.json({
            success: true,
            data: {
                totalEarned: user.totalCommissionEarned,
                totalPaidOut: user.totalCommissionPaidOut,
                availableBalance,
                pendingPayouts: pendingAmount,
                withdrawableBalance: availableBalance - pendingAmount,
            },
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch balance',
            error: error.message,
        });
    }
};

// Cancel payout (only if pending)
export const cancelPayout = async (req, res) => {
    try {
        const resellerId = req.user.id;
        const { payoutId } = req.params;

        const payout = await Payout.findOne({
            _id: payoutId,
            reseller: resellerId,
        });

        if (!payout) {
            return res.status(404).json({
                success: false,
                message: 'Payout request not found',
            });
        }

        if (payout.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel payout with status: ${payout.status}`,
            });
        }

        payout.status = 'cancelled';
        await payout.save();

        res.json({
            success: true,
            message: 'Payout request cancelled successfully',
            data: payout,
        });
    } catch (error) {
        console.error('Cancel payout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel payout',
            error: error.message,
        });
    }
};









// ADMIN: Get all payout requests
export const getAllPayouts = async (req, res) => {


    //Still have to check that user is admin over here as well too
    try {


        //TOTALS OF ALL STATUS 
        const totals = await Payout.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$netAmount" } // optional if you want total money
                },
            },
        ]);


        const statusTotals = {
            pending: 0,
            completed: 0,
            rejected: 0,
        };


        totals.forEach(item => {
            statusTotals[item._id] = item.count;
            // or item.totalAmount if you want amounts
        });

        console.log(statusTotals);


        const { status, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) {
            query.status = status;
        }

        const payouts = await Payout.find(query)
            .populate('reseller', 'name email phoneNumber resellerCode')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Payout.countDocuments(query);

        res.json({
            success: true,
            data: {
                payouts,
                statusTotals,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Get all payouts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payouts',
            error: error.message,
        });
    }
};







// ADMIN: Process payout (approve/reject)     --- completed
export const processPayout = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();


    try {
         const { id } = req.user
        const adminId = id   //Manually Testing right now 
        const { payoutId } = req.params;
        const { action, rejectionReason, transactionReference } = req.body;


        // Validate action
        if (!['approve', 'reject'].includes(action)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Action must be either "approve" or "reject"',
            });
        }

        if (action === 'reject' && !rejectionReason) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required',
            });
        }

        // Find payout
        const payout = await Payout.findById(payoutId).session(session);

        if (!payout) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Payout request not found',
            });
        }

        if (payout.status !== 'pending') {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Payout already ${payout.status}`,
            });
        }

        if (action === 'approve') {
            // Update payout status
            payout.status = 'completed';
            payout.processedAt = new Date();
            payout.processedBy = adminId;
            payout.transactionReference = transactionReference;

            // Update user's totalCommissionPaidOut
            const user = await User.findById(payout.reseller).session(session);
            if (!user) {
                await session.abortTransaction();
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            user.totalCommissionPaidOut += payout.amount;
            await user.save({ session });

            await payout.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.json({
                success: true,
                message: 'Payout approved and processed successfully',
                data: payout,
            });
        } else {
            // Reject payout
            payout.status = 'rejected';
            payout.processedAt = new Date();
            payout.processedBy = adminId;
            payout.rejectionReason = rejectionReason;

            await payout.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.json({
                success: true,
                message: 'Payout rejected',
                data: payout,
            });
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Process payout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payout',
            error: error.message,
        });
    }
};