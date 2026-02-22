import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from './schemas/ticket.schema';

@Injectable()
export class TicketsService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  // 🔹 Create a ticket with optional user-specific reminder
  async createTicket(data: { 
    eventId: string; 
    userId: string; 
    qrData: string; 
    reminderDaysBefore?: number; 
  }) {
    const ticket = new this.ticketModel({
      ...data,
      reminderDaysBefore: data.reminderDaysBefore || 1, // default 1 day
    });
    return ticket.save();
  }

  // 🔹 Get all tickets for a specific user
  async getTicketsByUser(userId: string) {
    return this.ticketModel.find({ userId }).exec();
  }

  // 🔹 Get all tickets (for cron notifications)
  async getAllTickets() {
    return this.ticketModel.find().exec();
  }
}
