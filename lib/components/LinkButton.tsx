import Link from "next/link";


export default function LinkButton({
    href,
    children,
    className = "",
    ...props
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {

    return (
        <Link href={href} className={"rounded-full border-0" +
            "transition-colors flex items-center justify-center bg-foreground text-background gap-2 " +
            "hover:bg-blue-950 dark:hover:bg-blue-100 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto" + className} {...props}>
            {children}
        </Link>
    );
}