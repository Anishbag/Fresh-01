import Reimbursement from "../../models/Reimbursement.js";

// Admin sob reimbu request dackte pabe
export const getAllReimbursements = async (req, res) => {
  try {
    const reimbursements = await Reimbursement.find()
      .populate({
        path: "employee",
        select: "employeeId fullName department role profileImage",
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: reimbursements.length,
      reimbursements,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const approveReimbursement = async (req, res) => {
  try {
    const reimbursement = await Reimbursement.findById(
      req.params.id
    );

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: "Reimbursement request not found",
      });
    }

       if (reimbursement.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Reimbursement already approved",
      });
    }

   
    reimbursement.status = "Approved";
    reimbursement.adminRemark = "";

    await reimbursement.save();

    res.status(200).json({
      success: true,
      message: "Reimbursement approved successfully",
      reimbursement,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const rejectReimbursement = async (req, res) => {
  try {
    const { remark } = req.body;

    
    if (!remark || remark.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection remark is required",
      });
    }

    const reimbursement = await Reimbursement.findById(
      req.params.id
    );

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: "Reimbursement request not found",
      });
    }

    
    if (reimbursement.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Reimbursement already rejected",
      });
    }

    reimbursement.status = "Rejected";
    reimbursement.adminRemark = remark.trim();

    await reimbursement.save();

    res.status(200).json({
      success: true,
      message: "Reimbursement rejected successfully",
      reimbursement,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};