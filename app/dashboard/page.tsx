import {getActiveSession, isSessionValid} from "@/lib/auth";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export default async function Dashboard() {
    const session = await getActiveSession(await cookies())
    if(!session || !isSessionValid(session))
        redirect("/?reason=disconnected")

    return(
        <div>
            <h1 className="text-2xl font-bold">Welcome, {session.user?.username}</h1>
        </div>
    )
}