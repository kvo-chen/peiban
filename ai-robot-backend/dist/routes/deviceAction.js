"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deviceAction_1 = require("../controllers/deviceAction");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// 获取设备的动作列表
router.get('/:deviceId', auth_1.default, deviceAction_1.getDeviceActions);
// 为设备添加动作映射
router.post('/', auth_1.default, deviceAction_1.addDeviceAction);
// 更新设备动作映射
router.put('/:id', auth_1.default, deviceAction_1.updateDeviceAction);
// 删除设备动作映射
router.delete('/:id', auth_1.default, deviceAction_1.deleteDeviceAction);
exports.default = router;
//# sourceMappingURL=deviceAction.js.map