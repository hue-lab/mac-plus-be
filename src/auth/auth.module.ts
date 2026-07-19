import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshTokenSession,
  RefreshTokenSessionSchema,
} from './schema/refresh-token-session.schema';
import { getJwtSecret } from './auth.config';

@Module({
  imports: [
    UserModule,
    PassportModule,
    MongooseModule.forFeature([
      {
        name: RefreshTokenSession.name,
        schema: RefreshTokenSessionSchema,
      },
    ]),
    JwtModule.registerAsync({
      useFactory: async (_) => {
        return {
          secret: getJwtSecret(),
          signOptions: { expiresIn: process.env.JWT_ACCESS_TTL || '15m' },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
