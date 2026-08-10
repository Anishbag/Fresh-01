import User from "../../models/User.js";
import Employee from "../../models/Employee.js";


   // Create Employee
    


export const createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      role,
      department,
      salary,
      joiningDate,
      idProof,
      pan,
      bankAccount,
      emergencyContact,
      address,
      status,
      customFields, //new wass
    } = req.body;

    const profileImage = req.file ? req.file.path : "";

    // Validation
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !role ||
      !department ||
      !salary ||
      !joiningDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check Email Exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create Login Account
    const user = await User.create({
      name: fullName,
      email,
      password,
      role: "employee",
      isActive: status === "Active",
    });

    // Generate Employee ID
    // const totalEmployee = await Employee.countDocuments();

    // const employeeId =
    //   "EMP" + String(totalEmployee + 1).padStart(4, "0");

    // Generate Employee ID
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });

    let employeeId = "EMP0001";

    if (lastEmployee && lastEmployee.employeeId) {
      const lastNumber = parseInt(
        lastEmployee.employeeId.replace("EMP", ""),
        10,
      );

      employeeId = "EMP" + String(lastNumber + 1).padStart(4, "0");
    }

    // Create Employee Profile
    const employee = await Employee.create({
      userId: user._id,
      employeeId,
      fullName,
      email,
      phone,
      role,
      department,
      salary,
      joiningDate,
      idProof,
      pan,
      bankAccount,
      emergencyContact,
      address,
      status,
      profileImage,
      customFields, // new wass
    });

    res.status(201).json({
      success: true,
      message: "Employee Created Successfully",
      employee,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


    // Get All Employees
    


export const getEmployees = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ],
    };

    const totalEmployees = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalEmployees,
      currentPage: page,
      totalPages: Math.ceil(totalEmployees / limit),
      employees,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


   // Get Single Employee
    


export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


    //Update Employee
   


export const updateEmployee = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      role,
      department,
      salary,
      joiningDate,
      idProof,
      pan,
      bankAccount,
      emergencyContact,
      address,
      status,
      customFields, // new wass
    } = req.body;

    // Find Employee
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Find User
    const user = await User.findById(employee.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Email Duplicate Check
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update User
    user.name = fullName || user.name;
    user.email = email || user.email;
    user.isActive = status === "Active";

    // Password Change
    if (password && password.trim() !== "") {
      user.password = password;
    }

    await user.save();

    // Update Employee
    employee.fullName = fullName || employee.fullName;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.role = role || employee.role;
    employee.department = department || employee.department;
    employee.salary = salary || employee.salary;
    employee.joiningDate = joiningDate || employee.joiningDate;
    employee.idProof = idProof || employee.idProof;
    employee.pan = pan || employee.pan;
    employee.bankAccount = bankAccount || employee.bankAccount;
    employee.emergencyContact = emergencyContact || employee.emergencyContact;
    employee.address = address || employee.address;
    employee.status = status || employee.status;

    if (req.file) {
      employee.profileImage = req.file.path;
    }
// new wass
    if (customFields) {
      employee.customFields = customFields;
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee Updated Successfully",
      employee,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


    //Delete Employee
  


export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Delete Login User
    await User.findByIdAndDelete(employee.userId);

    // Delete Employee Profile
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Employee Deleted Successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
