import SalaryConfig from "../../models/SalaryConfig.js";
import SalarySlip from "../../models/SalarySlip.js";
import Employee from "../../models/Employee.js";

import { calculateEmployeeSalary } from "../../utils/salaryCalculationUtils.js";

export const generateSalary = async (req, res) => {
  try {
    const { month, year, pfPercentage = 12 } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required",
      });
    }

    const monthNumber = Number(month);
    const yearNumber = Number(year);

    if (monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid month",
      });
    }

    if (!Number.isInteger(yearNumber) || yearNumber < 2000) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    const employees = await Employee.find({
      status: "Active",
    });

    const configs = await SalaryConfig.find();

    let generated = 0;
    let skipped = 0;

    for (const employee of employees) {
      const alreadyGenerated = await SalarySlip.findOne({
        employee: employee._id,
        month: monthNumber,
        year: yearNumber,
      });

      if (alreadyGenerated) {
        skipped++;
        continue;
      }

      const grossSalary = Number(employee.salary || 0);

      const calculation = await calculateEmployeeSalary({
        employeeId: employee._id,
        grossSalary,
        month: monthNumber,
        year: yearNumber,

        // pfApplicable: true,

        pfPercentage: Number(pfPercentage),
      });

      const earnings = [];
      const deductions = [];

      let totalEarnings = 0;
      let totalConfiguredDeductions = 0;

      for (const config of configs) {
        let amount = 0;

        if (config.mode === "% of gross") {
          amount = (grossSalary * Number(config.value)) / 100;
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

          totalConfiguredDeductions += amount;
        }
      }

      if (calculation.leaveDeduction > 0) {
        deductions.push({
          label: "Leave Deduction",
          amount: calculation.leaveDeduction,
        });
      }

      if (calculation.absentDeduction > 0) {
        deductions.push({
          label: "Absent Deduction",
          amount: calculation.absentDeduction,
        });
      }

      if (calculation.earlyCheckoutDeduction > 0) {
        deductions.push({
          label: "Early Checkout Deduction",
          amount: calculation.earlyCheckoutDeduction,
        });
      }

      deductions.push({
        label: `Employee PF (${calculation.pfPercentage}%)`,
        amount: calculation.employeePF,
      });

      deductions.push({
        label: "Professional Tax",
        amount: calculation.professionalTax,
      });

      const automaticDeductions = calculation.totalDeduction;

      const totalDeductions = Number(
        (totalConfiguredDeductions + automaticDeductions).toFixed(2),
      );

      const totalSalary = Number(grossSalary.toFixed(2));

      const netSalary = Number(
        Math.max(totalSalary - totalDeductions, 0).toFixed(2),
      );

      await SalarySlip.create({
        employee: employee._id,

        month: monthNumber,

        year: yearNumber,

        grossSalary,

        workingDays: calculation.workingDays,

        totalAvailableMinutes: calculation.totalAvailableMinutes,

        paidCasualLeaveDays: calculation.paidCasualLeaveDays,

        paidSickLeaveDays: calculation.paidSickLeaveDays,

        unpaidLeaveDays: calculation.unpaidLeaveDays,

        absentDays: calculation.absentDays,

        absentDeduction: calculation.absentDeduction,

        actualWorkingMinutes: calculation.actualWorkingMinutes,

        finalPaidMinutes: calculation.finalPaidMinutes,

        earlyCheckoutMinutes: calculation.earlyCheckoutMinutes,

        leaveDeduction: calculation.leaveDeduction,

        earlyCheckoutDeduction: calculation.earlyCheckoutDeduction,

        pfApplicable: calculation.pfApplicable,

        pfPercentage: calculation.pfPercentage,

        pfWage: calculation.pfWage,

        employeePF: calculation.employeePF,

        employerPF: calculation.employerPF,

        professionalTax: calculation.professionalTax,

        earnings,

        deductions,

        totalEarnings: Number(totalEarnings.toFixed(2)),

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
    console.log(error);

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

        month: Number(month),

        year: Number(year),
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

        professionalTax: slip ? slip.professionalTax : null,

        employeePF: slip ? slip.employeePF : null,

        employerPF: slip ? slip.employerPF : null,
      });
    }

    res.status(200).json({
      success: true,

      total: result.length,

      employees: result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSalarySlip = async (req, res) => {
  try {
    const salary = await SalarySlip.findById(req.params.id).populate(
      "employee",
      "employeeId fullName email phone department designation bankAccount",
    );

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
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateSingleSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const { month, year, pfPercentage = 12 } = req.body;

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

      month: Number(month),

      year: Number(year),
    });

    if (alreadyGenerated) {
      return res.status(400).json({
        success: false,
        message: "Salary already generated",
      });
    }

    const configs = await SalaryConfig.find();

    const grossSalary = Number(employee.salary || 0);

    const calculation = await calculateEmployeeSalary({
      employeeId: employee._id,

      grossSalary,

      month: Number(month),

      year: Number(year),

      // pfApplicable: true,

      pfPercentage: Number(pfPercentage),
    });

    const earnings = [];
    const deductions = [];

    let totalEarnings = 0;
    let totalConfiguredDeductions = 0;

    for (const config of configs) {
      let amount = 0;

      if (config.mode === "% of gross") {
        amount = (grossSalary * Number(config.value)) / 100;
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

        totalConfiguredDeductions += amount;
      }
    }

    if (calculation.leaveDeduction > 0) {
      deductions.push({
        label: "Leave Deduction",

        amount: calculation.leaveDeduction,
      });
    }

    if (calculation.absentDeduction > 0) {
      deductions.push({
        label: "Absent Deduction",
        amount: calculation.absentDeduction,
      });
    }

    if (calculation.earlyCheckoutDeduction > 0) {
      deductions.push({
        label: "Early Checkout Deduction",

        amount: calculation.earlyCheckoutDeduction,
      });
    }

    deductions.push({
      label: `Employee PF (${calculation.pfPercentage}%)`,

      amount: calculation.employeePF,
    });

    deductions.push({
      label: "Professional Tax",

      amount: calculation.professionalTax,
    });

    const totalDeductions = Number(
      (totalConfiguredDeductions + calculation.totalDeduction).toFixed(2),
    );

    const totalSalary = Number(grossSalary.toFixed(2));

    const netSalary = Number(
      Math.max(totalSalary - totalDeductions, 0).toFixed(2),
    );

    const salary = await SalarySlip.create({
      employee: employee._id,

      month: Number(month),

      year: Number(year),

      grossSalary,

      workingDays: calculation.workingDays,

      totalAvailableMinutes: calculation.totalAvailableMinutes,

      paidCasualLeaveDays: calculation.paidCasualLeaveDays,

      paidSickLeaveDays: calculation.paidSickLeaveDays,

      unpaidLeaveDays: calculation.unpaidLeaveDays,

      absentDays: calculation.absentDays,

      absentDeduction: calculation.absentDeduction,

      actualWorkingMinutes: calculation.actualWorkingMinutes,

      finalPaidMinutes: calculation.finalPaidMinutes,

      earlyCheckoutMinutes: calculation.earlyCheckoutMinutes,

      leaveDeduction: calculation.leaveDeduction,

      earlyCheckoutDeduction: calculation.earlyCheckoutDeduction,

      pfApplicable: calculation.pfApplicable,

      pfPercentage: calculation.pfPercentage,

      pfWage: calculation.pfWage,

      employeePF: calculation.employeePF,

      employerPF: calculation.employerPF,

      professionalTax: calculation.professionalTax,

      earnings,

      deductions,

      totalEarnings: Number(totalEarnings.toFixed(2)),

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
    console.log(error);

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

    res.status(200).json({
      success: true,
      salaries,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
