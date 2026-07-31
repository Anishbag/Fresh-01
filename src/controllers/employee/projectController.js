import Project from "../../models/Project.js";
import Employee from "../../models/Employee.js";

export const getMyProjects = async (req, res) => {
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

    const projects = await Project.find({
      assignedEmployees: employee._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: projects.length,
      projects,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};