import Attendance from "../models/Attendance.js";

import {
  getMonthDateRange,
  getWorkingDaysInMonth,
  calculateNormalLeaveDays,
  calculatePaidAndUnpaidLeaves,
  ensureMonthlyAttendance,
} from "./salaryUtils.js";

export const calculateProfessionalTax = (salary) => {
  const amount = Number(salary || 0);

  if (amount < 10000) {
    return 0;
  }

  if (amount <= 15000) {
    return 110;
  }

  if (amount <= 25000) {
    return 130;
  }

  if (amount <= 40000) {
    return 150;
  }

  return 200;
};

export const calculatePF = (
  basicSalary,
  pfApplicable = false,
  pfPercentage = 24,
) => {
  const basic = Number(basicSalary || 0);

  let percentage = Number(pfPercentage);

  if (Number.isNaN(percentage)) {
    percentage = 24;
  }

  percentage = Math.min(Math.max(percentage, 0), 100);

  // PF not applicable
  if (!pfApplicable) {
    return {
      pfApplicable: false,
      pfPercentage: percentage,
      pfWage: 0,
      employeePF: 0,
      employerPF: 0,
    };
  }

  // Maximum PF wage = ₹15,000
  const pfWage = Math.min(basic, 15000);

  // PF = 24% of PF wage
  const calculatedPF = (pfWage * percentage) / 100;

  const employeePF = Number(calculatedPF.toFixed(2));

  const employerPF = employeePF;

  return {
    pfApplicable: true,
    pfPercentage: percentage,
    pfWage: Number(pfWage.toFixed(2)),
    employeePF,
    employerPF,
  };
};

export const calculateAttendanceSalary = async (
  employeeId,
  month,
  year,
  perMinuteSalary,
) => {
  const { monthStart, monthEnd } = getMonthDateRange(month, year);

  const attendanceRecords = await Attendance.find({
    employee: employeeId,

    date: {
      $gte: monthStart,
      $lte: monthEnd,
    },

    status: "Present",
  }).sort({
    date: 1,
  });

  let actualWorkingMinutes = 0;

  let finalPaidMinutes = 0;

  let earlyCheckoutMinutes = 0;

  for (const attendance of attendanceRecords) {
    const actualMinutes = Math.max(Number(attendance.workingMinutes || 0), 0);

    actualWorkingMinutes += actualMinutes;

    let paidMinutes;

    if (attendance.adminApproved) {
      paidMinutes = Math.min(Number(attendance.adminApprovedMinutes || 0), 540);
    } else {
      paidMinutes = Math.min(actualMinutes, 540);
    }

    finalPaidMinutes += paidMinutes;

    if (attendance.checkOut) {
      earlyCheckoutMinutes += Math.max(540 - paidMinutes, 0);
    }
  }

  const earlyCheckoutDeduction = Number(
    (earlyCheckoutMinutes * perMinuteSalary).toFixed(2),
  );

  return {
    attendanceRecords,

    actualWorkingMinutes,

    finalPaidMinutes,

    earlyCheckoutMinutes,

    earlyCheckoutDeduction,
  };
};

export const calculateEmployeeSalary = async ({
  employeeId,
  grossSalary,
  month,
  year,
  pfApplicable = false,
  pfPercentage = 24,
  earningConfigs = [],
}) => {
  const salary = Number(grossSalary || 0);

  if (salary < 0) {
    throw new Error("Gross salary cannot be negative.");
  }

  const { monthStart, monthEnd } = getMonthDateRange(month, year);

  // Full calendar month days
  const totalCalendarDays = monthEnd.getDate();

  // Salary is calculated based on full calendar month
  const perDaySalary = totalCalendarDays > 0 ? salary / totalCalendarDays : 0;

  // 1 working day = 540 minutes
  const perMinuteSalary = perDaySalary / 540;

  // Working days are still required for attendance/absent calculation
  const workingDays = await getWorkingDaysInMonth(month, year);

  // This is informational only.
  // Salary divisor is NOT based on workingDays.
  const totalAvailableMinutes = totalCalendarDays * 540;

  const attendanceStatus = await ensureMonthlyAttendance(
    employeeId,
    month,
    year,
  );

  const absentDays = Number(attendanceStatus.absentDays || 0);

  const normalLeaveDays = await calculateNormalLeaveDays(
    employeeId,
    month,
    year,
  );

  const leaveCalculation = await calculatePaidAndUnpaidLeaves(
    employeeId,
    month,
    year,
  );

  const unpaidLeaveDays =
    normalLeaveDays + leaveCalculation.totalUnpaidLeaveDays;

  const paidLeaveDays =
    leaveCalculation.paidCasualLeaveDays + leaveCalculation.paidSickLeaveDays;

  const paidDays = Math.max(
    totalCalendarDays - absentDays - unpaidLeaveDays,
    0,
  );

  const attendanceCalculation = await calculateAttendanceSalary(
    employeeId,
    month,
    year,
    perMinuteSalary,
  );

  const paidAttendanceMinutes = attendanceCalculation.finalPaidMinutes;

  const paidLeaveMinutes = paidLeaveDays * 540;

  const totalPaidMinutes = paidAttendanceMinutes + paidLeaveMinutes;

  const absentDeduction = Number(
    (absentDays * 540 * perMinuteSalary).toFixed(2),
  );

  const leaveDeduction = Number(
    (unpaidLeaveDays * 540 * perMinuteSalary).toFixed(2),
  );

  const earlyCheckoutDeduction = attendanceCalculation.earlyCheckoutDeduction;

  const earnedGrossSalary = Number(
    Math.max(
      salary - absentDeduction - leaveDeduction - earlyCheckoutDeduction,
      0,
    ).toFixed(2),
  );

  // EARNINGS FROM SALARY CONFIG

  const earnings = [];

  let totalEarnings = 0;

  let earnedBasicSalary = 0;

  // SalaryConfig will be passed from controller
  for (const config of earningConfigs) {
    const percentage = Number(config.value || 0);

    if (config.mode !== "% of gross") {
      continue;
    }

    const amount = Number(((salary * percentage) / 100).toFixed(2));

    earnings.push({
      label: config.label,
      percentage,
      amount,
    });

    totalEarnings += amount;

    if (config.label.trim().toLowerCase() === "basic") {
      earnedBasicSalary = amount;
    }
  }

  totalEarnings = Number(totalEarnings.toFixed(2));

  // PF CALCULATION

  const pfCalculation = calculatePF(
    earnedBasicSalary,
    pfApplicable,
    pfPercentage,
  );

  let finalEmployeePF = pfCalculation.employeePF;
  let finalEmployerPF = pfCalculation.employerPF;

  if (earnedGrossSalary < finalEmployeePF) {
    finalEmployeePF = 0;
    finalEmployerPF = 0;
  }

  // PROFESSIONAL TAX

  let finalProfessionalTax = 0;

  if (salary > 0) {
    finalProfessionalTax = calculateProfessionalTax(salary);
  }

  const totalDeduction = Number(
    (
      absentDeduction +
      leaveDeduction +
      attendanceCalculation.earlyCheckoutDeduction +
      finalEmployeePF +
      finalProfessionalTax
    ).toFixed(2),
  );

  const netSalary = Number(Math.max(salary - totalDeduction, 0).toFixed(2));

  return {
    grossSalary: salary,

    earnedGrossSalary,

    payableDays: totalCalendarDays,

    workingDays,

    paidDays,

    totalAvailableMinutes,

    paidCasualLeaveDays: leaveCalculation.paidCasualLeaveDays,

    paidSickLeaveDays: leaveCalculation.paidSickLeaveDays,

    unpaidLeaveDays,

    paidLeaveDays,

    absentDays,

    absentDeduction,

    actualWorkingMinutes: attendanceCalculation.actualWorkingMinutes,

    finalPaidMinutes: attendanceCalculation.finalPaidMinutes,

    paidLeaveMinutes,

    totalPaidMinutes,

    earlyCheckoutMinutes: attendanceCalculation.earlyCheckoutMinutes,

    earlyCheckoutDeduction: attendanceCalculation.earlyCheckoutDeduction,

    leaveDeduction,

    earnings,

    totalEarnings,

    earnedBasicSalary,

    pfApplicable: pfCalculation.pfApplicable,

    pfPercentage: pfCalculation.pfPercentage,

    pfWage: pfCalculation.pfWage,

    employeePF: finalEmployeePF,

    employerPF: finalEmployerPF,

    professionalTax: finalProfessionalTax,

    totalDeduction,

    netSalary,

    perMinuteSalary,
  };
};
