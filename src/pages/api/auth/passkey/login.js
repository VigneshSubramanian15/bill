import dbConnect from '@/Components/Util/mongodb';
import User from '@/Components/Models/UsersSchema';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import { getJWTTokenData } from '@/Components/Util/auth';

const rpID = process.env.PASSKEYS_RPID;
const origin = process.env.PASSKEYS_ORIGIN;

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        // Expect the client to supply their identifier (email) via query parameter
        const { userId } = getJWTTokenData(req);
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: "User not found" });
        console.log({ user: user.passkeyCredentials });

        // Generate authentication options using the user's registered passkey credentials.
        const options = await generateAuthenticationOptions({
            rpID,
            userVerification: 'preferred',
            allowCredentials: user.passkeyCredentials.map(cred => ({
                id: cred.credentialID,
                type: 'public-key',
                transports: cred.transports,
            })),
        });
        console.log(options);

        // Convert options to a plain object (if necessary) for proper JSON serialization.
        const plainOptions = JSON.parse(JSON.stringify(options));

        // Sign the challenge from the options into a JWT challenge token.
        const challengeToken = jwt.sign(
            { challenge: plainOptions.challenge },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        // Return the authentication options along with the challenge token.
        return res.status(200).json({ ...plainOptions, challengeToken });
    } else if (req.method === 'POST') {
        const { userId } = getJWTTokenData(req);
        const { assertionResponse, challengeToken } = req.body;

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
            const authenticator = user.passkeyCredentials.find(
                cred => cred.credentialID === assertionResponse.id
            );
            console.log({ authenticator, assertionResponse })

            if (!authenticator)
                return res.status(400).json({ message: "Authenticator not found" });


            const publicKeyNumbers = authenticator.publicKey
                .split(',')
                .map(num => parseInt(num, 10));
            const credentialPublicKeyBuffer = Buffer.from(publicKeyNumbers);


            // Verify the assertion response.
            const verification = await verifyAuthenticationResponse({
                response: assertionResponse,
                expectedChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
                credential: {
                    id: authenticator.credentialID,
                    publicKey: credentialPublicKeyBuffer,
                    counter: authenticator.counter,
                    transports: authenticator.transports,
                }
            });

            if (verification.verified) {
                const token = jwt.sign(
                    {
                        userId: user._id,
                        companyId: user.company,
                        access: user.access,
                    },
                    process.env.JWT_SECRET,
                    // { expiresIn: '24h' }
                );
                return res.status(200).json({ token });
            } else {
                return res.status(400).json({ message: "Authentication failed" });
            }
        } catch (error) {
            console.error("Authentication error:", error);
            return res.status(500).json({ message: "Error verifying authentication" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
