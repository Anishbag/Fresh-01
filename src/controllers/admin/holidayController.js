import Holiday from "../../models/Holiday.js";

export const createHoliday = async (req, res) => {
  try {
    const { dates, reason } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one holiday date is required",
      });
    }

    const holidays = [];

    for (const date of dates) {
      const holidayDate = new Date(date);

      if (Number.isNaN(holidayDate.getTime())) {
        continue;
      }

      holidayDate.setHours(0, 0, 0, 0);

      const existingHoliday = await Holiday.findOne({
        date: holidayDate,
      });

      if (!existingHoliday) {
        const holiday = await Holiday.create({
          date: holidayDate,
          reason: reason || "",
          createdBy: req.user._id,
        });

        holidays.push(holiday);
      }
    }

    res.status(201).json({
      success: true,
      message: "Holiday created successfully",
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


// holiday dakher 

export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .sort({ date: 1 });

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