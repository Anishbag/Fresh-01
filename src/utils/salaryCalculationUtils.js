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

export const calculatePF = (grossSalary, pfPercentage = 12) => {
  const salary = Number(grossSalary || 0);

  let percentage = Number(pfPercentage);

  if (Number.isNaN(percentage)) {
    percentage = 12;
  }

  percentage = Math.min(Math.max(percentage, 0), 100);

  const pfWage = salary;

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

    if (attendance.checkOut && attendance.isEarlyCheckOut) {
      const shortageMinutes = Math.max(540 - paidMinutes, 0);

      earlyCheckoutMinutes += shortageMinutes;
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

  // pfApplicable = true,

  pfPercentage = 12,
}) => {
  const salary = Number(grossSalary || 0);

  // if (salary < 0) {
  //   throw new Error("Gross salary cannot be negative.");
  // }

  // const workingDays = getWorkingDaysInMonth(month, year);
  if (salary < 0) {
    throw new Error("Gross salary cannot be negative.");
  }

  const attendanceStatus = await ensureMonthlyAttendance(
    employeeId,
    month,
    year,
  );

  const absentDays = attendanceStatus.absentDays;

  const workingDays = getWorkingDaysInMonth(month, year);

  const totalAvailableMinutes = workingDays * 540;

  const perMinuteSalary =
    totalAvailableMinutes > 0 ? salary / totalAvailableMinutes : 0;

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

  const unpaidLeaveMinutes = unpaidLeaveDays * 540;

  const leaveDeduction = Number(
    (unpaidLeaveMinutes * perMinuteSalary).toFixed(2),
  );
  const absentMinutes = absentDays * 540;

  const absentDeduction = Number((absentMinutes * perMinuteSalary).toFixed(2));

  const attendanceCalculation = await calculateAttendanceSalary(
    employeeId,
    month,
    year,
    perMinuteSalary,
  );

  const pfCalculation = calculatePF(salary, pfPercentage);

  const professionalTax = calculateProfessionalTax(salary);

  // const totalDeduction = Number(
  //   (
  //     leaveDeduction +
  //     attendanceCalculation.earlyCheckoutDeduction +
  //     pfCalculation.employeePF +
  //     professionalTax
  //   ).toFixed(2),
  // );
  const totalDeduction = Number(
    (
      leaveDeduction +
      absentDeduction +
      attendanceCalculation.earlyCheckoutDeduction +
      pfCalculation.employeePF +
      professionalTax
    ).toFixed(2),
  );

  const netSalary = Number(Math.max(salary - totalDeduction, 0).toFixed(2));

  return {
    grossSalary: salary,

    workingDays,

    totalAvailableMinutes,

    paidCasualLeaveDays: leaveCalculation.paidCasualLeaveDays,

    paidSickLeaveDays: leaveCalculation.paidSickLeaveDays,

    unpaidLeaveDays,

    absentDays,

    absentDeduction,

    actualWorkingMinutes: attendanceCalculation.actualWorkingMinutes,

    finalPaidMinutes: attendanceCalculation.finalPaidMinutes,

    earlyCheckoutMinutes: attendanceCalculation.earlyCheckoutMinutes,

    leaveDeduction,

    earlyCheckoutDeduction: attendanceCalculation.earlyCheckoutDeduction,

    // pfApplicable: pfApplicable,

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
