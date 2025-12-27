import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// 创建Sequelize实例 - 使用SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

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
  } catch (error) {
    console.error(`Error connecting to SQLite: ${error}`);
    process.exit(1);
  }
};

export { sequelize, connectDB };