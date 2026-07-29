import Employee from "../../models/Employee.js";
import WorkFromHome from "../../models/WorkFromHome.js";

export const applyWFH = async (req, res) => {
  try {
    // const employee = await Employee.findOne({
    //   userId: req.user._id,
    //   isDeleted: false,
    // });

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

    const { fromDate, toDate, reason } = req.body;

    const request = await WorkFromHome.create({
      employee: employee._id,
      fromDate,
      toDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "WFH request submitted successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const myWFHHistory = async (req, res) => {
  try {
    // const employee = await Employee.findOne({
    //   userId: req.user._id,
    //   isDeleted: false,
    // });



     const employee = await Employee.findOne({
       userId: req.user._id,
       status: "Active",
     });





    const requests = await WorkFromHome.find({
      employee: employee._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
