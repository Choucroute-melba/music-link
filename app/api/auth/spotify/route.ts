import {redirect} from "next/navigation";
import {createAccessToken, getUserProfile} from "@/lib/spotify/api";
import {createSession, createUserAuth} from "@/lib/auth";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (!code || !state) {
        redirect("/login/error?error=missing_code_or_state");
        return;
    }
    if (error) {
        redirect("/login/error?error=" + error);
        return;
    }

    try {
        console.log(`Received code, state: ${state}`);
        const auth = await createAccessToken(code);
        console.log(`Received access token`);
        const profile = await getUserProfile(auth.access_token);
        console.log(`Received profile: ${profile.display_name}`);
        await createUserAuth({
            id: profile.id,
            platform: "spotify",
            username: profile.display_name,
            image: {
                url: profile.images[0]?.url || "",
                height: profile.images[0]?.height || 0,
                width: profile.images[0]?.width || 0
            },
            auth_spotify: {
                code: code,
                token: auth.access_token,
                refresh_token: auth.refresh_token,
                token_expires_at: new Date(Date.now() + auth.expires_in * 1000),
           user_id: profile.id
            }
        })
        const userAgent = request.headers.get("user-agent");
        const session = await createSession(profile.id, false, `spotify:${new Date().getTime()} :: ${userAgent}`);
        const session_id = session.session_id;
        console.log(`Session created: ${session_id}`);

        return new Response(JSON.stringify({session_id}), {
            status: 307,
            headers: {
                "Set-Cookie": `session_id=${session_id}; Path=/; HttpOnly; SameSite=Strict; Secure;`,
                "Location": "/login/success?session_id=" + session_id,
            }
        })
    }

    catch (e : any) {
        console.error(e);
        redirect("/login/error?" + new URLSearchParams({
            error: e.message || "unknown_error",
        }));
    }
}