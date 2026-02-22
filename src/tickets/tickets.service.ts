import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from './schemas/ticket.schema';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name)
    private ticketModel: Model<Ticket>,
  ) {}

  // 🔹 Create a ticket
  async createTicket(data: {
    eventId: string;
    userId: string;
    qrData: string;
    reminderDaysBefore?: number;
  }) {
    const ticket = new this.ticketModel({
      ...data,
      reminderDaysBefore: data.reminderDaysBefore || 1,
    });

    return ticket.save();
  }

  // 🔹 Get tickets by user
  async getTicketsByUser(userId: string) {
    return this.ticketModel.find({ userId }).exec();
  }

  // 🔹 Get all tickets (used in cron job)
  async getAllTickets() {
    return this.ticketModel.find().exec();
  }
}
