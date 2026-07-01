import Link from "next/link";
import { BsDiscord } from "react-icons/bs";
import { HiHome } from "react-icons/hi";

import { cn } from "@/utils/cn";

import { ClientButton } from "./client-ui";
import type { Button } from "./ui/button";

type Props = {
    href?: string;
    title: string;
    description: string;
    top?: string;

    /**
   * @deprecated
   */
    icon?: React.ReactNode;
    /**
   * @deprecated
   */
    button?: string;

    buttons?: React.ReactNode;
    children?: React.ReactNode;
} & React.ComponentProps<typeof Button>;

export function ScreenMessage({
    href,
    title,
    description,
    top = "16vh",

    icon,
    button,

    buttons,
    children,
    ...props
}: Props) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center md:my-0 my-40">
            <div style={{ marginTop: top }} />

            {children && <div className={cn("relative bottom-8", buttons ? "ml-8" : "ml-4")}>{children}</div>}

            <div>
                <div className="mb-8 flex flex-col items-center text-center">
                    <span className="text-4xl dark:text-neutral-100 text-neutral-900 font-semibold">{title}</span> <br />
                    <span className="text-lg dark:text-neutral-400 text-neutral-600 font-semibold max-w-xl">{description}</span>
                </div>

                {button && href && (
                    <div className="w-full flex flex-col items-center">
                        <ClientButton
                            asChild
                            {...props}
                            className={cn("px-20", props.className)}
                        >
                            <Link href={href}>
                                <div className="flex items-center">
                                    {icon && <span className="mr-2">{icon}</span>}
                                    {button}
                                </div>
                            </Link>
                        </ClientButton>
                    </div>
                )}


                {buttons && (
                    <div className="w-full flex flex-col items-center">
                        <div className="flex flex-wrap gap-2">{buttons}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function HomeButton() {
    return (
        <ClientButton asChild>
            <Link href="/" className="flex items-center gap-2">
                <HiHome />
                Go back to Home
            </Link>
        </ClientButton>
    );
}

export function AddButton() {
    return (
        <ClientButton asChild className="button-primary">
            <Link href="/login?invite=true" prefetch={false} className="flex items-center gap-2">
                <BsDiscord />
                Add Bot to your server
            </Link>
        </ClientButton>
    );
}

export function SupportButton() {
    return (
        <ClientButton asChild className="button-primary">
            <Link href="/support" className="flex items-center gap-2">
                <BsDiscord />
                Join support server
            </Link>
        </ClientButton>
    );
}