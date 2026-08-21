import Employee from "../../models/Employee.js";
import Leave from "../../models/Leave.js";
import Attendance from "../../models/Attendance.js";

export const applyLeave = async (req, res) => {
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

    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const allowedLeaveTypes = ["Casual", "Sick", "Normal"];

    if (!allowedLeaveTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // from date not greater than To date
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than To date.",
      });
    }

    //  already 1k ta leave thakle r neba jabe nah

    const existingLeave = await Leave.findOne({
      employee: employee._id,

      status: {
        $in: ["Pending", "Approved"],
      },

      fromDate: {
        $lte: endDate,
      },

      toDate: {
        $gte: startDate,
      },
    });

    if (existingLeave) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request for the selected dates.",
      });
    }

    //  attendance thakle leave hobe nah same date a

    const attendance = await Attendance.findOne({
      employee: employee._id,

      date: {
        $gte: startDate,
        $lte: endDate,
      },

      status: {
        $ne: "Leave",
      },
    });

    if (attendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already exists for one or more selected dates.",
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      fromDate: startDate,
      toDate: endDate,
      reason: reason.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const myLeaveHistory = async (req, res) => {
  try {
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
