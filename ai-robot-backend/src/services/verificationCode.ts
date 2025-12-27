// 验证码服务，用于处理验证码的生成、存储和验证

// 存储验证码的接口
interface VerificationCode {
  code: string;
  expiresAt: number;
  attempts: number;
}

// 存储验证码的内存数据库（生产环境应使用Redis等持久化存储）
const verificationCodes: Map<string, VerificationCode> = new Map();

// 验证码有效期（分钟）
const CODE_EXPIRY_MINUTES = 5;

// 最大尝试次数
const MAX_ATTEMPTS = 5;

/**
 * 生成6位随机验证码
 */
export const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 发送验证码（演示版，实际应集成短信服务）
 * @param phone 手机号
 * @returns 生成的验证码
 */
export const sendVerificationCode = async (phone: string): Promise<string> => {
  // 检查是否已经发送过验证码，如果未过期则不重新发送
  const existingCode = verificationCodes.get(phone);
  if (existingCode && existingCode.expiresAt > Date.now()) {
    throw new Error('验证码未过期，请勿重复请求');
  }

  // 生成新的验证码
  const code = generateCode();
  const expiresAt = Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000;

  // 存储验证码
  verificationCodes.set(phone, {
    code,
    expiresAt,
    attempts: 0
  });

  // 演示：打印验证码到控制台
  console.log(`[验证码] 发送到手机号 ${phone}: ${code}，有效期 ${CODE_EXPIRY_MINUTES} 分钟`);

  // 实际项目中，这里应该调用短信服务API发送验证码
  // 例如：await smsService.sendSms(phone, `您的验证码是：${code}，请勿泄露给他人`);

  return code;
};

/**
 * 验证验证码
 * @param phone 手机号
 * @param code 验证码
 * @returns 是否验证通过
 */
export const verifyCode = (phone: string, code: string): boolean => {
  const verificationCode = verificationCodes.get(phone);

  // 检查验证码是否存在
  if (!verificationCode) {
    return false;
  }

  // 检查验证码是否过期
  if (verificationCode.expiresAt < Date.now()) {
    verificationCodes.delete(phone);
    return false;
  }

  // 检查验证码尝试次数
  if (verificationCode.attempts >= MAX_ATTEMPTS) {
    verificationCodes.delete(phone);
    return false;
  }

  // 检查验证码是否正确
  if (verificationCode.code === code) {
    // 验证成功，删除验证码
    verificationCodes.delete(phone);
    return true;
  } else {
    // 验证失败，增加尝试次数
    verificationCodes.set(phone, {
      ...verificationCode,
      attempts: verificationCode.attempts + 1
    });
    return false;
  }
};

/**
 * 清除过期的验证码
 */
export const cleanupExpiredCodes = (): void => {
  const now = Date.now();
  for (const [phone, code] of verificationCodes.entries()) {
    if (code.expiresAt < now) {
      verificationCodes.delete(phone);
    }
  }
};

// 每小时清除一次过期的验证码
setInterval(cleanupExpiredCodes, 60 * 60 * 1000);
