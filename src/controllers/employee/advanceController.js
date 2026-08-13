import Advance from "../../models/Advance.js";
import Employee from "../../models/Employee.js";

// Employee chaibe  advance
// export const requestAdvance = async (req, res) => {
//   try {
//     const { amount } = req.body;

    
//     if (!amount) {
//       return res.status(400).json({
//         success: false,
//         message: "Advance amount is required",
//       });
//     }

//     if (Number(amount) <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Advance amount must be greater than 0",
//       });
//     }

    
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

    
//     const advance = await Advance.create({
//       employee: employee._id,
//       amount: Number(amount),
//     });

//     res.status(201).json({
//       success: true,
//       message: "Advance request submitted successfully",
//       advance,
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



export const requestAdvance = async (req, res) => {
  try {
    const { amount } = req.body;

    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Advance amount is required",
      });
    }

    if (Number(amount) <= 1000) {
      return res.status(400).json({
        success: false,
        message: "Advance amount must be greater than 1000",
      });
    }

    
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

    // ata check korbe pending request
    const pendingRequest = await Advance.findOne({
      employee: employee._id,
      status: "Pending",
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending advance request",
      });
    }

   
    const advance = await Advance.create({
      employee: employee._id,
      amount: Number(amount),
    });

    res.status(201).json({
      success: true,
      message: "Advance request submitted successfully",
      advance,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMyAdvances = async (req, res) => {
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

    const advances = await Advance.find({
      employee: employee._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      total: advances.length,
      advances,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};