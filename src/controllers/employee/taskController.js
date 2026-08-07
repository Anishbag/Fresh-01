import Task from "../../models/Task.js";
import Employee from "../../models/Employee.js";
import Project from "../../models/Project.js";

export const createTask = async (req, res) => {
  try {
    const { projectId, assignedTo, title, description, dueDate } = req.body;

    // Logged in krbe employe
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

    // Project Check korbe
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Assigned Employee Check korbe
    const receiver = await Employee.findById(assignedTo);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Assigned employee not found",
      });
    }

    // nijeke dite parbe nah
    if (employee._id.toString() === receiver._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot assign task to yourself",
      });
    }

    const task = await Task.create({
      project: project._id,
      assignedBy: employee._id,
      assignedTo: receiver._id,
      title,
      description,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employee deoya task dackte pabe

export const getMyTasks = async (req, res) => {
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

    // const tasks = await Task.find({
    //   assignedTo: employee._id,
    // })
    //   .populate("assignedBy", "employeeId fullName")
    //   .populate("project", "projectName")
    //   .sort({ createdAt: -1 });

    const tasks = await Task.find({
      assignedTo: employee._id,
    })
      .populate({
        path: "assignedBy",
        select: "employeeId fullName profileImage",
      })
      .populate({
        path: "assignedTo",
        select: "employeeId fullName profileImage",
      })
      .populate({
        path: "project",
        select: "projectName",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





export const getCreatedTasks = async (req, res) => {
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

    const tasks = await Task.find({
      assignedBy: employee._id,
    })
      .populate({
        path: "assignedTo",
        select: "employeeId fullName profileImage",
      })
      .populate({
        path: "project",
        select: "projectName",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: tasks.length,
      tasks,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};