import SalaryConfig from "../../models/SalaryConfig.js";
import SalarySlip from "../../models/SalarySlip.js";
import Employee from "../../models/Employee.js";

// =========================================
// Generate Salary For All Employees
// =========================================
export const generateSalary = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required",
      });
    }

    const employees = await Employee.find({
      isDeleted: false,
      isActive: true,
    });

    const configs = await SalaryConfig.find();

    if (!configs.length) {
      return res.status(400).json({
        success: false,
        message: "Salary configuration not found",
      });
    }

    let generated = 0;
    let skipped = 0;

    for (const employee of employees) {
      const alreadyGenerated = await SalarySlip.findOne({
        employee: employee._id,
        month,
        year,
      });

      if (alreadyGenerated) {
        skipped++;
        continue;
      }

      const grossSalary = employee.salary || 0;

      let earnings = [];
      let deductions = [];

      let totalEarnings = 0;
      let totalDeductions = 0;

      for (const config of configs) {
        let amount = 0;

        if (config.mode === "% of gross") {
          amount = (grossSalary * config.value) / 100;
        } else {
          amount = config.value;
        }

        amount = Number(amount.toFixed(2));

        if (config.type === "Earning") {
          earnings.push({
            label: config.label,
            amount,
          });

          totalEarnings += amount;
        } else {
          deductions.push({
            label: config.label,
            amount,
          });

          totalDeductions += amount;
        }
      }

      const netSalary = grossSalary + totalEarnings - totalDeductions;

      await SalarySlip.create({
        employee: employee._id,
        month,
        year,
        grossSalary,
        earnings,
        deductions,
        totalEarnings,
        totalDeductions,
        netSalary,
      });

      generated++;
    }

    res.status(201).json({
      success: true,
      message: "Salary generated successfully",
      generated,
      skipped,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// Get All Salary Slips
// =========================================
export const getSalarySlips = async (req, res) => {
  try {
    const { month, year } = req.query;

    const filter = {};

    if (month) filter.month = month;
    if (year) filter.year = year;

    const salaries = await SalarySlip.find(filter)
      .populate(
        "employee",
        "employeeId firstName lastName department salary"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
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

// =========================================
// Get Single Salary Slip
// =========================================
export const getSalarySlip = async (req, res) => {
  try {
    const salary = await SalarySlip.findById(req.params.id)
      .populate("employee");

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }

    res.json({
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

// =========================================
// Export Salary
// =========================================
export const exportSalary = async (req, res) => {
  try {

    const salaries = await SalarySlip.find()
      .populate(
        "employee",
        "employeeId firstName lastName department"
      );

    res.json({
      success: true,
      salaries,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};