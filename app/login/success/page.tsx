import { cookies } from "next/headers";
import {redirect} from "next/navigation";
import {getUserProfile, SpotifyProfile} from "@/lib/spotify/api";
import {getActiveSession, getSession, getUserForSession, isSessionValid} from "@/lib/auth";
import Link from "next/link";
import LinkButton from "@/lib/components/LinkButton";

export default async function LoginSuccessPage({searchParams}: {searchParams: any}) {

    let session = await getActiveSession(await cookies())
    if(!session) {
        console.log("Session not found in cookies, trying to get it from search params")
        session = await getSession((await searchParams).session_id);
    }
    if(!session) {
        redirect("/login/error?error=session_not_found");
    }
    if(!isSessionValid(session)) {
        redirect("/login/error?error=session_expired");
    }

    const sessionId = session.session_id;
    const user = await getUserForSession(sessionId);
    if(!user) {
        redirect("/login/error?error=user_not_found");
    }

    return (
        <>
            <h1 className="text-2xl font-bold">Done !</h1>
            <p>Your account is now linked to spotify.</p>
            <p>Open your dashboard to start sharing with friends.</p>
            <LinkButton href={"/dashboard"}>Go to my Dashboard</LinkButton>
        </>
    );
}