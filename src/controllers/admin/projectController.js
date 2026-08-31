import Project from "../../models/Project.js";
import Employee from "../../models/Employee.js";


// Add Project
export const createProject = async (req, res) => {
  try {
    const {
      projectName,
      consumerName,
      startDate,
      endDate,
      valuation,
      status,
      consumerDetails,
      description,
    } = req.body;

    const duration = Math.ceil(
      (new Date(endDate) - new Date(startDate)) /
        (1000 * 60 * 60 * 24)
    );

    const project = await Project.create({
      projectName,
      consumerName,
      startDate,
      endDate,
      duration,
      valuation,
      status,
      consumerDetails,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// All Projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate(
        "assignedEmployees",
        "employeeId fullName"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Single Project
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate(
        "assignedEmployees",
        "employeeId fullName"
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Project
export const updateProject = async (req, res) => {
  try {
    const data = req.body;

    if (data.startDate && data.endDate) {
      data.duration = Math.ceil(
        (new Date(data.endDate) - new Date(data.startDate)) /
          (1000 * 60 * 60 * 24)
      );
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Assign Employees
export const assignProject = async (req, res) => {
  try {
    const { employeeIds } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const employees = await Employee.find({
      _id: { $in: employeeIds },
    });

    if (!employees.length) {
      return res.status(404).json({
        success: false,
        message: "Employees not found",
      });
    }

    project.assignedEmployees = employeeIds;

    await project.save();

    res.json({
      success: true,
      message: "Project assigned successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};