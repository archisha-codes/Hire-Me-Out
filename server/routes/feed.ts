import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET FEED POSTS
router.get('/posts', async (req: AuthRequest, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { privacy: 'PUBLIC' },
      include: {
        studentProfile: {
          include: {
            user: { select: { name: true, avatar: true } }
          }
        },
        comments: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return res.json({ posts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE POST
router.post('/posts', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { content, type, mediaUrl, privacy } = req.body;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Only student profiles can publish learning posts.' });

    const post = await prisma.post.create({
      data: {
        studentProfileId: student.id,
        content: content || 'Just completed a milestone assessment on Hire Me Out!',
        type: type || 'MILESTONE',
        mediaUrl,
        privacy: privacy || 'PUBLIC',
      },
      include: {
        studentProfile: {
          include: {
            user: { select: { name: true, avatar: true } }
          }
        }
      }
    });

    return res.json({ post });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// LIKE POST
router.post('/posts/:id/like', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const existing = await prisma.like.findFirst({
      where: { postId, userId: req.user!.id }
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      });
      return res.json({ liked: false });
    } else {
      await prisma.like.create({
        data: { postId, userId: req.user!.id }
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      });
      return res.json({ liked: true });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
