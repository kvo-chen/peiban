"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const Device_1 = __importDefault(require("./Device"));
const Action_1 = __importDefault(require("./Action"));
// 定义DeviceAction模型
class DeviceAction extends sequelize_1.Model {
}
// 初始化DeviceAction模型
DeviceAction.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    device_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Device_1.default,
            key: 'id',
        },
    },
    action_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Action_1.default,
            key: 'id',
        },
    },
    prompt: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
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
    tableName: 'device_actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['device_id', 'action_id'],
        },
    ],
});
// 定义关联关系
DeviceAction.belongsTo(Action_1.default, { foreignKey: 'action_id', as: 'action' });
DeviceAction.belongsTo(Device_1.default, { foreignKey: 'device_id', as: 'device' });
exports.default = DeviceAction;
//# sourceMappingURL=DeviceAction.js.map