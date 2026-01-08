import Bundle from '../models/bundle.model.js'



export const createBundleInDb = async (req, res, next) => {
  const { Bundle_id, Data, name, JBCP, JBSP, network, size, Duration,  recommendedRange } = req.body;

  try {
   

    // 1. Validate required fields
    if (!Bundle_id || !Data || !name || !JBCP || !JBSP|| !network || !Duration) {
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
      JBCP,
      JBSP,
      size,
      network,
      Duration,
      recommendedRange
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
    const bundles = await Bundle.find().sort({ network: 1, JBCP: 1 });
    
        

    const activeCount = bundles.filter(b => b.isActive).length;
    const inactiveCount = bundles.filter(b => !b.isActive).length;

    res.status(200).json({
      success: true,
      message: "Bundles fetched successfully",
      activeCount,
      inactiveCount,
      data: bundles
    });

  } catch (error) {
    next(error);
  }
};





