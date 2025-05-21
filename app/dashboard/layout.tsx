import {getActiveSession, isSessionValid, Session} from "@/lib/auth";
import {cookies} from "next/headers";
import Image from "next/image";
import LinkButton from "@/lib/components/LinkButton";
import React from "react";


export default async function Layout({children} : {children: React.ReactNode;}) {

    const session = await getActiveSession(await cookies())
    return (
            <div className={"flex flex-col w-full h-full"}>
                <Header session={session}/>
                <div className={"flex flex-col justify-baseline border-blue-900 bg-white/[.5] dark:bg-black/[.5] dark:border-blue-100 border-1 rounded-lg p-4 h-full"}>
                    {children}
                </div>
            </div>
    )
}

function Header({session}: {session: Session | null,}) {
    const isLoggedIn = !!session && isSessionValid(session);

    if(isLoggedIn) {
        return (
            <header className={"flex items-center justify-between w-full h-16 px-4 py-8"}>
                <div className="flex items-center gap-4">
                    <Image src={session.user?.image?.url || "/spotify/Full_Logo_Green_CMYK.svg"}
                           alt={isLoggedIn ? "User profile picture" : "spotify logo"}
                           width={40}
                           height={40}
                           className={"rounded-full"}
                    ></Image>
                    <p className={"text-lg font-bold"}>{session.user?.username || "Log in to Spotify"}</p>
                    <Image src={session.user?.platform === "spotify" ? "/spotify/Primary_Logo_Green_CMYK.svg" : "/youtube/youtube_full_color_icon/social/128px/red/youtube_social_icon_red.png" }
                           alt={"Platform icon"}
                           width={30}
                           height={30}
                    />
                </div>
                <div className={"flex items-center justify-baseline gap-4"}>

                    <LinkButton href={"/logout"}>
                        Logout
                    </LinkButton>
                </div>
            </header>
        )
    }
}
