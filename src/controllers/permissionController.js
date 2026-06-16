import Permission from '../models/Permission.js';

export const getPermissions = async (req, res) => {
  try {
    const { module } = req.query;
    const where = {};

    if (module) {
      where.module = module;
    }

    const permissions = await Permission.findAll({
      where,
      order: [['module', 'ASC'], ['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
};

export const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permission',
      error: error.message
    });
  }
};

export const createPermission = async (req, res) => {
  try {
    const { name, description, module } = req.body;

    const permission = await Permission.create({
      name,
      description,
      module
    });

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating permission',
      error: error.message
    });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, module } = req.body;

    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    await permission.update({
      name: name || permission.name,
      description: description !== undefined ? description : permission.description,
      module: module || permission.module
    });

    res.status(200).json({
      success: true,
      message: 'Permission updated successfully',
      data: permission
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message
    });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    await permission.destroy();

    res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting permission',
      error: error.message
    });
  }
};
