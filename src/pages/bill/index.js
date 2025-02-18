import { useEffect } from "react";
import { useRouter } from "next/router";

export default function RedirectionPage() {
    const router = useRouter();

    useEffect(() => {
        router.push(`bills`)
    }, [])
    return (
        <></>
    );
}
