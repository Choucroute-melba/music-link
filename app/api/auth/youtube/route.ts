import {redirect} from "next/navigation";
import {getOAuth2Client} from "@/lib/youtube/api";
import {google} from "googleapis";
import {createSession, createUserAuth, getUser, User} from "@/lib/auth";


export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        redirect("/login/error?error=" + error);
        return;
    }
    if (!code) {
        redirect("/login/error?error=missing_code_or_state");
        return;
    }

    try {
        console.log(`Received code`);
        const oauth2Client = getOAuth2Client();
        const {tokens} = await oauth2Client.getToken(code);
        console.log(`Received tokens: ${JSON.stringify(tokens, null, 2)}`);
        oauth2Client.setCredentials(tokens);

        const user: User = {
            id: "",
            platform: "youtube",
            username: "",
            image: {
                url: "",
                height: 0,
                width: 0,
            },
            auth: {
                code: code,
                token: tokens.access_token!,
                refresh_token: tokens.refresh_token!,
                token_expires_at: tokens.expiry_date!,
                user_id: "",
                scopes: tokens.scope!.split(" "),
            }
        }

        const yt = google.youtube({version: 'v3', auth: oauth2Client});
        const response = await yt.channels.list({
            mine: true,
            part: ['snippet', 'contentDetails', 'contentOwnerDetails', 'id', 'brandingSettings'],
        });

        if(!response.data.items || response.data.items.length === 0) {
            const googleProfileReq = await google.oauth2('v2').userinfo.get({
                auth: oauth2Client,
            });

            if(googleProfileReq.status !== 200) {
                console.error(`Failed to fetch user profile: ${response.statusText}`);
                redirect("/login/error?error=failed_to_fetch_user_profile_" + response.statusText);
            }

            console.log("Used google profile to create the user.")
            user.id = googleProfileReq.data.id!;
            user.username = googleProfileReq.data.name!;
            user.image.url = googleProfileReq.data.picture!;
            user.auth.user_id = googleProfileReq.data.id!;
        }
        else {
            console.log("Used youtube channel to create the user.")
            const data = response.data.items[0];
            console.log(data.snippet?.title);
            user.id = data.id!;
            user.username = data.snippet!.title!;
            user.image.url = data.snippet!.thumbnails!.medium!.url!;
            user.image.height = 240;
            user.image.width = 240;
            user.auth.user_id = data.id!;
        }

        if(!user.auth.refresh_token) {
            const previousAuth = await getUser(user.id);
            if(previousAuth) {
                user.auth.refresh_token = previousAuth.auth.refresh_token;
            }
            else {
                console.error("No refresh token found");
                redirect("/login/error?error=no_refresh_token_found");
            }
        }

        await createUserAuth(user);
        const session = await createSession(user.id, false, `youtube:${new Date().getTime()}`);
        const session_id = session.session_id;
        console.log(`Session created: ${session_id}`);
        const cookie = `session_id=${session_id}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=31536000`;

        return new Response("OK", {
            status: 307,
            headers: {
                "Set-Cookie": cookie,
                "Location": "/login/success?session_id=" + session_id,
            },
        });

    } catch (e: any) {
        console.error(e);
        redirect("/login/error?" + new URLSearchParams({
            error: e.message || "unknown_error",
        }));
    }
}