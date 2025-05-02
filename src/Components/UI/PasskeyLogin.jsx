// File: /src/Components/UI/PasskeyLogin.jsx
import React, { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { useRouter } from "next/router";
import { FingerprintIcon } from "lucide-react";
import { ApiRequest } from "../Util/apiRequest";
import { encryptData } from "@/Components/Util/crypto";

export default function PasskeyLogin({ userId }) {
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        try {
            // 1. Request authentication options from the server.
            const optionsRes = await ApiRequest(`/api/auth/passkey/login`);

            // 2. Use the browser’s WebAuthn API to sign the challenge.
            const assertionResponse = await startAuthentication(optionsRes);

            // 3. Verify the assertion on the server.

            const verificationRes = await ApiRequest(`/api/auth/passkey/login`, 'POST', { assertionResponse, challengeToken: optionsRes.challengeToken });
            console.log({ verificationRes });

            if (verificationRes) {
                const encryptedToken = encryptData(verificationRes.token, process.env.NEXT_PUBLIC_ENCRYPTION_KEY);
                localStorage.setItem("authToken", encryptedToken);
                router.push("/");
            } else {
                setError("Authentication failed.");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center border border-amber-600  text-white bg-amber-600 hover:bg-amber-700 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
                <FingerprintIcon className="mr-2" />
                Login with Passkeys
            </button>
            {error && <p>{error}</p>}
        </>
    );
}
