import Leave from "../../models/Leave.js";
import Attendance from "../../models/Attendance.js";

export const getAllLeaves = async (req, res) => {
  try {
    const requests = await Leave.find()
      .populate(
        "employee",
        "employeeId fullName department role profileImage"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      requests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const approveLeave = async (req, res) => {
//   try {
//     const leave = await Leave.findById(req.params.id);

//     if (!leave) {
//       return res.status(404).json({
//         success: false,
//         message: "Leave request not found",
//       });
//     }

//     leave.status = "Approved";

//     await leave.save();

//     res.json({
//       success: true,
//       message: "Leave approved",
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


export const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Already approved check
    if (leave.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Leave already approved",
      });
    }

    leave.status = "Approved";
    await leave.save();

    // Attendance Create
    const currentDate = new Date(leave.fromDate);

    while (currentDate <= leave.toDate) {

      const attendanceDate = new Date(currentDate);
      attendanceDate.setHours(0, 0, 0, 0);

      const exists = await Attendance.findOne({
        employee: leave.employee,
        date: attendanceDate,
      });

      if (!exists) {
        await Attendance.create({
          employee: leave.employee,
          date: attendanceDate,
          status: "Leave",
          mode: "Office",
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      message: "Leave approved successfully hoyeche",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// export const rejectLeave = async (req, res) => {
//   try {
//     const leave = await Leave.findById(req.params.id);

//     if (!leave) {
//       return res.status(404).json({
//         success: false,
//         message: "Leave request not found",
//       });
//     }

//     leave.status = "Rejected";

//     await leave.save();

//     res.json({
//       success: true,
//       message: "Leave rejected",
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



export const rejectLeave = async (req, res) => {
  try {
    const { rejectionRemark } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Remark Dite hobe
    if (!rejectionRemark || rejectionRemark.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a rejection remark",
      });
    }

    // Already rejected check
    if (leave.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Leave already rejected",
      });
    }

    leave.status = "Rejected";
    leave.rejectionRemark = rejectionRemark.trim();

    await leave.save();

    res.status(200).json({
      success: true,
      message: "Leave rejected successfully",
      rejectionRemark: leave.rejectionRemark,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};