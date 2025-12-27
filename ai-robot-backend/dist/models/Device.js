"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
// 定义Device模型
class Device extends sequelize_1.Model {
}
// 初始化Device模型
Device.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    device_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100],
        },
    },
    device_type: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 50],
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('online', 'offline'),
        allowNull: false,
        defaultValue: 'offline',
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
    tableName: 'devices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
// 定义关联关系
// 暂时注释掉关联关系，避免循环引用导致初始化失败
// Device.hasMany(DeviceGroupRelation, { foreignKey: 'device_id', as: 'groupRelations' });
// Device.belongsToMany(DeviceGroup, {
//   through: DeviceGroupRelation,
//   foreignKey: 'device_id',
//   otherKey: 'group_id',
//   as: 'groups'
// });
exports.default = Device;
//# sourceMappingURL=Device.js.map