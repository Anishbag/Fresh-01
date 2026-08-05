import Attendance from "../../models/Attendance.js";
import Employee from "../../models/Employee.js";

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Check In
export const checkIn = async (req, res) => {
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

    const today = getToday();

    // const already = await Attendance.findOne({
    //   employee: employee._id,
    //   date: today,
    // });

    // if (already) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Already checked in",
    //   });
    // }


    const already = await Attendance.findOne({
  employee: employee._id,
  date: today,
});

// Employee leave a Ache
if (already && already.status === "Leave") {
  return res.status(400).json({
    success: false,
    message: "You are on approved leave today. Check-in is not allowed.",
  });
}

if (already) {
  return res.status(400).json({
    success: false,
    message: "Already checked in",
  });
}



    const { mode } = req.body;

    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      checkIn: new Date(),
      mode: mode || "Office",
    });

    res.status(201).json({
      success: true,
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check Out
export const checkOut = async (req, res) => {
  try {
    // const employee = await Employee.findOne({
    //   userId: req.user._id,
    //   isDeleted: false,
    // });

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

    const today = getToday();

    // const attendance = await Attendance.findOne({
    //   employee: employee._id,
    //   date: today,
    // });

    // if (!attendance) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Check in first",
    //   });
    // }

    // if (attendance.checkOut) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Already checked out",
    //   });
    // }

    const attendance = await Attendance.findOne({
  employee: employee._id,
  date: today,
});

if (!attendance) {
  return res.status(404).json({
    success: false,
    message: "Check in first",
  });
}


if (attendance.status === "Leave") {
  return res.status(400).json({
    success: false,
    message: "You are on approved leave today. Check-out is not allowed.",
  });
}

if (attendance.checkOut) {
  return res.status(400).json({
    success: false,
    message: "Already checked out",
  });
}

    attendance.checkOut = new Date();

    const diff = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);

    attendance.workingHours = Number(diff.toFixed(2));

    await attendance.save();

    res.json({
      success: true,
      message: "Checked out successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Attendance History
export const attendanceHistory = async (req, res) => {
  try {
    // const employee = await Employee.findOne({
    //   userId: req.user._id,
    //   isDeleted: false,
    // });

    const employee = await Employee.findOne({
      userId: req.user._id,
      status: "Active",
    });

    const history = await Attendance.find({
      employee: employee._id,
    }).sort({
      date: -1,
    });

    res.json({
      success: true,
      total: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
