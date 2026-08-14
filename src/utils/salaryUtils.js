import Leave from "../models/Leave.js";


export const isWorkingDay = (date) => {
  const day = date.getDay();

 
  if (day === 0) {
    return false;
  }

  if (day === 6) {
    const dateOfMonth = date.getDate();

    
    const saturdayNumber = Math.ceil(dateOfMonth / 7);

    
    if (
      saturdayNumber === 1 ||
      saturdayNumber === 3 ||
      saturdayNumber === 5
    ) {
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

    currentDate.setDate(
      currentDate.getDate() + 1
    );
  }

  return count;
};


export const calculateNormalLeaveDeduction = async (
  employeeId,
  month,
  year,
  grossSalary
) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  const monthStart = new Date(
    yearNumber,
    monthNumber - 1,
    1
  );

  const monthEnd = new Date(
    yearNumber,
    monthNumber,
    0
  );

  monthStart.setHours(0, 0, 0, 0);
  monthEnd.setHours(23, 59, 59, 999);

 
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

  let workingLeaveDays = 0;

  for (const leave of leaves) {
    let leaveStart = new Date(leave.fromDate);
    let leaveEnd = new Date(leave.toDate);

    leaveStart.setHours(0, 0, 0, 0);
    leaveEnd.setHours(0, 0, 0, 0);

    if (leaveStart < monthStart) {
      leaveStart = new Date(monthStart);
      leaveStart.setHours(0, 0, 0, 0);
    }

    if (leaveEnd > monthEnd) {
      leaveEnd = new Date(monthEnd);
      leaveEnd.setHours(0, 0, 0, 0);
    }

    workingLeaveDays += countWorkingDays(
      leaveStart,
      leaveEnd
    );
  }

 
  const perDaySalary = Number(
    (Number(grossSalary) / 24).toFixed(2)
  );

  const deduction = Number(
    (workingLeaveDays * perDaySalary).toFixed(2)
  );

  return {
    workingLeaveDays,
    perDaySalary,
    deduction,
  };
};