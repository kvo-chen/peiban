import CryptoJS from 'crypto-js';

// 加密服务类
class EncryptionService {
  private secretKey: string;
  private iv: string;
  
  constructor() {
    // 使用环境变量中的密钥，或生成一个默认密钥（生产环境应该使用安全的密钥）
    this.secretKey = process.env.ENCRYPTION_KEY || 'default_secret_key_for_development_only';
    this.iv = process.env.ENCRYPTION_IV || 'default_iv_for_development';
    
    // 确保密钥长度符合AES-256要求（32字节）
    if (this.secretKey.length !== 32) {
      this.secretKey = CryptoJS.SHA256(this.secretKey).toString();
    }
    
    // 确保IV长度符合要求（16字节）
    if (this.iv.length !== 16) {
      this.iv = CryptoJS.MD5(this.iv).toString().substring(0, 16);
    }
  }
  
  // 加密数据
  encrypt(data: string): string {
    try {
      const ciphertext = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(this.secretKey), {
        iv: CryptoJS.enc.Utf8.parse(this.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return ciphertext.toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }
  
  // 解密数据
  decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(this.secretKey), {
        iv: CryptoJS.enc.Utf8.parse(this.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }
  
  // 数据脱敏
  maskData(data: string, type: 'email' | 'phone' | 'idcard'): string {
    switch (type) {
      case 'email':
        return data.replace(/(\w{2})\w*(\w{2}@\w+\.\w+)/, '$1****$2');
      case 'phone':
        return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      case 'idcard':
        return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
      default:
        return data;
    }
  }
}

export default new EncryptionService();