import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// 定义Action模型的属性接口
interface ActionAttributes {
  id: number;
  name: string;
  description: string;
  type: 'basic' | 'custom' | 'combination';
  duration: number;
  steps: string;
  created_at: Date;
  updated_at: Date;
}

// 定义创建Action时可选的属性
interface ActionCreationAttributes extends Optional<ActionAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义Action模型
class Action extends Model<ActionAttributes, ActionCreationAttributes> implements ActionAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public type!: 'basic' | 'custom' | 'combination';
  public duration!: number;
  public steps!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// 初始化Action模型
Action.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('basic', 'custom', 'combination'),
      allowNull: false,
      defaultValue: 'basic',
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    steps: {
      type: DataTypes.TEXT,
      allowNull: false,
      // 将steps存储为JSON字符串，支持基本动作步骤和动作组合
      get() {
        const value = this.getDataValue('steps');
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      },
      set(value: string[] | number[] | string) {
        if (Array.isArray(value)) {
          this.setDataValue('steps', JSON.stringify(value));
        } else {
          this.setDataValue('steps', value);
        }
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
    tableName: 'actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 添加索引，提高查询性能
    indexes: [
      // 按名称查询索引，用于精确查询
      { name: 'idx_action_name', fields: ['name'], unique: true },
      // 按类型查询索引，用于按动作类型过滤
      { name: 'idx_action_type', fields: ['type'] },
      // 按创建时间查询索引，用于按时间排序
      { name: 'idx_action_created_at', fields: ['created_at'] },
    ],
  }
);

export default Action;