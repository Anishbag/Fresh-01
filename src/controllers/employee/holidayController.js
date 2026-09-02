import Holiday from "../../models/Holiday.js";

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getTodayHoliday = async (req, res) => {
  try {
    const today = getToday();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const holiday = await Holiday.findOne({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    return res.status(200).json({
      success: true,
      isHoliday: !!holiday,
      holiday: holiday || null,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};