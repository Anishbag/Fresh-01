import Advance from "../../models/Advance.js";

// Admin sob request dackte pabe
export const getAllAdvances = async (req, res) => {
  try {
    const advances = await Advance.find()
      .populate({
        path: "employee",
        select: "employeeId fullName department role profileImage",
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: advances.length,
      advances,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const approveAdvance = async (req, res) => {
  try {
    const advance = await Advance.findById(req.params.id);

    if (!advance) {
      return res.status(404).json({
        success: false,
        message: "Advance request not found",
      });
    }

    
    if (advance.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Advance request already approved",
      });
    }

    advance.status = "Approved";
    advance.adminRemark = "";

    await advance.save();

    res.status(200).json({
      success: true,
      message: "Advance request approved successfully",
      advance,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const rejectAdvance = async (req, res) => {
  try {
    const { remark } = req.body;

    
    if (!remark || remark.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection remark is required",
      });
    }

    const advance = await Advance.findById(req.params.id);

    if (!advance) {
      return res.status(404).json({
        success: false,
        message: "Advance request not found",
      });
    }

    
    if (advance.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Advance request already rejected",
      });
    }

    advance.status = "Rejected";
    advance.adminRemark = remark.trim();

    await advance.save();

    res.status(200).json({
      success: true,
      message: "Advance request rejected successfully",
      advance,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};