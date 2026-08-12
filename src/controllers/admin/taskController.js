import Task from "../../models/Task.js";

export const getAllEmployeeTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate({
        path: "assignedBy",
        select: "employeeId fullName profileImage department role",
      })
      .populate({
        path: "assignees.employee",
        select: "employeeId fullName profileImage department role",
      })
      .populate({
        path: "project",
        select: "projectName",
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      total: tasks.length,
      tasks,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};