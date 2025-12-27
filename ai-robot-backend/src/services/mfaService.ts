import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// MFA服务类
class MFAService {
  // 生成MFA密钥
  static generateSecret(): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: 'AI陪伴机器人'
    });
    
    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url || ''
    };
  }
  
  // 生成MFA二维码
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpauthUrl);
  }
  
  // 验证MFA验证码
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // 允许1分钟的时间误差
    });
  }
  
  // 生成恢复码
  static generateRecoveryCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase() + 
                   '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
  
  // 验证恢复码
  static verifyRecoveryCode(storedCodes: string[], code: string): { valid: boolean; updatedCodes: string[] } {
    const codes = storedCodes.filter(c => c.trim() !== '');
    const index = codes.indexOf(code);
    
    if (index === -1) {
      return { valid: false, updatedCodes: codes };
    }
    
    // 移除已使用的恢复码
    const updatedCodes = [...codes];
    updatedCodes.splice(index, 1);
    
    return { valid: true, updatedCodes };
  }
}

export default MFAService;