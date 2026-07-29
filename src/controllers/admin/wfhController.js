import WorkFromHome from "../../models/WorkFromHome.js";

export const getAllWFHRequests = async (req, res) => {
  try {
    const requests = await WorkFromHome.find()
      .populate(
        "employee",
        "employeeId firstName lastName"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveWFH = async (req, res) => {
  try {
    const request = await WorkFromHome.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "WFH request not found",
      });
    }

    request.status = "Approved";

    await request.save();

    res.json({
      success: true,
      message: "WFH request approved",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectWFH = async (req, res) => {
  try {
    const request = await WorkFromHome.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "WFH request not found",
      });
    }

    request.status = "Rejected";

    await request.save();

    res.json({
      success: true,
      message: "WFH request rejected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};