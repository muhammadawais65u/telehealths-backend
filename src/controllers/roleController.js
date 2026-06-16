import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, as: 'permissions' }]
    });

    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message
    });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message
    });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;

    const role = await Role.create({
      name,
      description
    });

    if (permissionIds && permissionIds.length > 0) {
      await role.setPermissions(permissionIds);
    }

    const roleWithPermissions = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: roleWithPermissions
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await role.update({
      name: name || role.name,
      description: description !== undefined ? description : role.description
    });

    if (permissionIds !== undefined) {
      await role.setPermissions(permissionIds);
    }

    const updatedRole = await Role.findByPk(id, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent deletion of default roles
    if (['admin', 'employee', 'client'].includes(role.name)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default roles'
      });
    }

    await role.destroy();

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
};

export const assignPermissionsToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    await role.setPermissions(permissionIds);

    const updatedRole = await Role.findByPk(id, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    res.status(200).json({
      success: true,
      message: 'Permissions assigned successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error assigning permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning permissions',
      error: error.message
    });
  }
};
