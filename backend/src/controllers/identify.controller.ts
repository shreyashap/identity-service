import { Request, Response } from 'express';

export const identifyController = async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;

        if (!email && !phoneNumber) {
            res.status(400).json({ error: "Either email or phoneNumber must be provided" });
            return;
        }

        const result = {
            contact: {
                primaryContactId: 1,
                emails: [email],
                phoneNumbers: [phoneNumber],
                secondaryContactIds: []
            }
        };

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in identifyController:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
