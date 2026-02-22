import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  async initialize(
    @Body() body: { email: string; amount: number; eventId: string; userId: string },
  ) {
    return this.paymentsService.initializePayment(
      body.email,
      body.amount,
      body.eventId,
      body.userId,
    );
  }

  @Get('verify')
  async verify(@Query('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }
}
