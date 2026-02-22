import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from './schemas/event.schema';
import { TicketsModule } from '../tickets/tickets.module'; // ✅ Import TicketsModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    TicketsModule, // ✅ Add here
  ],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
