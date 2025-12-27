import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import Device from './Device';
import DeviceGroup from './DeviceGroup';

// 定义DeviceGroupRelation模型的属性接口
interface DeviceGroupRelationAttributes {
  id: number;
  device_id: number;
  group_id: number;
  created_at: Date;
  updated_at: Date;
}

// 定义创建DeviceGroupRelation时可选的属性
interface DeviceGroupRelationCreationAttributes extends Optional<DeviceGroupRelationAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义DeviceGroupRelation模型
class DeviceGroupRelation extends Model<DeviceGroupRelationAttributes, DeviceGroupRelationCreationAttributes> implements DeviceGroupRelationAttributes {
  public id!: number;
  public device_id!: number;
  public group_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

// 初始化DeviceGroupRelation模型
DeviceGroupRelation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    device_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Device,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: DeviceGroup,
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    tableName: 'device_group_relations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['device_id', 'group_id'],
      },
    ],
  }
);

// 定义关联关系
// 暂时注释掉关联关系，避免循环引用导致初始化失败
// DeviceGroupRelation.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });
// DeviceGroupRelation.belongsTo(DeviceGroup, { foreignKey: 'group_id', as: 'group' });

export default DeviceGroupRelation;
