"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
// 定义Action模型
class Action extends sequelize_1.Model {
}
// 初始化Action模型
Action.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [1, 100],
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('basic', 'custom', 'combination'),
        allowNull: false,
        defaultValue: 'basic',
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    steps: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        // 将steps存储为JSON字符串，支持基本动作步骤和动作组合
        get() {
            const value = this.getDataValue('steps');
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('steps', JSON.stringify(value));
            }
            else {
                this.setDataValue('steps', value);
            }
        },
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Action;
//# sourceMappingURL=Action.js.map