// import Attendance from "../../models/Attendance.js";

// export const getAllAttendance = async (req, res) => {
//   try {
//     const { employeeId, period } = req.query;

//     const filter = {};

//     if (employeeId) {
//       filter.employee = employeeId;
//     }

//     if (period) {
//       const fromDate = new Date();
//       fromDate.setDate(fromDate.getDate() - Number(period));

//       filter.date = {
//         $gte: fromDate,
//       };
//     }

//     const attendance = await Attendance.find(filter)
//       .populate("employee", "employeeId fullName department role")
//       .sort({ date: -1 });

//     res.status(200).json({
//       success: true,
//       total: attendance.length,
//       attendance,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



import Attendance from "../../models/Attendance.js";


export const getAllAttendance = async (req, res) => {
  try {
    const {date,employeeId,late,early,} = req.query;

    const query = {};

    
    if (date) {
      const selectedDate = new Date(date);

      selectedDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(selectedDate);

      nextDate.setDate(nextDate.getDate() + 1);

      query.date = {
        $gte: selectedDate,
        $lt: nextDate,
      };
    }
    
    if (employeeId) {
      query.employee = employeeId;
    }
    
    if (late === "true") {
      query.isLateCheckIn = true;
    }
    
    if (early === "true") {
      query.isEarlyCheckOut = true;
    }

    const attendance = await Attendance.find(query)
      .populate(
        "employee",
        "employeeId fullName email department designation"
      )
      .sort({date: -1,createdAt: -1,});

    res.status(200).json({
      success: true,
      total: attendance.length,
      attendance,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};