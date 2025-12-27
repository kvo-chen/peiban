import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 定义OperationLog模型的属性接口
interface OperationLogAttributes {
  id: number;
  user_id: number;
  username: string;
  operation: string;
  module: string;
  ip: string;
  user_agent: string;
  status: 'success' | 'failed';
  details: string;
  created_at: Date;
}

// 定义创建OperationLog时可选的属性
interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'created_at'> {}

// 定义OperationLog模型
class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public user_id!: number;
  public username!: string;
  public operation!: string;
  public module!: string;
  public ip!: string;
  public user_agent!: string;
  public status!: 'success' | 'failed';
  public details!: string;
  public created_at!: Date;
}

// 初始化OperationLog模型
OperationLog.init(
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
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
      defaultValue: 'success',
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default OperationLog;