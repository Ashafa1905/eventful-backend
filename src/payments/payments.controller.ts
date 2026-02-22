import { Controller, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 🔐 Step 1: Initialize payment (user must be logged in)
  @UseGuards(JwtAuthGuard)
  @Post('initialize')
  async initializePayment(
    @Body() body: { amount: number; eventId: string },
    @Req() req,
  ) {
    const user = req.user;

    if (!user || !user.userId || !user.email) {
      throw new BadRequestException('User information is missing. Are you logged in?');
    }

    const { amount, eventId } = body;
    if (!amount || !eventId) {
      throw new BadRequestException('Missing amount or eventId in request body');
    }

    // Call payment service
    return this.paymentsService.initializePayment(
      user.email,
      amount,
      eventId,
      user.userId,
    );
  }

  // 🔹 Step 2: Verify payment (user must be logged in)
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifyPayment(
    @Body() body: { reference: string },
    @Req() req,
  ) {
    const user = req.user;

    if (!user || !user.userId) {
      throw new BadRequestException('User information is missing. Are you logged in?');
    }

    const { reference } = body;
    if (!reference) {
      throw new BadRequestException('Missing payment reference in request body');
    }

    // Call payment service
    return this.paymentsService.verifyPayment(reference);
  }
}
