import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/admin/employeeRoutes.js";
import attendanceRoutes from "./routes/employee/attendanceRoutes.js";
import employeeDailyWorkRoutes from "./routes/employee/dailyWorkStatusRoutes.js";
import adminDailyWorkRoutes from "./routes/admin/dailyWorkStatusRoutes.js";
import employeeWFHRoutes from "./routes/employee/wfhRoutes.js";
import adminWFHRoutes from "./routes/admin/wfhRoutes.js";
import employeeLeaveRoutes from "./routes/employee/leaveRoutes.js";
import adminLeaveRoutes from "./routes/admin/leaveRoutes.js";
import employeeSalaryRoutes from "./routes/employee/salaryRoutes.js";
import adminSalaryRoutes from "./routes/admin/salaryRoutes.js";
import adminDashboardRoutes from "./routes/admin/dashboardRoutes.js";
import employeeDashboardRoutes from "./routes/employee/dashboardRoutes.js";
import adminProjectRoutes from "./routes/admin/projectRoutes.js";
import employeeProjectRoutes from "./routes/employee/projectRoutes.js";
import mailRoutes from "./routes/admin/mailRoutes.js";
import adminattendanceRoutes from "./routes/admin/attendanceRoutes.js";





const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EMS Backend Running...",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/daily-work", employeeDailyWorkRoutes);

app.use("/api/admin/daily-work", adminDailyWorkRoutes);
app.use("/api/wfh", employeeWFHRoutes);

app.use("/api/admin/wfh", adminWFHRoutes);

app.use("/api/leaves", employeeLeaveRoutes);

app.use("/api/admin/leaves", adminLeaveRoutes);

app.use("/api/salary", employeeSalaryRoutes);

app.use("/api/admin/projects", adminProjectRoutes);

app.use("/api/admin/salary", adminSalaryRoutes);
app.use(
    "/api/admin/dashboard",
    adminDashboardRoutes
);

app.use(
    "/api/dashboard",
    employeeDashboardRoutes
);

app.use("/api/employee/projects", employeeProjectRoutes);
app.use("/api/admin/mail", mailRoutes);
app.use("/api/admin/attendance", adminattendanceRoutes);

export default app;