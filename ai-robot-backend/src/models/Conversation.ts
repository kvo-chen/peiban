import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import User from './User';
import Device from './Device';

// 定义Conversation模型的属性接口
interface ConversationAttributes {
  id: number;
  user_id: number;
  device_id: number;
  message: string;
  response: string;
  action_triggered: string | null;
  created_at: Date;
  updated_at: Date;
}

// 定义创建Conversation时可选的属性
interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'created_at' | 'updated_at' | 'response' | 'action_triggered'> {}

// 定义Conversation模型
class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: number;
  public user_id!: number;
  public device_id!: number;
  public message!: string;
  public response!: string;
  public action_triggered!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

// 初始化Conversation模型
Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    device_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Device,
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    action_triggered: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
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
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 添加索引，提高查询性能
    indexes: [
      // 按用户查询对话
      { name: 'idx_conversation_user_id', fields: ['user_id'] },
      // 按设备查询对话
      { name: 'idx_conversation_device_id', fields: ['device_id'] },
      // 按用户和设备查询对话
      { name: 'idx_conversation_user_device', fields: ['user_id', 'device_id'] },
      // 按创建时间排序查询
      { name: 'idx_conversation_created_at', fields: ['created_at', 'user_id', 'device_id'] }
    ]
  }
);

export default Conversation;