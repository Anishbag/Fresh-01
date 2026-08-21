import SalaryConfig from "../../models/SalaryConfig.js";
import SalarySlip from "../../models/SalarySlip.js";
import Employee from "../../models/Employee.js";
import { calculateNormalLeaveDeduction } from "../../utils/salaryUtils.js";

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
      status: "Active",
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

     

      const grossSalary = Number(employee.salary || 0);

      let earnings = [];
      let deductions = [];

      let totalEarnings = 0;
      let totalDeductions = 0;

      for (const config of configs) {
        let amount = 0;

        if (config.mode === "% of gross") {
          amount = (grossSalary * config.value) / 100;
        } else {
          amount = Number(config.value);
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

     

      const leaveCalculation = await calculateNormalLeaveDeduction(
        employee._id,
        month,
        year,
        grossSalary,
      );

      if (leaveCalculation.deduction > 0) {
        deductions.push({
          label: "Normal Leave Deduction",
          amount: leaveCalculation.deduction,
        });

        totalDeductions += leaveCalculation.deduction;
      }

      const totalSalary = Number(grossSalary.toFixed(2));

      totalEarnings = Number(totalEarnings.toFixed(2));

      totalDeductions = Number(totalDeductions.toFixed(2));

      const netSalary = Number((totalSalary - totalDeductions).toFixed(2));

      await SalarySlip.create({
        employee: employee._id,
        month,
        year,

        grossSalary,

        earnings,
        deductions,

        totalEarnings,
        totalDeductions,

        totalSalary,

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

export const getSalarySlips = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    const employees = await Employee.find({
      status: "Active",
    });

    const result = [];

    for (const employee of employees) {
      const slip = await SalarySlip.findOne({
        employee: employee._id,
        month,
        year,
      });

      result.push({
        employeeId: employee.employeeId,
        employeeIdMongo: employee._id,
        fullName: employee.fullName,
        department: employee.department,
        role: employee.designation,
        grossSalary: employee.salary,

        generated: !!slip,

        salarySlipId: slip ? slip._id : null,

        netSalary: slip ? slip.netSalary : null,
      });
    }

    res.status(200).json({
      success: true,
      total: result.length,
      employees: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Salary Slip
export const getSalarySlip = async (req, res) => {
  try {
    const salary = await SalarySlip.findById(req.params.id).populate(
      "employee",
    );

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

export const generateSingleSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    const employee = await Employee.findOne({
      _id: employeeId,
      status: "Active",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const alreadyGenerated = await SalarySlip.findOne({
      employee: employee._id,
      month,
      year,
    });

    if (alreadyGenerated) {
      return res.status(400).json({
        success: false,
        message: "Salary already generated",
      });
    }

    const configs = await SalaryConfig.find();

    const grossSalary = Number(employee.salary);

    let earnings = [];
    let deductions = [];
    let totalEarnings = 0;
    let totalDeductions = 0;

    for (const config of configs) {
      let amount = 0;

      if (config.mode === "% of gross") {
        amount = (grossSalary * config.value) / 100;
      } else {
        amount = Number(config.value);
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

   

    const leaveCalculation = await calculateNormalLeaveDeduction(
      employee._id,
      month,
      year,
      grossSalary,
    );

    if (leaveCalculation.deduction > 0) {
      deductions.push({
        label: "Normal Leave Deduction",
        amount: leaveCalculation.deduction,
      });

      totalDeductions += leaveCalculation.deduction;
    }

    const totalSalary = Number(grossSalary.toFixed(2));

    totalEarnings = Number(totalEarnings.toFixed(2));

    totalDeductions = Number(totalDeductions.toFixed(2));

    const netSalary = Number((totalSalary - totalDeductions).toFixed(2));

    const salary = await SalarySlip.create({
      employee: employee._id,
      month,
      year,
      grossSalary,
      earnings,
      deductions,
      totalEarnings,
      totalDeductions,
      totalSalary,
      netSalary,
    });

    res.status(201).json({
      success: true,
      message: "Salary generated successfully",
      salary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const exportSalary = async (req, res) => {
  try {
    const salaries = await SalarySlip.find().populate(
      "employee",
      "employeeId fullName department designation salary",
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
