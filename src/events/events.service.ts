import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import * as QRCode from 'qrcode';
import { TicketsService } from '../tickets/tickets.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly ticketsService: TicketsService,
  ) {}

  async createEvent(dto: CreateEventDto, creatorId: string) {
    const event = new this.eventModel({
      ...dto,
      creatorId,
      creatorReminderDaysBefore: dto.creatorReminderDaysBefore || 1,
    });

    const savedEvent = await event.save();
    savedEvent.shareUrl = `https://eventful.com/events/${savedEvent._id}`;
    await savedEvent.save();

    return savedEvent;
  }

  async getEventById(eventId: string) {
    return this.eventModel.findById(eventId).exec();
  }

  async getAllEvents() {
    return this.eventModel.find().exec();
  }

  async getEventsByCreator(creatorId: string) {
    return this.eventModel.find({ creatorId }).exec();
  }

  async generateTicketQR(eventId: string, userId: string, reminderDaysBefore?: number) {
    const qrData = `${eventId}-${userId}-${Date.now()}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    await this.ticketsService.createTicket({
      eventId,
      userId,
      qrData,
      reminderDaysBefore: reminderDaysBefore || 1,
    });

    return { qrCode: qrCodeBase64, qrData };
  }

  @Cron('0 8 * * *')
  async sendEventNotifications() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await this.eventModel.find().exec();
    for (const event of events) {
      const notifyDate = new Date(event.date);
      notifyDate.setDate(notifyDate.getDate() - (event.creatorReminderDaysBefore || 1));

      if (notifyDate.toDateString() === today.toDateString()) {
        console.log(`🔔 Creator Reminder: Event "${event.title}" is coming up on ${event.date.toDateString()}`);
      }
    }

    const tickets = await this.ticketsService.getAllTickets();
    for (const ticket of tickets) {
      const event = await this.getEventById(ticket.eventId);
      if (!event) continue;

      const notifyDate = new Date(event.date);
      notifyDate.setDate(notifyDate.getDate() - (ticket.reminderDaysBefore || 1));

      if (notifyDate.toDateString() === today.toDateString()) {
        console.log(`🔔 User Reminder: Your ticket for "${event.title}" is for ${event.date.toDateString()}`);
      }
    }
  }
}
