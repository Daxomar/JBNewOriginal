import Order from "../models/order.model.js";
import Bundle from "../models/bundle.model.js";

export const createOrder = async (req, res, next) => {
  try {
    const { buyerPhone, bundleId, paymentMethod } = req.body;

    if (!buyerPhone || !bundleId) {
      return res.status(400).json({
        success: false,
        message: "buyerPhone and bundleId are required",
      });
    }

    // 1. Find the bundle
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    // 2. Auto-populate the amount using bundle.price
    const amount = bundle.price;

    // 3. Create the order
    const newOrder = await Order.create({
      buyerPhone,
      bundle: bundle._id,
      amount,
      paymentMethod: paymentMethod || "momo",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    next(error);
  }
};
