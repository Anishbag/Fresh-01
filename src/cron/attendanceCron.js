import cron from "node-cron";
import Attendance from "../models/Attendance.js";

// Every day at 11:59 PM
cron.schedule("59 23 * * *", async () => {
  try {
    console.log("Running Auto Checkout...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkOutTime = new Date();
    checkOutTime.setHours(23, 59, 0, 0);

    const attendanceList = await Attendance.find({
      date: today,
      checkOut: null,
    });

    for (const attendance of attendanceList) {
      attendance.checkOut = checkOutTime;

      const diff =
        (attendance.checkOut - attendance.checkIn) /
        (1000 * 60 * 60);

      attendance.workingHours = Number(diff.toFixed(2));

      await attendance.save();
    }

    console.log(
      `${attendanceList.length} employee auto checked out`
    );

  } catch (err) {
    console.log(err);
  }
});