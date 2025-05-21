import Image from "next/image";
import {getActiveSession, isSessionValid} from "@/lib/auth";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import LinkButton from "@/lib/components/LinkButton";

export default async function Home() {

  const session = await getActiveSession(await cookies());
  if(session && isSessionValid(session)) {
    redirect("/dashboard");
  }

  return (
    <div className={"h-full flex flex-col justify-between items-center"}>
      <div></div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Connect to your favorite music platform
          </li>
          <li className="tracking-[-.01em]">
            Create, share and have fun
          </li>
        </ol>

        <div className="flex flex-col gap-4 items-center">
          <LinkButton href="/login/spotify">
            <Image
              className="hidden dark:block"
              src={`/spotify/Primary_Logo_Black_CMYK.svg`}
              alt="spotify logo"
              width={20}
              height={20}
            />
            <Image
                className="block dark:hidden"
                src={`/spotify/Primary_Logo_White_CMYK.svg`}
                alt="spotify logo"
                width={20}
                height={20}
            />
            Login with Spotify
          </LinkButton>
          <LinkButton href="/login/youtube">
            <Image
                className=""
                src={`/youtube/youtube_full_color_icon/social/64px/red/youtube_social_icon_red.png`}
                alt="spotify logo"
                width={25}
                height={25}
            />
            Login with Youtube / Youtube Music
          </LinkButton>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

async function deleteSessionCookie() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set("session_id", "", {
    path: "/",
    maxAge: 0,
  });
}