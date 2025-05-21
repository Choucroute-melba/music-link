import {neon} from "@neondatabase/serverless";
import {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";

export type User = {
    id: string;
    platform: string;
    username: string;
    image: {
        url: string;
        height: number;
        width: number;
    }
    auth: {
        code: string;
        token: string;
        refresh_token: string;
        token_expires_at: number | Date;
        user_id: string;
        scopes: string[];
    }
}

export type Session = {
    session_id: number;
    user_id: string;
    expires_at: number;
    session_name: string;
    user: {
        platform: string;
        username: string;
        image: {
            url: string;
            height: number;
            width: number;
        }
    } | null;
}

if(!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not defined");

const sql = neon(process.env.DATABASE_URL);

export async function createUserAuth(usr: User) {
    const { id, platform } = usr;
    const {code, token, refresh_token, token_expires_at, scopes} = usr.auth;
    const { username, image } = usr;

    try {
        if(await getUser(usr.id) !== null) {
            console.info("User already exists, updating instead");
            await sql`UPDATE auth SET platform = ${platform}, code = ${code}, token = ${token}, refresh_token = ${refresh_token}, token_expires_at = ${token_expires_at} WHERE id = ${id}`;
            await sql`UPDATE profiles SET platform = ${platform}, username = ${username}, image = ${image} WHERE id = ${id}`;
            return;
        }

        await sql`INSERT INTO auth (id, platform, code, token, refresh_token, token_expires_at, scopes) VALUES (${id}, ${platform}, ${code}, ${token}, ${refresh_token}, ${token_expires_at}, ${scopes})`;
        await sql`INSERT INTO profiles (id, platform, username, image) VALUES (${id}, ${platform}, ${username}, ${image})`;
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to add user\n" + e);
    }
}

export async function getUser(id: string): Promise<User | null> {
    try {
        const auth = await sql`SELECT * FROM auth WHERE id = ${id}`;
        if (auth.length === 0) {
            console.warn(`User ${id} not found`);
            return null;
        }
        const profile = await sql`SELECT * FROM profiles WHERE id = ${id}`;
        if (profile.length === 0) {
            console.warn(`Profile ${id} not found`);
            return null;
        }
        return {
            id: auth[0].id,
            platform: auth[0].platform,
            username: profile[0].username,
            image: {
                url: profile[0].image.url,
                height: profile[0].image.height,
                width: profile[0].image.width
            },
            auth: { // TODO: implement other platforms
                code: auth[0].code,
                token: auth[0].token,
                refresh_token: auth[0].refresh_token,
                token_expires_at: new Date(auth[0].token_expires_at),
                user_id: auth[0].user_id,
                scopes: auth[0].scopes
            }
        };
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to get user\n" + e);
    }
}

export async function getUserForSession(sessionId: number) {
    try {
        const session = await sql`SELECT * FROM sessions WHERE session_id = ${sessionId}`;
        if (session.length === 0) {
            return null;
        }
        return await getUser(session[0].user_id);
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to get user from session\n" + e);
    }
}

export async function updateToken(id: string, token: string, refresh_token: string, token_expires_at: Date | string) {
    try {
        await sql`UPDATE auth SET token = ${token}, refresh_token = ${refresh_token}, token_expires_at = ${token_expires_at} WHERE id = ${id}`;
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to update token\n" + e);
    }
}

/**
 * Creates a session for the user.
 * @param id the user id
 * @param longTimeOut wether the user should be logged out within an hour or a month
 * @param name the session name, to help the user identify the session
 */
export async function createSession(id: string, longTimeOut: boolean = true , name: string | null = null) {
    try {
        const expiresAt = longTimeOut ? Date.now() + 1000 * 60 * 60 * 24 * 30 : Date.now() + 1000 * 60 * 60;
        const sessionId = await sql`INSERT INTO sessions (user_id, session_name, expires_at) VALUES (${id}, ${name}, ${expiresAt}) RETURNING session_id`;
        const session = await sql`SELECT * FROM sessions WHERE session_id = ${sessionId[0].session_id}`;
        return session[0] as Session;
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to create session\n" + e);
    }
}

/**
 *
 * @param id the user id
 */
export async function getSessionsForUser(id: string) {
    try {
        const sessions = await sql`SELECT * FROM sessions WHERE user_id = ${id}`;
        return sessions as Session[];
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to get sessions\n" + e);
    }
}

/**
 * Return the active session for the user.
 * If the session is expired, it will be deleted.
 * @param cookies
 */
export async function getActiveSession(cookies: ReadonlyRequestCookies) {
    const sessionId = cookies.get("session_id")?.value;
    if (!sessionId) {
        console.warn("No Session ID");
        return null;
    }
    const session = (await sql`SELECT * FROM sessions WHERE session_id = ${sessionId}`)[0] as Session | null;
    if (!session) {
        console.warn("Session not found : " + sessionId);
        return null;
    }
    if (!isSessionValid(session)) {
        console.warn("Session expired : " + sessionId);
        await sql`DELETE FROM sessions WHERE session_id = ${sessionId}`;
    }
    const user = await getUser(session.user_id);
    if(user) {
        session.user = {
            platform: user.platform,
            username: user.username,
            image: {
                url: user.image.url,
                height: user.image.height,
                width: user.image.width
            }
        }
    }
    return session;
}

export async function getSession(sessionId: number) {
    try {
        const session = await sql`SELECT * FROM sessions WHERE session_id = ${sessionId}`;
        if (session.length === 0) {
            return null;
        }
        return session[0] as Session;
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to get session\n" + e);
    }
}

export async function closeSession(session: Session | string) {
    try {
        const session_id = typeof session === "string" ? session : session.session_id;
        await sql`DELETE FROM sessions WHERE session_id = ${session_id}`;
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to close session\n" + e);
    }
}

export function isSessionValid(session: Session) {
    const date = Date.now();
    return session.expires_at > date;
}



