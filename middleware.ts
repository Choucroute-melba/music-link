import {NextRequest, NextResponse} from "next/server";
import {getActiveSession, isSessionValid} from "@/lib/auth";
import {cookies} from "next/headers";


export async function middleware(req: NextRequest) {
    console.info(`--- ${req.method} ${req.nextUrl.pathname}`);
    const sessionCookie = req.cookies.get("session_id");
    if (!sessionCookie) {
        console.warn("No Session ID");
        return NextResponse.next()
    }
    const response = NextResponse.next();
    const session = await getActiveSession(await cookies());
    if (!session) {
        console.warn("Session not found : " + sessionCookie);
        response.cookies.delete("session_id");
        return response
    }
    if(!isSessionValid(session)) {
        console.warn("Session expired : " + sessionCookie);
        response.cookies.delete("session_id");
        return response
    }
    console.log("Session valid : " + session.session_id);
    return response;
}

export const config = {
    matcher: [
        "/",
        "/api/(.*)",
        "/login/(.*)",
        "/dashboard/(.*)",
        "/logout/(.*)"
    ]
}