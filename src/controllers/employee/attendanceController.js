import Attendance from "../../models/Attendance.js";
import Employee from "../../models/Employee.js";
import { isCompanyHoliday } from "../../utils/calendarUtils.js";
import { getIndiaMinutes } from "../../utils/timeUtils.js";

const getToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

export const checkIn = async (req, res) => {
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

    const today = getToday();

    if (isCompanyHoliday(today)) {
      return res.status(400).json({
        success: false,
        message: "Today is a company holiday. Check-in is not allowed.",
      });
    }

    const already = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    if (already) {
      return res.status(400).json({
        success: false,
        message: "You have already checked in today.",
      });
    }

    // const checkInTime = new Date();

    // const lateTime = new Date(checkInTime);

    // lateTime.setHours(10, 20, 0, 0);

    // const isLateCheckIn = checkInTime > lateTime;
    const checkInTime = new Date();

    const currentIndiaMinutes = getIndiaMinutes(checkInTime);

    const lateLimitMinutes = 10 * 60 + 20;

    const isLateCheckIn = currentIndiaMinutes > lateLimitMinutes;

    const { mode, checkInRemark } = req.body;

    if (isLateCheckIn && !checkInRemark?.trim()) {
      return res.status(400).json({
        success: false,
        message: "You are checking in late. Please provide a remark.",
      });
    }

    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      checkIn: checkInTime,

      workingMinutes: 0,
      paidMinutes: 0,
      workingHours: 0,

      status: "Present",

      mode: mode || "Office",

      isLateCheckIn,
      checkInRemark: isLateCheckIn ? checkInRemark.trim() : "",

      isEarlyCheckOut: false,
      checkOutRemark: "",

      adminReviewed: false,
      adminRemark: "",
    });

    res.status(201).json({
      success: true,

      message: isLateCheckIn
        ? "Checked in successfully. Late check-in recorded."
        : "Checked in successfully.",

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

export const checkOut = async (req, res) => {
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

    const today = getToday();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Please check in first.",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today.",
      });
    }

    const checkOutTime = new Date();

    const totalMilliseconds = checkOutTime - attendance.checkIn;

    const workingMinutes = Math.floor(totalMilliseconds / (1000 * 60));

    const paidMinutes = Math.min(workingMinutes, 540);

    const workingHours = Number((workingMinutes / 60).toFixed(2));

    // const earlyCheckoutTime = new Date(checkOutTime);

    // earlyCheckoutTime.setHours(18, 45, 0, 0);

    // const isEarlyCheckOut =
    //   checkOutTime < earlyCheckoutTime;
    const currentIndiaMinutes = getIndiaMinutes(checkOutTime);

        const earlyCheckoutLimitMinutes = 18 * 60 + 45;

    const isEarlyCheckOut = currentIndiaMinutes < earlyCheckoutLimitMinutes;

    const { checkOutRemark } = req.body;

    if (isEarlyCheckOut && !checkOutRemark?.trim()) {
      return res.status(400).json({
        success: false,
        message: "You are checking out early. Please provide a remark.",
      });
    }

    // save attendance

    attendance.checkOut = checkOutTime;

    attendance.workingMinutes = workingMinutes;

    attendance.paidMinutes = paidMinutes;

    attendance.workingHours = workingHours;

    attendance.isEarlyCheckOut = isEarlyCheckOut;

    attendance.checkOutRemark = isEarlyCheckOut ? checkOutRemark.trim() : "";

    await attendance.save();

    res.status(200).json({
      success: true,

      message: isEarlyCheckOut
        ? "Checked out successfully. Early checkout recorded."
        : "Checked out successfully.",

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

export const attendanceHistory = async (req, res) => {
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

    const history = await Attendance.find({
      employee: employee._id,
    }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      total: history.length,
      history,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
