import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 定义RolePermission模型的属性接口
interface RolePermissionAttributes {
  id: number;
  role_id: number;
  permission_id: number;
  created_at: Date;
}

// 定义创建RolePermission时可选的属性
interface RolePermissionCreationAttributes extends Optional<RolePermissionAttributes, 'id' | 'created_at'> {}

// 定义RolePermission模型
class RolePermission extends Model<RolePermissionAttributes, RolePermissionCreationAttributes> implements RolePermissionAttributes {
  public id!: number;
  public role_id!: number;
  public permission_id!: number;
  public created_at!: Date;
}

// 初始化RolePermission模型
RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default RolePermission;