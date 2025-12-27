"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// 创建Sequelize实例 - 使用SQLite
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: path_1.default.join(__dirname, '..', 'database.sqlite'),
    logging: false,
    define: {
        timestamps: true,
        underscored: true,
    },
});
exports.sequelize = sequelize;
// 测试数据库连接
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite Connected successfully!');
        // 同步模型到数据库
        await sequelize.sync({
            alter: true, // 自动修改表结构，开发环境使用
            // force: true, // 强制删除并重新创建表，谨慎使用
        });
        console.log('Database synchronized!');
        return sequelize;
    }
    catch (error) {
        console.error(`Error connecting to SQLite: ${error}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map