import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {

    // GET /api/v1/analytics/dashboard
    async getDashboardStats(req: Request, res: Response) {
        try {
            const stats = await analyticsService.getDashboardStats();
            res.json(stats);
        } catch (error: any) {
            console.error('Analytics Data Error:', error);
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    }
}

export const analyticsController = new AnalyticsController();
