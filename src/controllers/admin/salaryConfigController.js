import SalaryConfig from "../../models/SalaryConfig.js";

// ==========================================
// Get All Salary Configurations
// ==========================================
export const getSalaryConfigurations = async (req, res) => {
  try {
    const configs = await SalaryConfig.find().sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      total: configs.length,
      configs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Create Salary Configuration
// ==========================================
export const createSalaryConfiguration = async (req, res) => {
  try {
    const { label, type, mode, value } = req.body;

    if (!label || !type || !mode || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const alreadyExists = await SalaryConfig.findOne({
      label: label.trim(),
    });

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Configuration already exists",
      });
    }

    const config = await SalaryConfig.create({
      label: label.trim(),
      type,
      mode,
      value,
    });

    res.status(201).json({
      success: true,
      message: "Configuration added successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Salary Configuration
// ==========================================
export const updateSalaryConfiguration = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await SalaryConfig.findById(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found",
      });
    }

    config.label = req.body.label ?? config.label;
    config.type = req.body.type ?? config.type;
    config.mode = req.body.mode ?? config.mode;
    config.value = req.body.value ?? config.value;

    await config.save();

    res.status(200).json({
      success: true,
      message: "Configuration updated successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Delete Salary Configuration
// ==========================================
export const deleteSalaryConfiguration = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await SalaryConfig.findById(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found",
      });
    }

    await config.deleteOne();

    res.status(200).json({
      success: true,
      message: "Configuration deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};