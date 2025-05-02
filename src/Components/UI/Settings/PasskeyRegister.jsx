// File: /src/Components/UI/PasskeyRegister.jsx
import React, { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { ApiRequest } from "@/Components/Util/apiRequest";
import { Fingerprint } from "lucide-react";

export default function PasskeyRegister({ userId }) {
    const [error, setError] = useState("");

    const handleRegister = async () => {
        try {
            const optionsRes = await ApiRequest(`/api/auth/passkey/register`);
            const { challengeToken, ...options } = optionsRes;
            const attestationResponse = await startRegistration(options);
            const verificationRes = await ApiRequest(`/api/auth/passkey/register`, "POST", {
                attestationResponse,
                userId,
                challengeToken,
            });

            if (verificationRes.verified) {
                alert("Passkey registered successfully!");
            } else {
                setError("Verification failed.");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Passkeys</h3>
                <button className="px-4 py-2 text-white bg-green-600 cursor-pointer hover:bg-green-700 rounded flex" onClick={handleRegister}> <Fingerprint className="mr-2" /> Add Passkey</button>
            </div>
            {error && <p className="text-red-500 bg-red-100 px-3 py-2 rounded">{error}</p>}

        </div>
    );
}
