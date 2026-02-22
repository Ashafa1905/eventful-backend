import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ================================
  // CREATE EVENT
  // ================================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a new event (Authenticated users only)' })
  @ApiResponse({ status: 201, description: 'Event successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createEvent(@Body() dto: CreateEventDto, @Req() req: any) {
    const creatorId = req.user.userId;
    return this.eventsService.createEvent(dto, creatorId);
  }

  // ================================
  // GET ALL EVENTS
  // ================================
  @Get()
  @ApiOperation({ summary: 'Get all events (Public)' })
  @ApiResponse({ status: 200, description: 'List of events' })
  async getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  // ================================
  // GET MY EVENTS
  // ================================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-events')
  @ApiOperation({ summary: 'Get events created by logged-in user' })
  @ApiResponse({ status: 200, description: 'User events retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyEvents(@Req() req: any) {
    const userId = req.user.userId;
    return this.eventsService.getEventsByCreator(userId);
  }

  // ================================
  // GENERATE SHAREABLE URL
  // ================================
  @Get('share/:eventId')
  @ApiOperation({ summary: 'Generate shareable URL for an event' })
  @ApiResponse({ status: 200, description: 'Shareable URL generated' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getShareableUrl(@Param('eventId') eventId: string) {
    const event = await this.eventsService.getEventById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return {
      shareUrl: `${baseUrl}/events/${event._id}`,
    };
  }

  // ================================
  // GENERATE TICKET QR
  // ================================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('ticket/:eventId')
  @ApiOperation({ summary: 'Generate ticket QR code for event' })
  @ApiResponse({ status: 201, description: 'QR Code generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateTicket(
    @Req() req: any,
    @Param('eventId') eventId: string,
  ) {
    const userId = req.user.userId;
    return this.eventsService.generateTicketQR(eventId, userId);
  }
}
