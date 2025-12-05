import mongoose from "mongoose";

const CommissionSchema = new mongoose.Schema({
    reseller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
                

     resellerName:{
        type: String,
        required: true,
     },






    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: true,
        unique: true,  
        // prevents giving commission twice for same tx
    },



    bundle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bundle",
        required: true,
    },



    amount: {
        type: Number,
        required: true, // Commission amount in GHS
    },

    percentage: {
        type: Number,
        required: true, // e.g. 5, 10, 20
    },

    status: {
        type: String,
        enum: ["pending", "earned", "paid"],
        default: "earned",
        // “earned” = after payment success
        // “paid”   = after cashout
    },

    month: {
        type: String,
        required: true,
        // For reporting: e.g. "2025-12"
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
});




const Commission = mongoose.model("Commission", CommissionSchema);

export default Commission;