import SalarySlip from "../../models/SalarySlip.js";
import Employee from "../../models/Employee.js";

const getCustomFieldValue = (customFields, labels = []) => {
  const normalizedLabels = labels.map((label) =>
    label.trim().toLowerCase().replace(/\s+/g, " "),
  );

  return (
    customFields?.find((field) => {
      const fieldLabel = field.label?.trim().toLowerCase().replace(/\s+/g, " ");

      return normalizedLabels.includes(fieldLabel);
    })?.value || ""
  );
};

// My Salary Slips

export const mySalarySlips = async (req, res) => {
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

    const salaries = await SalarySlip.find({
      employee: employee._id,
    })
      .populate(
        "employee",
        "employeeId fullName email phone department designation bankAccount joiningDate pan customFields",
      )
      .sort({
        year: -1,
        month: -1,
      });

    res.status(200).json({
      success: true,
      total: salaries.length,
      salaries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  Salary Slip Dekha

export const viewSalarySlip = async (req, res) => {
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

    const salary = await SalarySlip.findOne({
      _id: req.params.id,
      employee: employee._id,
    }).populate(
      "employee",
      "employeeId fullName email phone department designation bankAccount joiningDate pan customFields",
    );

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }

    const customFields = salary.employee?.customFields || [];

    const employeeInfo = {
      panNumber: salary.employee?.pan || "",

      uanNumber: getCustomFieldValue(customFields, [
        "UAN",
        "UAN No",
        "UAN Number",
      ]),

      esiNumber: getCustomFieldValue(customFields, [
        "ESI",
        "ESI No",
        "ESI Number",
      ]),

      dob: getCustomFieldValue(customFields, [
        "DOB",
        "Date of Birth",
        "Birth Date",
        "Birthdate",
      ]),

      bankName: getCustomFieldValue(customFields, [
        "Bank",
        "Bank Name",
        "Name Bank",
        "Banking Name",
      ]),

      joiningDate: salary.employee?.joiningDate,

      bankAccount: salary.employee?.bankAccount,
    };

    res.status(200).json({
      success: true,
      salary,
      employeeInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
