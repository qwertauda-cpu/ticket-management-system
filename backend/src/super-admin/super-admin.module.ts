import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminGuard } from './super-admin.guard';
import { AuthModule } from '../auth/auth.module';
import { requireEnv } from '../auth/auth.util';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: requireEnv('JWT_SECRET'),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, SuperAdminGuard],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}

