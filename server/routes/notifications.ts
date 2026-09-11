import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET notifications for logged in user
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, read: false },
    });

    return res.json({ notifications, unreadCount });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// MARK single notification as read
router.put('/:id/read', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });

    return res.json({ success: true, count: notification.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// MARK all notifications as read
router.post('/read-all', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
