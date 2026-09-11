import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';

const router = Router();

// CREATE PAYMENT TRANSACTION (Razorpay-ready simulation)
router.post('/create', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount } = req.body;
    const paymentAmount = amount || 499;

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user!.id,
        type: type || 'VERIFICATION_PREMIUM',
        amount: paymentAmount,
        currency: 'INR',
        status: 'COMPLETED',
        razorpayPaymentId: `pay_${Date.now()}_rzp`,
      }
    });

    // Upgrade student status if applicable
    if (type === 'VERIFICATION_PREMIUM' && req.user!.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
      if (student) {
        await prisma.studentProfile.update({
          where: { id: student.id },
          data: { humanVerified: true }
        });
      }
    }

    // Send notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Payment Successful',
        message: `Transaction of ₹${paymentAmount} completed successfully. ID: ${transaction.razorpayPaymentId}`,
        type: 'PAYMENT',
      }
    });

    return res.json({
      transaction,
      receiptUrl: `https://hiremeout.io/invoices/inv_${transaction.id}.pdf`,
      message: 'Razorpay Payment successful. Entitlements updated.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET USER TRANSACTION HISTORY
router.get('/history', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ transactions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
