import Holiday from "../../models/Holiday.js";
import Employee from "../../models/Employee.js";
import Attendance from "../../models/Attendance.js";

export const createHoliday = async (req, res) => {
  try {
    const { dates, reason } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one holiday date is required",
      });
    }

    // Get all active employees
    const employees = await Employee.find({
      status: "Active",
    }).select("_id");

    const holidays = [];

    for (const date of dates) {
      const holidayDate = new Date(date);

      if (Number.isNaN(holidayDate.getTime())) {
        continue;
      }

      holidayDate.setHours(0, 0, 0, 0);

      // Check korbe holiday ache ki nah
      const existingHoliday = await Holiday.findOne({
        date: holidayDate,
      });

      let holiday = existingHoliday;

      if (!existingHoliday) {
        holiday = await Holiday.create({
          date: holidayDate,
          reason: reason || "",
          createdBy: req.user._id,
        });

        holidays.push(holiday);
      }

      // Create / update Attendance for every active employee
      for (const employee of employees) {
        await Attendance.findOneAndUpdate(
          {
            employee: employee._id,
            date: holidayDate,
          },
          {
            $set: {
              status: "Holiday",
            },
            $setOnInsert: {
              employee: employee._id,
              date: holidayDate,
              checkIn: null,
              checkOut: null,
              workingMinutes: 0,
              paidMinutes: 0,
              workingHours: 0,
              mode: "Office",
              isLateCheckIn: false,
              checkInRemark: "",
              isEarlyCheckOut: false,
              checkOutRemark: "",
              adminApproved: false,
              adminRemark: "",
            },
          },
          {
            upsert: true,
            new: true,
          },
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Holiday created successfully",
      total: holidays.length,
      holidays,
      attendanceCreatedFor: employees.length,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// holiday dakher

export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });

    res.status(200).json({
      success: true,
      total: holidays.length,
      holidays,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// holiday delete

export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    await holiday.deleteOne();

    res.status(200).json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
