"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_1 = __importDefault(require("./User"));
const Device_1 = __importDefault(require("./Device"));
// 定义Conversation模型
class Conversation extends sequelize_1.Model {
}
// 初始化Conversation模型
Conversation.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    device_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Device_1.default,
            key: 'id',
        },
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    response: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    action_triggered: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
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
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Conversation;
//# sourceMappingURL=Conversation.js.map