import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { promisify } from 'util';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;

  async encrypt(data: string, key: string): Promise<string> {
    const iv = crypto.randomBytes(this.ivLength);
    const salt = crypto.randomBytes(this.saltLength);
    
    const derivedKey = await this.deriveKey(key, salt);
    
    const cipher = crypto.createCipheriv(this.algorithm, derivedKey, iv, {
      authTagLength: this.tagLength
    });
    
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    // 暗号化されたデータ、IV、ソルト、認証タグを結合
    const result = Buffer.concat([salt, iv, tag, encrypted]);
    
    return result.toString('base64');
  }

  async decrypt(encryptedData: string, key: string): Promise<string> {
    const data = Buffer.from(encryptedData, 'base64');
    
    const salt = data.slice(0, this.saltLength);
    const iv = data.slice(this.saltLength, this.saltLength + this.ivLength);
    const tag = data.slice(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength
    );
    const encrypted = data.slice(this.saltLength + this.ivLength + this.tagLength);
    
    const derivedKey = await this.deriveKey(key, salt);
    
    const decipher = crypto.createDecipheriv(this.algorithm, derivedKey, iv, {
      authTagLength: this.tagLength
    });
    
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  }

  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    const pbkdf2 = promisify(crypto.pbkdf2);
    return pbkdf2(password, salt, 100000, this.keyLength, 'sha512');
  }
} 