import Reimbursement from "../../models/Reimbursement.js";
import Employee from "../../models/Employee.js";

// Employee request korbe reimbu...
export const requestReimbursement = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    
    if (!amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "Amount and reason are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    
    const employee = await Employee.findOne({
      userId: req.user._id,
      status: "Active",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    
    const pendingRequest = await Reimbursement.findOne({
      employee: employee._id,
      status: "Pending",
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending reimbursement request",
      });
    }

    
    const reimbursement = await Reimbursement.create({
      employee: employee._id,
      amount: Number(amount),
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Reimbursement request submitted successfully",
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


// Employee nijer  history dackte pabe
export const getMyReimbursements = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
      status: "Active",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const reimbursements = await Reimbursement.find({
      employee: employee._id,
    }).sort({
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