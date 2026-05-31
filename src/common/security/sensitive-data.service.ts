import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_VERSION = 'v1';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const MASTER_KEY_LENGTH = 32;

@Injectable()
export class SensitiveDataService {
  private readonly encryptionKey: Buffer;
  private readonly lookupKey: Buffer;

  constructor(config: ConfigService) {
    const masterKey = Buffer.from(
      config.getOrThrow<string>('DATA_ENCRYPTION_KEY'),
      'base64',
    );

    if (masterKey.length !== MASTER_KEY_LENGTH) {
      throw new Error('DATA_ENCRYPTION_KEY must be a 32-byte base64 value');
    }

    this.encryptionKey = this.deriveKey(masterKey, 'data-encryption');
    this.lookupKey = this.deriveKey(masterKey, 'lookup-hash');
  }

  encrypt(value: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.encryptionKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    const ciphertext = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      ENCRYPTION_VERSION,
      iv.toString('base64'),
      authTag.toString('base64'),
      ciphertext.toString('base64'),
    ].join(':');
  }

  decrypt(encryptedValue: string): string {
    const [version, iv, authTag, ciphertext] = encryptedValue.split(':');

    if (version !== ENCRYPTION_VERSION || !iv || !authTag || !ciphertext) {
      throw new Error('Unsupported encrypted value format');
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      this.encryptionKey,
      Buffer.from(iv, 'base64'),
      {
        authTagLength: AUTH_TAG_LENGTH,
      },
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }

  createLookupHash(value: string): string {
    return createHmac('sha256', this.lookupKey).update(value).digest('hex');
  }

  private deriveKey(masterKey: Buffer, info: string): Buffer {
    return Buffer.from(
      hkdfSync('sha256', masterKey, Buffer.alloc(0), info, MASTER_KEY_LENGTH),
    );
  }
}
