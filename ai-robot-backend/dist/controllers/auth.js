"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneLogin = exports.sendCode = exports.getCurrentUser = exports.login = exports.register = void 0;
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verificationCode_1 = require("../services/verificationCode");
// 注册用户
const register = async (req, res) => {
    try {
        console.log('Received registration request:', req.body);
        const { username, email, password } = req.body;
        // 检查用户是否已存在
        console.log('Checking if user exists:', username, email);
        const userExists = await User_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { username },
                    { email }
                ]
            }
        });
        if (userExists) {
            console.log('User already exists:', username, email);
            return res.status(400).json({ message: 'User already exists' });
        }
        // 创建新用户
        console.log('Creating new user:', username, email);
        const user = await User_1.default.create({ username, email, password, role_id: 2, status: 'active' });
        console.log('User created successfully:', user.id);
        // 生成JWT令牌（简化版本，不使用expiresIn选项）
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret_key');
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error.message);
        console.error('Error stack:', error.stack);
        if (error.name === 'SequelizeValidationError') {
            // 处理验证错误，返回更友好的信息
            const validationErrors = error.errors.map((err) => ({
                field: err.path,
                message: err.message
            }));
            res.status(400).json({
                message: 'Validation error',
                errors: validationErrors
            });
        }
        else {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};
exports.register = register;
// 登录用户
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 检查用户是否存在
        const user = await User_1.default.findOne({
            where: { email }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // 检查密码是否正确
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // 生成JWT令牌（简化版本，不使用expiresIn选项）
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret_key');
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Login error:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.login = login;
// 获取当前用户信息
const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCurrentUser = getCurrentUser;
// 发送验证码
const sendCode = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: '手机号不能为空' });
        }
        // 发送验证码
        await (0, verificationCode_1.sendVerificationCode)(phone);
        res.status(200).json({ message: '验证码发送成功' });
    }
    catch (error) {
        console.error('发送验证码失败:', error.message);
        res.status(400).json({ message: error.message });
    }
};
exports.sendCode = sendCode;
// 手机号验证码登录
const phoneLogin = async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({ message: '手机号和验证码不能为空' });
        }
        // 验证验证码
        const isValid = (0, verificationCode_1.verifyCode)(phone, code);
        if (!isValid) {
            return res.status(400).json({ message: '验证码无效或已过期' });
        }
        // 查找用户
        let user = await User_1.default.findOne({ where: { phone } });
        // 如果用户不存在，自动注册
        if (!user) {
            // 生成默认用户名（使用手机号后6位）
            const defaultUsername = `user_${phone.slice(-6)}`;
            // 使用手机号作为默认邮箱
            const defaultEmail = `${phone}@example.com`;
            // 生成随机密码
            const randomPassword = Math.random().toString(36).slice(-8);
            // 创建新用户
            user = await User_1.default.create({
                username: defaultUsername,
                email: defaultEmail,
                phone,
                password: randomPassword,
                role_id: 2,
                status: 'active'
            });
        }
        // 生成JWT令牌
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret_key');
        res.status(200).json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
    }
    catch (error) {
        console.error('手机号登录失败:', error.message);
        console.error('错误栈:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.phoneLogin = phoneLogin;
//# sourceMappingURL=auth.js.map