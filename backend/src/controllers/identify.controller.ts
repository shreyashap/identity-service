import { Request, Response } from 'express';
import { identifyCustomer } from '../services/identify.service.js';

export const identifyController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, phoneNumber } = req.body;

        // Validation
        if (email !== undefined && email !== null && typeof email !== 'string') {
            res.status(400).json({ error: "email must be a string" });
            return;
        }

        if (phoneNumber !== undefined && phoneNumber !== null && (typeof phoneNumber !== 'string' && typeof phoneNumber !== 'number')) {
            res.status(400).json({ error: "phoneNumber must be a string or number" });
            return;
        }

        if (!email && !phoneNumber) {
            res.status(400).json({ error: "Either email or phoneNumber must be provided" });
            return;
        }

        const phoneStr = phoneNumber ? String(phoneNumber) : undefined;
        const emailStr = email || undefined;

        const result = await identifyCustomer(emailStr, phoneStr);

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in identifyController:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
