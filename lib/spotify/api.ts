import {getUser, updateToken, User} from "@/lib/auth";

export type SpotifyProfile = {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean;
        filter_locked: boolean;
    };
    external_urls: {
        spotify: string;
    };
    followers: {
        href: string;
        total: number;
    };
    href: string;
    id: string;
    images: Array<{
        url: string;
        height: number;
        width: number;
    }>;
    product: string;
    type: string;
    uri: string;
};

export async function refreshToken(user: User) {
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: user.auth.refresh_token,
        })
    })
    if (!res.ok) {
        throw new Error("Failed to refresh token");
    }
    const data = await res.json();
    if (data.error) {
        throw new Error("Failed to refresh token: " + data.error);
    }
    if (data.access_token) {
        const expirationDate = new Date(Date.now() + data.expires_in * 1000);
        await updateToken(user.id, data.access_token, user.auth.refresh_token, expirationDate);
    }
}

export async function getUserProfileById(id: string) {
    const user = await getUser(id);
    if(!user) {
        console.error(`User with id ${id} not found`);
        return null;
    }
    return await getUserProfile(user)
}

/**
 * Fetches the Spotify profile of a user. .
 * @param user Can be a User object or an access token string
 */
export async function getUserProfile(user: User | string): Promise<SpotifyProfile> {
    const token = typeof user == 'string' ? user : user.auth.token;
    const res = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        if (res.status === 401 && typeof user != 'string') {
            // Token expired, refresh it
            await refreshToken(user);
            const newUser = await getUser(user.id);
            return await getUserProfile(newUser!);
        }
        throw new Error("Failed to fetch user profile");
    }

    return await res.json();
}


export async function createAccessToken(code: string) : Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}> {
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to create access token : " + res.status + " "  + res.statusText);
    }

    const data = await res.json();
    if (data.error) {
        throw new Error("Failed to create access token: " + data.error);
    }
    return data;
}