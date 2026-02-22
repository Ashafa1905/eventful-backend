import { Injectable, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './schemas/payment.schema';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackSecret: string;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private configService: ConfigService,
    private analyticsService: AnalyticsService, // ✅ Inject AnalyticsService
  ) {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined in your environment variables');
    }
    this.paystackSecret = secret;
    this.logger.log('PAYSTACK_SECRET_KEY loaded successfully');
  }

  // 🔹 Step 1: Initialize Payment
  async initializePayment(
    email: string,
    amount: number,
    eventId: string,
    userId: string,
  ) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        { email, amount: amount * 100 }, // Paystack expects kobo
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecret}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const reference = response.data.data.reference;

      // Save as pending payment
      await this.paymentModel.create({
        eventId,
        userId,
        amount,
        reference,
        status: 'pending',
      });

      this.logger.log(`Payment initialized for user ${userId}, reference: ${reference}`);
      return response.data.data;
    } catch (error: any) {
      this.logger.error('Error initializing payment', error.response?.data || error.message);
      throw new HttpException('Failed to initialize payment', 500);
    }
  }

  // 🔹 Step 2: Verify Payment + Update Analytics
  async verifyPayment(reference: string, channel: string = 'web') {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecret}`,
          },
        },
      );

      const paymentData = response.data.data;

      if (paymentData.status !== 'success') {
        this.logger.warn(`Payment not successful: ${reference}`);
        return paymentData;
      }

      // 🔍 Find payment in DB
      const payment = await this.paymentModel.findOne({ reference });
      if (!payment) {
        throw new HttpException('Payment record not found', 404);
      }

      // ✅ Prevent double counting
      if (payment.status === 'success') {
        this.logger.warn(`Payment already verified: ${reference}`);
        return paymentData;
      }

      // ✅ Update payment status
      payment.status = 'success';
      await payment.save();

      this.logger.log(`Payment verified successfully: ${reference}`);

      // 🔥 UPDATE ANALYTICS
      const { eventId, amount } = payment;

      await Promise.all([
        this.analyticsService.incrementEventMetric(
          eventId,
          'totalTicketsSold',
          1,
          channel,
        ),
        this.analyticsService.incrementEventMetric(
          eventId,
          'totalRevenue',
          amount,
          channel,
        ),
        this.analyticsService.incrementEventMetric(
          eventId,
          'totalAttendees',
          1,
        ),
      ]);

      return paymentData;
    } catch (error: any) {
      this.logger.error('Error verifying payment', error.response?.data || error.message);
      throw new HttpException('Failed to verify payment', 500);
    }
  }
}
