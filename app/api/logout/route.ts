import {redirect} from "next/navigation";
import {closeSession} from "@/lib/auth";
import {cookies} from "next/headers";

export async function GET(req: Request, res: Response) {
    const session_id = (await cookies()).get("session_id");
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