import {google} from "googleapis";
import {getUser} from "@/lib/auth";

export function getOAuth2Client() {

    return new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
    );
}

/**
 * return the YouTube api client for the given Link userId
 * @param userId
 */
export async function getYoutubeApi(userId: string) {
    const user = await getUser(userId);
    if(!user) {
        return null;
    }
    const auth = getOAuth2Client();
    auth.setCredentials({
        access_token: user.auth.token,
        refresh_token: user.auth.refresh_token,
        expiry_date: typeof user.auth.token_expires_at == 'number' ? user.auth.token_expires_at : user.auth.token_expires_at.getTime(),
        scope: user.auth.scopes.join(' '),
        token_type: 'Bearer'
    });
    return google.youtube({
        version: 'v3',
        auth: getOAuth2Client()
    });
}

