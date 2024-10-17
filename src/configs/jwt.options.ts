import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const JwtOptions: JwtModuleAsyncOptions = {
  global: true,
  useFactory: async () => ({
    secret: 'yourSecretKey',
    signOptions: { expiresIn: '15m' },
  }),
};
