import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 定义AnomalyLog模型的属性接口
interface AnomalyLogAttributes {
  id: number;
  user_id: number;
  username: string;
  event_type: 'failed_login' | 'multiple_login_attempts' | 'unusual_location' | 'suspicious_operation' | 'mfa_failure';
  ip: string;
  location: string;
  user_agent: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  status: 'unresolved' | 'resolved' | 'ignored';
  created_at: Date;
  resolved_at: Date | null;
  resolved_by: number | null;
}

// 定义创建AnomalyLog时可选的属性
interface AnomalyLogCreationAttributes extends Optional<AnomalyLogAttributes, 'id' | 'created_at' | 'resolved_at' | 'resolved_by'> {}

// 定义AnomalyLog模型
class AnomalyLog extends Model<AnomalyLogAttributes, AnomalyLogCreationAttributes> implements AnomalyLogAttributes {
  public id!: number;
  public user_id!: number;
  public username!: string;
  public event_type!: 'failed_login' | 'multiple_login_attempts' | 'unusual_location' | 'suspicious_operation' | 'mfa_failure';
  public ip!: string;
  public location!: string;
  public user_agent!: string;
  public details!: string;
  public severity!: 'low' | 'medium' | 'high';
  public status!: 'unresolved' | 'resolved' | 'ignored';
  public created_at!: Date;
  public resolved_at!: Date | null;
  public resolved_by!: number | null;
}

// 初始化AnomalyLog模型
AnomalyLog.init(
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
    event_type: {
      type: DataTypes.ENUM('failed_login', 'multiple_login_attempts', 'unusual_location', 'suspicious_operation', 'mfa_failure'),
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('unresolved', 'resolved', 'ignored'),
      allowNull: false,
      defaultValue: 'unresolved',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolved_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'anomaly_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default AnomalyLog;