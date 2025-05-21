import {redirect} from "next/navigation";
import {closeSession} from "@/lib/auth";
import {cookies} from "next/headers";
import {NextRequest} from "next/server";

export async function GET(req: NextRequest) {
    const session_id = req.cookies.get("session_id");
    if (!session_id) {
        redirect("/?reason=no_session");
    }

    // Close the session
    await closeSession(session_id.value);

    // Clear the cookie
    (await cookies()).set("session_id", "", {
        maxAge: 0,
    });
    redirect("/?reason=logout");
}