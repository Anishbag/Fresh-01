import DailyWorkStatus from "../../models/DailyWorkStatus.js";
import Employee from "../../models/Employee.js";

export const saveDailyWork = async (req, res) => {
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

    const { project, workDate, plan, endOfDayStatus } = req.body;

    const report = await DailyWorkStatus.create({
      employee: employee._id,
      project,
      workDate,
      plan,
      endOfDayStatus,
    });

    res.status(201).json({
      success: true,
      message: "Daily work saved successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyReports = async (req, res) => {
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





    const reports = await DailyWorkStatus.find({
      employee: employee._id,
    })
      .populate("project", "projectName")
      .sort({
        workDate: -1,
      });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
