import express, { Request, Response } from 'express';
import UserModel from '../model/userModel';
import userSignUpServices from '../services/accountSignUpService'
const router = express.Router();

router.post('/updateprofile', async (req: Request, res: Response) => {
    try {
        const email = req.body.email as string; // Change to expect email
        const user = await UserModel.findOne({ where: { email } }); // Change to search by email

        if (user) {
            res.send({
                username: user.username,
                email: user.email
            });
        } else {
            res.send("User not found");
        }
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
});

router.put('/updateprofile', async (req: Request, res: Response) => {
    try {
        const email = req.body.email; // Change to expect email
        const password = req.body.password;
        const user = await UserModel.findOne({ where: { email } }); // Change to search by email

        if (user) {
            // hash the password before storing it
            const hashedPassword = await userSignUpServices.hashPassword(password);
            user.password = hashedPassword;
            await user.save();
            res.send({ success: true });
        } else {
            res.status(404).send({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal server error', err: (err as Error).message });
    }
});

export default router;