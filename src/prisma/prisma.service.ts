import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { blue } from 'colorette';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly loggerTerminal = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      const transformedQuery = this.simplifyQuery(
        e.query,
        e.params,
        e.duration,
      );
      this.loggerTerminal.log(blue(transformedQuery));
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.loggerTerminal.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.loggerTerminal.log('Prisma disconnected');
  }

  private simplifyQuery(
    inputQuery: string,
    params: string,
    duration: number,
  ): string {
    try {
      const paramsObject = JSON.parse(params);

      let simplifiedQuery = inputQuery;

      paramsObject.forEach((param, index) => {
        simplifiedQuery = simplifiedQuery.replace(
          `$${index + 1}`,
          `'${param}'`,
        );
      });

      const result = `Query: ${simplifiedQuery} [${duration}ms]`;

      return result;
    } catch (error) {
      console.log('Error', error);
      return inputQuery;
    }
  }
}
