import { Module } from '@nestjs/common';
import { MeassagesWsService } from './meassages-ws.service';
import { MeassagesWsGateway } from './meassages-ws.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [MeassagesWsGateway, MeassagesWsService],
})
export class MeassagesWsModule {}
