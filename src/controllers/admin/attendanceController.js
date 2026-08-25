import Attendance from "../../models/Attendance.js";

export const getAllAttendance = async (req, res) => {
  try {
    const {date,employeeId,late,early,} = req.query;

    const query = {};

    
    if (date) {
      const selectedDate = new Date(date);

      selectedDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(selectedDate);

      nextDate.setDate(nextDate.getDate() + 1);

      query.date = {
        $gte: selectedDate,
        $lt: nextDate,
      };
    }
    
    if (employeeId) {
      query.employee = employeeId;
    }
    
    if (late === "true") {
      query.isLateCheckIn = true;
    }
    
    if (early === "true") {
      query.isEarlyCheckOut = true;
    }

    const attendance = await Attendance.find(query)
      .populate(
        "employee",
        "employeeId fullName email department designation"
      )
      .sort({date: -1,createdAt: -1,});

    res.status(200).json({
      success: true,
      total: attendance.length,
      attendance,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const adminOverrideAttendance = async (req, res) => {
  try {
    const { adminApprovedMinutes, adminRemark } = req.body;

  
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

 
    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Employee has not checked in.",
      });
    }

   
    if (
      adminApprovedMinutes === undefined ||
      adminApprovedMinutes === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin approved minutes are required.",
      });
    }

    const approvedMinutes = Number(adminApprovedMinutes);

    if (Number.isNaN(approvedMinutes)) {
      return res.status(400).json({
        success: false,
        message: "Admin approved minutes must be a valid number.",
      });
    }

   
    if (approvedMinutes < 0 || approvedMinutes > 540) {
      return res.status(400).json({
        success: false,
        message: "Approved minutes must be between 0 and 540.",
      });
    }

  
    if (!adminRemark || adminRemark.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Admin remark is required.",
      });
    }

  
    attendance.adminApproved = true;

    attendance.adminApprovedMinutes = approvedMinutes;

    attendance.adminRemark = adminRemark.trim();

    attendance.adminApprovedBy = req.user._id;

    attendance.adminApprovedAt = new Date();

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Attendance override applied successfully.",
      attendance,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};