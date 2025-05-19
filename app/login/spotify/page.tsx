import { redirect } from "next/navigation";
import * as querystring from "node:querystring";
import {getActiveSession, isSessionValid} from "@/lib/auth";
import {cookies} from "next/headers";

export default async function SpotifyLogin() {
    const session = await getActiveSession(await cookies())
    if(session && isSessionValid(session)) {
        redirect("/login/success");
    }

    redirect("https://accounts.spotify.com/authorize?" + querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: "user-read-playback-state user-read-currently-playing user-read-email user-read-private playlist-read-private playlist-modify-public playlist-modify-private playlist-read-collaborative user-library-read user-library-modify user-top-read user-read-recently-played user-read-playback-position user-read-private",
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state: "random_string" // TODO
        }
    ))

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-2xl font-bold">Login with Spotify</h1>
        <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/api/auth/spotify"
        >
            Login with Spotify
        </a>
        </div>
    );
}