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

export const calculatePF = (earnedBasicSalary, pfPercentage = 12) => {
  const basicSalary = Number(earnedBasicSalary || 0);

  let percentage = Number(pfPercentage);

  if (Number.isNaN(percentage)) {
    percentage = 12;
  }

  percentage = Math.min(Math.max(percentage, 0), 100);

  const pfWage = Number(basicSalary.toFixed(2));

  const employeePF = Number(((pfWage * percentage) / 100).toFixed(2));

  const employerPF = Number(((pfWage * percentage) / 100).toFixed(2));

  return {
    pfPercentage: percentage,
    pfWage,
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
  pfPercentage = 12,
  earningConfigs = [],
}) => {
  const salary = Number(grossSalary || 0);

  if (salary < 0) {
    throw new Error("Gross salary cannot be negative.");
  }

  const workingDays = getWorkingDaysInMonth(month, year);

  const totalAvailableMinutes = workingDays * 540;

  const perMinuteSalary =
    totalAvailableMinutes > 0 ? salary / totalAvailableMinutes : 0;

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

  const attendanceCalculation = await calculateAttendanceSalary(
    employeeId,
    month,
    year,
    perMinuteSalary,
  );

  const paidAttendanceMinutes = attendanceCalculation.finalPaidMinutes;

const paidLeaveMinutes = paidLeaveDays * 540;

const totalPaidMinutes =
  paidAttendanceMinutes + paidLeaveMinutes;

const absentDeduction = Number(
  (absentDays * 540 * perMinuteSalary).toFixed(2),
);

const leaveDeduction = Number(
  (unpaidLeaveDays * 540 * perMinuteSalary).toFixed(2),
);

const earlyCheckoutDeduction =
  attendanceCalculation.earlyCheckoutDeduction;

const earnedGrossSalary = Number(
  Math.max(
    salary -
      absentDeduction -
      leaveDeduction -
      earlyCheckoutDeduction,
    0,
  ).toFixed(2),
);

  const earnings = [];

  let totalEarnings = 0;

  let earnedBasicSalary = 0;

  for (const config of earningConfigs) {
    const percentage = Number(config.value || 0);

    const amount = Number(((earnedGrossSalary * percentage) / 100).toFixed(2));

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

  const pfCalculation = calculatePF(earnedBasicSalary, pfPercentage);

  const professionalTax = calculateProfessionalTax(earnedGrossSalary);

  

const totalDeduction = Number(
  (
    absentDeduction +
    leaveDeduction +
    attendanceCalculation.earlyCheckoutDeduction +
    pfCalculation.employeePF +
    professionalTax
  ).toFixed(2),
);

const netSalary = Number(
  Math.max(salary - totalDeduction, 0).toFixed(2),
);

  return {
    grossSalary: salary,

    earnedGrossSalary,

    workingDays,

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

    pfPercentage: pfCalculation.pfPercentage,

    pfWage: pfCalculation.pfWage,

    employeePF: pfCalculation.employeePF,

    employerPF: pfCalculation.employerPF,

    professionalTax,

    totalDeduction,

    netSalary,

    perMinuteSalary,
  };
};
