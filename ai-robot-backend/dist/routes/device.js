"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const device_1 = require("../controllers/device");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// 获取设备列表
router.get('/', auth_1.default, device_1.getDevices);
// 绑定新设备
router.post('/', auth_1.default, device_1.addDevice);
// 获取单个设备信息
router.get('/:id', auth_1.default, device_1.getDevice);
// 更新设备信息
router.put('/:id', auth_1.default, device_1.updateDevice);
// 解绑设备
router.delete('/:id', auth_1.default, device_1.removeDevice);
exports.default = router;
//# sourceMappingURL=device.js.map