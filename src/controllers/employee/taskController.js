import Task from "../../models/Task.js";
import Employee from "../../models/Employee.js";
import Project from "../../models/Project.js";

// export const createTask = async (req, res) => {
//   try {
//     const { projectId, assignedTo, title, description, dueDate } = req.body;

//     // Logged in krbe employe
//     const employee = await Employee.findOne({
//       userId: req.user._id,
//       status: "Active",
//     });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     // Project Check korbe
//     const project = await Project.findById(projectId);

//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: "Project not found",
//       });
//     }

//     // Assigned Employee Check korbe
//     const receiver = await Employee.findById(assignedTo);

//     if (!receiver) {
//       return res.status(404).json({
//         success: false,
//         message: "Assigned employee not found",
//       });
//     }

//     // nijeke dite parbe nah
//     if (employee._id.toString() === receiver._id.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot assign task to yourself",
//       });
//     }

//     const task = await Task.create({
//       project: project._id,
//       assignedBy: employee._id,
//       assignedTo: receiver._id,
//       title,
//       description,
//       dueDate,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Task assigned successfully",
//       task,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const createTask = async (req, res) => {
  try {
    const { projectId, assignedTo, title, description, dueDate } = req.body;

    // Logged-in employee
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

    // Project check
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // assignedTo অবশ্যই array হতে হবে
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one employee",
      });
    }

    // Duplicate employee ID remove
    const uniqueEmployeeIds = [
      ...new Set(assignedTo.map((id) => id.toString())),
    ];

    // Assigned employees check
    const receivers = await Employee.find({
      _id: { $in: uniqueEmployeeIds },
      status: "Active",
    });

    if (receivers.length !== uniqueEmployeeIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more assigned employees not found",
      });
    }

    // নিজের কাছে task দিতে পারবে না
    const selfAssign = uniqueEmployeeIds.some(
      (id) => id === employee._id.toString(),
    );

    if (selfAssign) {
      return res.status(400).json({
        success: false,
        message: "You cannot assign task to yourself",
      });
    }

    // Multiple assignees তৈরি
    const assignees = receivers.map((receiver) => ({
      employee: receiver._id,
      status: "Pending",
      progress: 0,
    }));

    // Create Task
    const task = await Task.create({
      project: project._id,
      assignedBy: employee._id,
      assignees,
      title,
      description,
      dueDate,
    });

    // Response-এর মধ্যে employee names দেখানোর জন্য populate
    await task.populate([
      {
        path: "assignedBy",
        select: "employeeId fullName profileImage",
      },
      {
        path: "assignees.employee",
        select: "employeeId fullName profileImage",
      },
      {
        path: "project",
        select: "projectName",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employee deoya task dackte pabe

// export const getMyTasks = async (req, res) => {
//   try {
//     const employee = await Employee.findOne({
//       userId: req.user._id,
//       status: "Active",
//     });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     // const tasks = await Task.find({
//     //   assignedTo: employee._id,
//     // })
//     //   .populate("assignedBy", "employeeId fullName")
//     //   .populate("project", "projectName")
//     //   .sort({ createdAt: -1 });

//     const tasks = await Task.find({
//       assignedTo: employee._id,
//     })
//       .populate({
//         path: "assignedBy",
//         select: "employeeId fullName profileImage",
//       })
//       .populate({
//         path: "assignedTo",
//         select: "employeeId fullName profileImage",
//       })
//       .populate({
//         path: "project",
//         select: "projectName",
//       })
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       total: tasks.length,
//       tasks,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

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

    const tasks = await Task.find({
      "assignees.employee": employee._id,
    })
      .populate({
        path: "assignedBy",
        select: "employeeId fullName profileImage",
      })
      .populate({
        path: "project",
        select: "projectName",
      })
      .sort({
        createdAt: -1,
      });

    const myTasks = tasks.map((task) => {
      const myAssignment = task.assignees.find(
        (item) =>
          item.employee._id.toString() === employee._id.toString()
      );

      return {
        _id: task._id,

        project: task.project,

        title: task.title,

        description: task.description,

        assignedBy: task.assignedBy,

        dueDate: task.dueDate,

        status: myAssignment.status,

        progress: myAssignment.progress,

        createdAt: task.createdAt,

        updatedAt: task.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      total: myTasks.length,
      tasks: myTasks,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const getCreatedTasks = async (req, res) => {
//   try {
//     const employee = await Employee.findOne({
//       userId: req.user._id,
//       status: "Active",
//     });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     const tasks = await Task.find({
//       assignedBy: employee._id,
//     })
//       .populate({
//         path: "assignedTo",
//         select: "employeeId fullName profileImage",
//       })
//       .populate({
//         path: "project",
//         select: "projectName",
//       })
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       total: tasks.length,
//       tasks,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

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
        path: "assignees.employee",
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
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





// Employee nijer assigned task ar progress/status update korbe
// export const updateTask = async (req, res) => {
//   try {
//     const employee = await Employee.findOne({
//       userId: req.user._id,
//       status: "Active",
//     });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     const { progress, status } = req.body;

//     // Task kujbe
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task not found",
//       });
//     }

//     // jake task deba hoyeche sai update krte parbe

//     if (task.assignedTo.toString() !== employee._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "You can update only your assigned tasks",
//       });
//     }

//     if (progress !== undefined) {
//       if (progress < 0 || progress > 100) {
//         return res.status(400).json({
//           success: false,
//           message: "Progress must be between 0 and 100",
//         });
//       }

//       task.progress = progress;
//     }

//     if (status !== undefined) {
//       if (!["Pending", "In Progress", "Completed"].includes(status)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid task status",
//         });
//       }

//       task.status = status;
//     }

//     if (task.progress === 100) {
//       task.status = "Completed";
//     }

//     await task.save();

//     res.status(200).json({
//       success: true,
//       message: "Task updated successfully",
//       task,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



export const updateTask = async (req, res) => {
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

    const { progress, status } = req.body;

   
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

   
    const assignee = task.assignees.find(
      (item) =>
        item.employee.toString() === employee._id.toString()
    );

    if (!assignee) {
      return res.status(403).json({
        success: false,
        message: "This task is not assigned to you",
      });
    }

    
    if (progress !== undefined) {
      const progressNumber = Number(progress);

      if (
        Number.isNaN(progressNumber) ||
        progressNumber < 0 ||
        progressNumber > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Progress must be between 0 and 100",
        });
      }

      assignee.progress = progressNumber;

      
      if (progressNumber === 100) {
        assignee.status = "Completed";
      } else if (progressNumber > 0) {
        assignee.status = "In Progress";
      } else {
        assignee.status = "Pending";
      }
    }

    
    if (status !== undefined) {
      const validStatuses = [
        "Pending",
        "In Progress",
        "Completed",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status",
        });
      }

      assignee.status = status;

      
      if (status === "Completed") {
        assignee.progress = 100;
      }
    }

    await task.save();

    await task.populate([
      {
        path: "assignedBy",
        select: "employeeId fullName profileImage",
      },
      {
        path: "assignees.employee",
        select: "employeeId fullName profileImage",
      },
      {
        path: "project",
        select: "projectName",
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Task progress updated successfully",
      task,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// Employee seen others employees list
export const getEmployeesForTask = async (req, res) => {
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

    const employees = await Employee.find({
      status: "Active",
      _id: { $ne: employee._id },
    })
      .select("_id employeeId fullName profileImage department role")
      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      total: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
