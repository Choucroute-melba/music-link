import Link from "next/link";

export default async function LoginErrorPage({searchParams} : {searchParams: any}) {

    const error = (await searchParams).error || 'Unknown error';

    return (
        <div>
            <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                <h1 className="text-2xl font-bold text-red-400">Error</h1>
                <pre>{error}</pre>
                <Link
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                    href="/"
                >
                    Go Home
                </Link>
            </div>
        </div>
    )
}
