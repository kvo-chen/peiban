import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import DeviceGroupRelation from './DeviceGroupRelation';
import DeviceGroup from './DeviceGroup';

// 定义Device模型的属性接口
interface DeviceAttributes {
  id: number;
  user_id: number;
  device_name: string;
  device_type: string;
  status: 'online' | 'offline';
  created_at: Date;
  updated_at: Date;
}

// 定义创建Device时可选的属性
interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'id' | 'status' | 'created_at' | 'updated_at'> {}

// 定义Device模型
class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
  public id!: number;
  public user_id!: number;
  public device_name!: string;
  public device_type!: string;
  public status!: 'online' | 'offline';
  public created_at!: Date;
  public updated_at!: Date;
}

// 初始化Device模型
Device.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    device_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    device_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    status: {
      type: DataTypes.ENUM('online', 'offline'),
      allowNull: false,
      defaultValue: 'offline',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'devices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 添加索引，提高查询性能
    indexes: [
      { name: 'idx_device_user_id', fields: ['user_id'] },
      { name: 'idx_device_status', fields: ['status'] }
    ]
  }
);

// 定义关联关系
// 暂时注释掉关联关系，避免循环引用导致初始化失败
// Device.hasMany(DeviceGroupRelation, { foreignKey: 'device_id', as: 'groupRelations' });
// Device.belongsToMany(DeviceGroup, {
//   through: DeviceGroupRelation,
//   foreignKey: 'device_id',
//   otherKey: 'group_id',
//   as: 'groups'
// });

export default Device;