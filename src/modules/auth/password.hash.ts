import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordHash {
    async hash(password: string): Promise<string> {
        return await argon2.hash(password);
    }

    async verify(
        hashedPassword: string,
        passwordText: string,
    ): Promise<boolean> {
        return await argon2.verify(hashedPassword, passwordText);
    }
}
