import dbConnect from '@/Components/Util/mongodb';
import User from '@/Components/Models/UsersSchema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { decryptData } from '@/Components/Util/crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    let { userId, password } = req.body;
    userId = decryptData(userId)
    password = decryptData(password)

    if (!userId || !password) {
        return res.status(400).json({ message: 'Missing Email, Phone Number or Password' });
    }

    try {
        await dbConnect();

        const user = await User.findOne({
            $or: [{ email: userId }, { phoneNumber: userId }],
            isActive: true,
        });
        console.log(user)
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                companyId: user.company,
                access: user.access,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
