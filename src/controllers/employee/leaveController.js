import Employee from "../../models/Employee.js";
import Leave from "../../models/Leave.js";

export const applyLeave = async (req, res) => {
  try {
    // const employee = await Employee.findOne({
    //   userId: req.user._id,
    //   isDeleted: false,
    // });

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

    const { leaveType, fromDate, toDate, reason } = req.body;

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      fromDate,
      toDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const myLeaveHistory = async (req, res) => {
  try {
    // const employee = await Employee.findOne({
    //   userId: req.user._id,
    //   isDeleted: false,
    // });

      const employee = await Employee.findOne({
      userId: req.user._id,
      status: "Active",
    });

    const leaves = await Leave.find({
      employee: employee._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
