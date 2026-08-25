import SalaryConfig from "../../models/SalaryConfig.js";

// All serary asbe

export const getSalaryConfigurations = async (req, res) => {
  try {
    const configs = await SalaryConfig.find().sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      total: configs.length,
      configs,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const saveSalaryConfigurations = async (req, res) => {
  try {
    const configs = req.body;

    if (!Array.isArray(configs) || configs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Configurations are required",
      });
    }

    const restrictedLabels = ["provident fund", "professional tax"];

    for (const item of configs) {
      if (
        !item.label ||
        !item.type ||
        !item.mode ||
        item.value === undefined ||
        item.value === null
      ) {
        return res.status(400).json({
          success: false,
          message: "Label, type, mode and value are required",
        });
      }

      if (!["Earning", "Deduction"].includes(item.type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid configuration type",
        });
      }

      if (!["% of gross", "Fixed"].includes(item.mode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid configuration mode",
        });
      }

      const value = Number(item.value);

      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Value must be a valid positive number",
        });
      }

      if (item.mode === "% of gross" && value > 100) {
        return res.status(400).json({
          success: false,
          message: "Percentage cannot be greater than 100",
        });
      }

      if (item.type === "Earning" && item.mode !== "% of gross") {
        return res.status(400).json({
          success: false,
          message: "Earning must use % of gross",
        });
      }

      const normalizedLabel = item.label.trim().toLowerCase();

      if (restrictedLabels.includes(normalizedLabel)) {
        return res.status(400).json({
          success: false,
          message:
            "Provident Fund and Professional Tax are automatically calculated and cannot be added to Salary Configuration.",
        });
      }
    }

    const earningConfigs = configs.filter((item) => item.type === "Earning");

    if (earningConfigs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one earning configuration is required",
      });
    }

    let earningPercentage = 0;

    for (const item of earningConfigs) {
      earningPercentage += Number(item.value);
    }

    earningPercentage = Number(earningPercentage.toFixed(2));

    if (earningPercentage !== 100) {
      return res.status(400).json({
        success: false,
        message: `Total earning percentage must be exactly 100%. Current total is ${earningPercentage}%.`,
      });
    }

    await SalaryConfig.deleteMany({});

    const savedConfigs = await SalaryConfig.insertMany(
      configs.map((item) => ({
        label: item.label.trim(),

        type: item.type,

        mode: item.mode,

        value: Number(item.value),
      })),
    );

    res.status(200).json({
      success: true,

      message: "Salary configurations saved successfully",

      total: savedConfigs.length,

      earningPercentage,

      configs: savedConfigs,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
