import Employee from "../../models/Employee.js";
import Attendance from "../../models/Attendance.js";
import Project from "../../models/Project.js";
import Leave from "../../models/Leave.js";
import WorkFromHome from "../../models/WorkFromHome.js";
import SalarySlip from "../../models/SalarySlip.js";
import DailyWorkStatus from "../../models/DailyWorkStatus.js";

// ==========================================
// Employee Dashboard
// ==========================================
export const employeeDashboard = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
      isDeleted: false,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Dashboard Cards
    const myProjects = await Project.countDocuments({
      assignedEmployees: employee._id,
    });

    const pendingLeaves = await Leave.countDocuments({
      employee: employee._id,
      status: "Pending",
    });

    const pendingWFH = await WorkFromHome.countDocuments({
      employee: employee._id,
      status: "Pending",
    });

    const salarySlips = await SalarySlip.countDocuments({
      employee: employee._id,
    });

    // Today's Attendance
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    // Today's Work Plan
    const todayPlan = await DailyWorkStatus.findOne({
      employee: employee._id,
      workDate: today,
    }).populate("project", "projectName");

    res.status(200).json({
      success: true,

      cards: {
        myProjects,
        pendingLeaves,
        pendingWFH,
        salarySlips,
      },

      attendance,

      todayPlan,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};