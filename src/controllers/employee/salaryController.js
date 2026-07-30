import SalarySlip from "../../models/SalarySlip.js";
import Employee from "../../models/Employee.js";

// ==========================================
// My Salary Slips
// ==========================================
export const mySalarySlips = async (req, res) => {
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

    const salaries = await SalarySlip.find({
      employee: employee._id,
    }).sort({
      year: -1,
      month: -1,
    });

    res.status(200).json({
      success: true,
      total: salaries.length,
      salaries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// View Salary Slip
// ==========================================
export const viewSalarySlip = async (req, res) => {
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

    const salary = await SalarySlip.findOne({
      _id: req.params.id,
      employee: employee._id,
    }).populate("employee", "employeeId fullName department");

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }

    res.status(200).json({
      success: true,
      salary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
