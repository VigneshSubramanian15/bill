// File: /src/pages/api/auth/passkey/register.js
import dbConnect from '@/Components/Util/mongodb';
import User from '@/Components/Models/UsersSchema';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { getJWTTokenData } from '@/Components/Util/auth';
import jwt from 'jsonwebtoken';

const rpName = process.env.PASSKEYS_NAME
const rpID = process.env.PASSKEYS_RPID;
const origin = process.env.PASSKEYS_ORIGIN;

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        // Identify the user using your existing token logic
        const { userId } = getJWTTokenData(req);
        const user = await User.findById(userId);
        console.log({ user });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Generate registration options.
        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            // Convert user._id to a Buffer as required by the latest version.
            userID: Buffer.from(user._id.toString(), 'utf8'),
            userName: user.name,
            attestationType: 'none', // minimizes friction by not requiring an attestation statement
            authenticatorSelection: {
                userVerification: 'preferred',
            },
        });
        console.log({ options });

        // Instead of using sessions, embed the challenge in a JWT token.
        const challengeToken = jwt.sign({ challenge: options.challenge }, process.env.JWT_SECRET, { expiresIn: '10m' });

        // Return the options along with the challengeToken.
        return res.status(200).json({ ...options, challengeToken });
    } else if (req.method === 'POST') {
        const { attestationResponse, challengeToken } = req.body;
        const { userId } = getJWTTokenData(req);
        // Verify the challenge token to extract the expected challenge.
        let expectedChallenge;
        try {
            const decoded = jwt.verify(challengeToken, process.env.JWT_SECRET);
            expectedChallenge = decoded.challenge;
        } catch (error) {
            return res.status(400).json({ message: 'Invalid or expired challenge token' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: "User not found" });

        try {
            const verification = await verifyRegistrationResponse({
                response: attestationResponse,
                expectedChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
            });
            console.log(JSON.stringify(verification.registrationInfo, null, 4))
            if (verification.verified) {
                // Save the new credential info to the user's record.
                user.passkeyCredentials.push({
                    credentialID: verification.registrationInfo.credential.id,
                    publicKey: verification.registrationInfo.credential.publicKey,
                    counter: verification.registrationInfo.credential.counter,
                    transports: attestationResponse.response.transports || [],
                });
                await user.save();
                return res.status(200).json({ verified: true });
            } else {
                return res.status(400).json({ verified: false });
            }
        } catch (error) {
            console.error("Registration verification error:", error);
            return res.status(500).json({ message: "Error verifying registration" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
