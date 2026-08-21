// check krbe sunday ki nah
export const isSunday = (date) => {
  return date.getDay() === 0;
};



// 1st Saturday, 2nd Saturday, 3rd Saturday...
export const getSaturdayNumber = (date) => {
  return Math.ceil(date.getDate() / 7);
};


// Check krbe Saturday ache ki
export const isSaturday = (date) => {
  return date.getDay() === 6;
};


// Checkkorbe company holiday ache ki nah
export const isCompanyHoliday = (date) => {
  
  if (isSunday(date)) {
    return true;
  }

  
  if (isSaturday(date)) {
    const saturdayNumber = getSaturdayNumber(date);

    // 1st ar 3rd Saturday hole holiday
    if (
      saturdayNumber === 1 ||
      saturdayNumber === 3
    ) {
      return true;
    }
  }

  return false;
};


export const isWorkingDay = (date) => {
  return !isCompanyHoliday(date);
};


// ata mass ar total day ta nebe
export const getDaysInMonth = (month, year) => {
  return new Date(year,month,0).getDate();
};