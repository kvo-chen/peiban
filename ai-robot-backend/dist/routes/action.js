"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const action_1 = require("../controllers/action");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// 获取动作列表
router.get('/', auth_1.default, action_1.getActions);
// 创建新动作
router.post('/', auth_1.default, action_1.createAction);
// 获取单个动作信息
router.get('/:id', auth_1.default, action_1.getAction);
// 更新动作信息
router.put('/:id', auth_1.default, action_1.updateAction);
// 删除动作
router.delete('/:id', auth_1.default, action_1.deleteAction);
// 执行动作或动作组合
router.post('/execute', auth_1.default, action_1.executeAction);
exports.default = router;
//# sourceMappingURL=action.js.map