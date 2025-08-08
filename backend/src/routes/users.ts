/**
 * User Routes
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import { Router } from 'express';
import { authenticateToken, requireAdmin, requireOwnerOrAdmin } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'User management endpoints - Coming soon',
    data: []
  });
});

export { router as userRoutes };