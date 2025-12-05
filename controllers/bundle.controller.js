import Bundle from '../models/bundle.model.js'



export const createBundleInDb = async (req, res, next) => {
  const { Bundle_id, Data, name, price, network, Duration } = req.body;

  try {
   

    // 1. Validate required fields
    if (!Bundle_id || !Data || !name || !price || !network || !Duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required bundle details"
      });
    }

    // 2. Check if bundle already exists
    const existingBundle = await Bundle.findOne({ Bundle_id });
    if (existingBundle) {
      return res.status(409).json({
        success: false,
        message: "Bundle with this ID already exists"
      });
    }

    // 4. Create bundle in DB
    const newBundle = await Bundle.create({
      Bundle_id,
      Data,
      name,
      price,
      network,
      Duration,
    });

    // 5. Respond
    res.status(201).json({
      success: true,
      message: "Bundle created successfully",
      data: newBundle
    });

  } catch (error) {
    next(error);
  }
};






export const getAllBundles = async (req, res, next) => {
  try {

    // Fetch all bundles from DB
    const bundles = await Bundle.find();

    res.status(200).json({
      success: true,
      message: "Bundles fetched successfully",
      data: bundles
    });

  } catch (error) {
    next(error);
  }
};
