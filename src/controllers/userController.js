import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { 
          model: Role, 
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ],
      attributes: ['id', 'name', 'email', 'isActive', 'roleId']
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        { 
          model: Role, 
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};
