import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";

export const isWorkingDay = (date) => {
  const day = date.getDay();

  if (day === 0) {
    return false;
  }

  if (day === 6) {
    const saturdayNumber = Math.ceil(date.getDate() / 7);

    if (saturdayNumber === 1 || saturdayNumber === 3) {
      return false;
    }
  }

  return true;
};

export const countWorkingDays = (fromDate, toDate) => {
  let count = 0;

  const currentDate = new Date(fromDate);
  const endDate = new Date(toDate);

  currentDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      count++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

export const getMonthDateRange = (month, year) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  const monthStart = new Date(yearNumber, monthNumber - 1, 1);

  const monthEnd = new Date(yearNumber, monthNumber, 0);

  monthStart.setHours(0, 0, 0, 0);
  monthEnd.setHours(23, 59, 59, 999);

  return {
    monthStart,
    monthEnd,
  };
};

export const getWorkingDaysInMonth = (month, year) => {
  const { monthStart, monthEnd } = getMonthDateRange(month, year);

  return countWorkingDays(monthStart, monthEnd);
};

export const calculateNormalLeaveDays = async (employeeId, month, year) => {
  const { monthStart, monthEnd } = getMonthDateRange(month, year);

  const leaves = await Leave.find({
    employee: employeeId,

    leaveType: "Normal",

    status: "Approved",

    fromDate: {
      $lte: monthEnd,
    },

    toDate: {
      $gte: monthStart,
    },
  });

  let unpaidLeaveDays = 0;

  for (const leave of leaves) {
    let leaveStart = new Date(leave.fromDate);
    let leaveEnd = new Date(leave.toDate);

    leaveStart.setHours(0, 0, 0, 0);
    leaveEnd.setHours(0, 0, 0, 0);

    if (leaveStart < monthStart) {
      leaveStart = new Date(monthStart);
    }

    if (leaveEnd > monthEnd) {
      leaveEnd = new Date(monthEnd);
    }

    unpaidLeaveDays += countWorkingDays(leaveStart, leaveEnd);
  }

  return unpaidLeaveDays;
};

export const calculatePaidAndUnpaidLeaves = async (employeeId, month, year) => {
  const { monthStart, monthEnd } = getMonthDateRange(month, year);

  const leaves = await Leave.find({
    employee: employeeId,

    status: "Approved",

    leaveType: {
      $in: ["Casual", "Sick"],
    },

    fromDate: {
      $lte: monthEnd,
    },

    toDate: {
      $gte: monthStart,
    },
  });

  let casualLeaveDays = 0;
  let sickLeaveDays = 0;

  for (const leave of leaves) {
    let leaveStart = new Date(leave.fromDate);
    let leaveEnd = new Date(leave.toDate);

    leaveStart.setHours(0, 0, 0, 0);
    leaveEnd.setHours(0, 0, 0, 0);

    if (leaveStart < monthStart) {
      leaveStart = new Date(monthStart);
    }

    if (leaveEnd > monthEnd) {
      leaveEnd = new Date(monthEnd);
    }

    const days = countWorkingDays(leaveStart, leaveEnd);

    if (leave.leaveType === "Casual") {
      casualLeaveDays += days;
    }

    if (leave.leaveType === "Sick") {
      sickLeaveDays += days;
    }
  }

  const paidCasualLeaveDays = Math.min(casualLeaveDays, 1);

  const paidSickLeaveDays = Math.min(sickLeaveDays, 1);

  const unpaidCasualLeaveDays = Math.max(
    casualLeaveDays - paidCasualLeaveDays,
    0,
  );

  const unpaidSickLeaveDays = Math.max(sickLeaveDays - paidSickLeaveDays, 0);

  return {
    casualLeaveDays,
    sickLeaveDays,

    paidCasualLeaveDays,
    paidSickLeaveDays,

    unpaidCasualLeaveDays,
    unpaidSickLeaveDays,

    totalUnpaidLeaveDays: unpaidCasualLeaveDays + unpaidSickLeaveDays,
  };
};

export const ensureMonthlyAttendance = async (employeeId, month, year) => {
  const { monthStart, monthEnd } = getMonthDateRange(month, year);

  let absentDays = 0;

  const currentDate = new Date(monthStart);

  while (currentDate <= monthEnd) {
    const attendanceDate = new Date(currentDate);
    attendanceDate.setHours(0, 0, 0, 0);

    if (isWorkingDay(attendanceDate)) {
      const nextDate = new Date(attendanceDate);

      nextDate.setDate(nextDate.getDate() + 1);

      const existingAttendance = await Attendance.findOne({
        employee: employeeId,

        date: {
          $gte: attendanceDate,
          $lt: nextDate,
        },
      });

      if (!existingAttendance) {
        const approvedLeave = await Leave.findOne({
          employee: employeeId,

          status: "Approved",

          fromDate: {
            $lte: attendanceDate,
          },

          toDate: {
            $gte: attendanceDate,
          },
        });

        if (approvedLeave) {
          await Attendance.create({
            employee: employeeId,
            date: attendanceDate,
            status: "Leave",
            mode: "Office",
          });
        } else {
          await Attendance.create({
            employee: employeeId,
            date: attendanceDate,
            status: "Absent",
            mode: "Office",
          });

          absentDays++;
        }
      } else if (existingAttendance.status === "Absent") {
        absentDays++;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    absentDays,
  };
};
