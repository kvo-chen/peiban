import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import Device from './Device';
import Action from './Action';

// 定义DeviceAction模型的属性接口
interface DeviceActionAttributes {
  id: number;
  device_id: number;
  action_id: number;
  prompt: string;
  created_at: Date;
  updated_at: Date;
}

// 定义创建DeviceAction时可选的属性
interface DeviceActionCreationAttributes extends Optional<DeviceActionAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义DeviceAction模型
class DeviceAction extends Model<DeviceActionAttributes, DeviceActionCreationAttributes> implements DeviceActionAttributes {
  public id!: number;
  public device_id!: number;
  public action_id!: number;
  public prompt!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// 初始化DeviceAction模型
DeviceAction.init(
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
    },
    action_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Action,
        key: 'id',
      },
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
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
    tableName: 'device_actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['device_id', 'action_id'],
        name: 'idx_device_action_unique'
      },
      // 添加设备ID索引，提高按设备查询动作的性能
      {
        name: 'idx_device_action_device_id',
        fields: ['device_id']
      },
      // 添加动作ID索引，提高按动作查询设备的性能
      {
        name: 'idx_device_action_action_id',
        fields: ['action_id']
      }
    ],
  }
);

// 定义关联关系
DeviceAction.belongsTo(Action, { foreignKey: 'action_id', as: 'action' });
DeviceAction.belongsTo(Device, { foreignKey: 'device_id', as: 'device' });

export default DeviceAction;