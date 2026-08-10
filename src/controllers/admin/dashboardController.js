import Employee from "../../models/Employee.js";
import Attendance from "../../models/Attendance.js";
import Project from "../../models/Project.js";
import Leave from "../../models/Leave.js";
import WorkFromHome from "../../models/WorkFromHome.js";
import DailyWorkStatus from "../../models/DailyWorkStatus.js";


// Admin Dashboard

export const adminDashboard = async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Employees
    // const totalEmployees = await Employee.countDocuments({
    //   isDeleted: false,
    //   isActive: true,
    // });



    const totalEmployees = await Employee.countDocuments({
      status: "Active",
    });




    // Active Projects
    const activeProjects = await Project.countDocuments({
      status: {
        $ne: "Completed",
      },
    });

    // Present Today
    const presentToday = await Attendance.countDocuments({
      date: today,
      checkIn: {
        $ne: null,
      },
    });

    // Pending Leave
    const pendingLeave = await Leave.countDocuments({
      status: "Pending",
    });

    // Pending WFH
    const pendingWFH = await WorkFromHome.countDocuments({
      status: "Pending",
    });

    // Recent Daily Work
    const recentWorkStatus = await DailyWorkStatus.find()
      .populate("employee", "fullName employeeId")
      .populate("project", "projectName")
      .sort({
        workDate: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,

      cards: {
        totalEmployees,
        activeProjects,
        presentToday,

        pendingApprovals:
          pendingLeave + pendingWFH,

        pendingLeave,

        pendingWFH,
      },

      recentWorkStatus,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};