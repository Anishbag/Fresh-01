import Employee from "../../models/Employee.js";
import Leave from "../../models/Leave.js";
import Attendance from "../../models/Attendance.js";

// export const applyLeave = async (req, res) => {
//   try {
//     // const employee = await Employee.findOne({
//     //   userId: req.user._id,
//     //   isDeleted: false,
//     // });

//     const employee = await Employee.findOne({
//       userId: req.user._id,
//       status: "Active",
//     });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     const { leaveType, fromDate, toDate, reason } = req.body;

//     const leave = await Leave.create({
//       employee: employee._id,
//       leaveType,
//       fromDate,
//       toDate,
//       reason,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Leave applied successfully",
//       leave,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
      status: "Active",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const { leaveType, fromDate, toDate, reason } = req.body;

    //  ager date to porer date kora jabe nah
    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than To date.",
      });
    }

    //  pending ba approv thakle newa jabe nah
    const existingLeave = await Leave.findOne({
      employee: employee._id,
      status: { $in: ["Pending", "Approved"] },
      fromDate: { $lte: new Date(toDate) },
      toDate: { $gte: new Date(fromDate) },
    });

    if (existingLeave) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request for the selected dates.",
      });
    }

    const attendance = await Attendance.findOne({
  employee: employee._id,
  // status: "Present",
  date: {
    $gte: new Date(fromDate),
    $lte: new Date(toDate),
  },
});

if (attendance) {
  return res.status(400).json({
    success: false,
    message: "Attendance already exists for the selected date.",
  });
}




    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      fromDate,
      toDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      leave,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





export const myLeaveHistory = async (req, res) => {
  try {
    // const employee = await Employee.findOne({
    //   userId: req.user._id,
    //   isDeleted: false,
    // });

      const employee = await Employee.findOne({
      userId: req.user._id,
      status: "Active",
    });

    const leaves = await Leave.find({
      employee: employee._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
