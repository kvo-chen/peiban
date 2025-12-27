"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = require("../controllers/chat");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// AI对话
router.post('/', auth_1.default, chat_1.chatWithAI);
// 获取对话历史
router.get('/:deviceId', auth_1.default, chat_1.getChatHistory);
exports.default = router;
//# sourceMappingURL=chat.js.map