import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import DeviceGroupRelation from './DeviceGroupRelation';
import Device from './Device';

// 定义DeviceGroup模型的属性接口
interface DeviceGroupAttributes {
  id: number;
  user_id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

// 定义创建DeviceGroup时可选的属性
interface DeviceGroupCreationAttributes extends Optional<DeviceGroupAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义DeviceGroup模型
class DeviceGroup extends Model<DeviceGroupAttributes, DeviceGroupCreationAttributes> implements DeviceGroupAttributes {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public description!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// 初始化DeviceGroup模型
DeviceGroup.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'device_groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// 定义关联关系
// 暂时注释掉关联关系，避免循环引用导致初始化失败
// DeviceGroup.hasMany(DeviceGroupRelation, { foreignKey: 'group_id', as: 'deviceRelations' });
// DeviceGroup.belongsToMany(Device, {
//   through: DeviceGroupRelation,
//   foreignKey: 'group_id',
//   otherKey: 'device_id',
//   as: 'devices'
// });

export default DeviceGroup;
