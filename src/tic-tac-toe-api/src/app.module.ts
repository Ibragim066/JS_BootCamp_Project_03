import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatasourceModule } from './datasource/datasource.module';
import { DomainModule } from './domain/domain.module';
import { WebModule } from './web/web.module';

@Module({
  imports: [DomainModule, DatasourceModule, WebModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
