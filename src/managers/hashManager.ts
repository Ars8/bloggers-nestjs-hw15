import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HashManager {
  constructor(private readonly configService: ConfigService) {}
  private hashSalt = this.configService.get<number>('hashSalt');
  async generateHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(this.hashSalt);
    return bcrypt.hash(password, passwordSalt);
  }
  async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
