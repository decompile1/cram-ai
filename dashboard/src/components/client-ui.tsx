"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

export function ClientButton(props: React.ComponentProps<typeof Button>) {
    return <Button {...props}>{props.children}</Button>;
}

export function ClientAvatarGroup({
    avatars,
    max = 3,
    className
}: {
    avatars: { src?: string; alt?: string; fallback?: string; }[];
    max?: number;
    className?: string;
}) {
    const visible = avatars.slice(0, max);
    const hiddenCount = avatars.length - max;

    return (
        <div className={cn("flex -space-x-2", className)}>
            {visible.map((avatar, i) => (
                <Avatar key={i} className="border-2 border-background size-8">
                    {avatar.src ? (
                        <AvatarImage src={avatar.src} alt={avatar.alt ?? ""} />
                    ) : (
                        <AvatarFallback>{avatar.fallback ?? "?"}</AvatarFallback>
                    )}
                </Avatar>
            ))}
            {hiddenCount > 0 && (
                <Avatar className="size-8 border-2 border-background text-xs bg-muted text-muted-foreground">
                    <AvatarFallback>+{hiddenCount}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}

export function ClientImageWall(
    { alt = "", ...rest }: React.ComponentProps<typeof Image>
) {
    return <Image alt={alt} {...rest} />;
}

export function ClientSkeleton(props: React.ComponentProps<"div">) {
    return <Skeleton {...props}>{props.children}</Skeleton>;
}

export function ClientBadge(props: React.ComponentProps<typeof Badge>) {
    return <Badge {...props}>{props.children}</Badge>;
}

export function ClientCircularProgress({
    size = 20,
    className
}: {
    size?: number;
    className?: string;
}) {
    return (
        <Loader2
            className={cn("animate-spin text-muted-foreground", className)}
            style={{ width: size, height: size }}
        />
    );
}