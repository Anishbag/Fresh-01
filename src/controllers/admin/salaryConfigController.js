// import SalaryConfig from "../../models/SalaryConfig.js";

// // ==========================================
// // Get All Salary Configurations
// // ==========================================
// export const getSalaryConfigurations = async (req, res) => {
//   try {
//     const configs = await SalaryConfig.find().sort({ createdAt: 1 });

//     res.status(200).json({
//       success: true,
//       total: configs.length,
//       configs,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ==========================================
// // Create Salary Configuration
// // ==========================================
// export const createSalaryConfiguration = async (req, res) => {
//   try {
//     const { label, type, mode, value } = req.body;

//     if (!label || !type || !mode || value === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const alreadyExists = await SalaryConfig.findOne({
//       label: label.trim(),
//     });

//     if (alreadyExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Configuration already exists",
//       });
//     }

//     const config = await SalaryConfig.create({
//       label: label.trim(),
//       type,
//       mode,
//       value,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Configuration added successfully",
//       config,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ==========================================
// // Update Salary Configuration
// // ==========================================
// export const updateSalaryConfiguration = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const config = await SalaryConfig.findById(id);

//     if (!config) {
//       return res.status(404).json({
//         success: false,
//         message: "Configuration not found",
//       });
//     }

//     config.label = req.body.label ?? config.label;
//     config.type = req.body.type ?? config.type;
//     config.mode = req.body.mode ?? config.mode;
//     config.value = req.body.value ?? config.value;

//     await config.save();

//     res.status(200).json({
//       success: true,
//       message: "Configuration updated successfully",
//       config,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ==========================================
// // Delete Salary Configuration
// // ==========================================
// export const deleteSalaryConfiguration = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const config = await SalaryConfig.findById(id);

//     if (!config) {
//       return res.status(404).json({
//         success: false,
//         message: "Configuration not found",
//       });
//     }

//     await config.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: "Configuration deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };






import SalaryConfig from "../../models/SalaryConfig.js";


// Get All Salary Configurations

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


// Save Salary Configurations

export const saveSalaryConfigurations = async (req, res) => {
  try {
    const configs = req.body;

    if (!Array.isArray(configs) || configs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Configurations are required",
      });
    }

    // Validation
    for (const item of configs) {
      if (
        !item.label ||
        !item.type ||
        !item.mode ||
        item.value === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
    }

    // Remove old configurations
    await SalaryConfig.deleteMany({});

    // Save new configurations
    const savedConfigs = await SalaryConfig.insertMany(
      configs.map((item) => ({
        label: item.label.trim(),
        type: item.type,
        mode: item.mode,
        value: item.value,
      }))
    );

    res.status(200).json({
      success: true,
      message: "Salary configurations saved successfully",
      total: savedConfigs.length,
      configs: savedConfigs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Salary Configuration

export const deleteSalaryConfiguration = async (req, res) => {
  try {
    const config = await SalaryConfig.findById(req.params.id);

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