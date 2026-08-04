import Role from "../../models/Role.js";

/*
    Create Role
    POST : /api/admin/roles
*/

export const createRole = async (req, res) => {
  try {
    const { roleName, description, status } = req.body;

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const existingRole = await Role.findOne({ roleName });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role already exists",
      });
    }

    const role = await Role.create({
      roleName,
      description,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
    Get All Roles
    GET : /api/admin/roles
*/

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: roles.length,
      roles,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
    Update Role
    PUT : /api/admin/roles/:id
*/

export const updateRole = async (req, res) => {
  try {
    const { roleName, description, status } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (roleName && roleName !== role.roleName) {
      const exists = await Role.findOne({ roleName });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Role already exists",
        });
      }
    }

    role.roleName = roleName || role.roleName;
    role.description = description || role.description;
    role.status = status || role.status;

    await role.save();

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
    Delete Role
    DELETE : /api/admin/roles/:id
*/

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};