import Attendance from "../../models/Attendance.js";

export const getAllAttendance = async (req, res) => {
  try {
    const { employeeId, period } = req.query;

    const filter = {};

    if (employeeId) {
      filter.employee = employeeId;
    }

    if (period) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Number(period));

      filter.date = {
        $gte: fromDate,
      };
    }

    const attendance = await Attendance.find(filter)
      .populate("employee", "employeeId fullName department role")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      total: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};