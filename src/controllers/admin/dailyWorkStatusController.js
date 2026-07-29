import DailyWorkStatus from "../../models/DailyWorkStatus.js";

export const getDailyWorkReports = async (req, res) => {
  try {
    const { date, employee } = req.query;

    const filter = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.workDate = {
        $gte: start,
        $lte: end,
      };
    }

    if (employee) {
      filter.employee = employee;
    }

    const reports = await DailyWorkStatus.find(filter)
      .populate(
        "employee",
        "employeeId firstName lastName"
      )
      .populate(
        "project",
        "projectName"
      )
      .sort({
        workDate: -1,
      });

    res.status(200).json({
      success: true,
      total: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};