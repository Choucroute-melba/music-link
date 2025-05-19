import {getActiveSession, isSessionValid} from "@/lib/auth";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import Link from "next/link";
import {getUserProfileById} from "@/lib/spotify/api";

export default async function Dashboard() {
    const session = await getActiveSession(await cookies())
    if(!session || !isSessionValid(session))
        redirect("/?reason=disconnected")
    const profile = await getUserProfileById(session.user_id)
    if(!profile)
        redirect("/login/error?error=profile_not_found")

    return(
        <div>
            <h1 className="text-2xl font-bold">Welcome, {profile.display_name}</h1>
        </div>
    )
}