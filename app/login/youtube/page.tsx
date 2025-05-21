'use server';
import {cookies} from "next/headers";
import {getActiveSession, isSessionValid} from "@/lib/auth";
import {redirect} from "next/navigation";
import {getOAuth2Client} from "@/lib/youtube/api";


export default async function YoutubeLogin() {
    const session = await getActiveSession(await cookies())
    if(session && isSessionValid(session)) {
        redirect("/login/success");
    }

    const oauth2Client = getOAuth2Client();

    const scopes = [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    redirect(authUrl);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <h1 className="text-2xl font-bold">Login with Youtube</h1>
            <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                href="/api/auth/youtube"
            >
                Login with Youtube
            </a>
        </div>
    )
}