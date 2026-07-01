/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Head from "next/head";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HiBell,
  HiEmojiHappy,
  HiHome,
  HiPaperAirplane,
  HiChevronUp,
  HiUser,
} from "react-icons/hi";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const baseUrl = "/dashboard";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile/avatar/url")
      .then((r) => r.json())
      .then((d) => setAvatarUrl(d.url));
  }, []);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const navGroups = [
    {
      label: "Main",
      items: [
        { name: "Dashboard", value: "/", icon: HiHome },
        { name: "AI Summary", value: "/ai-summary", icon: HiEmojiHappy },
        {
          name: "Your Study Materials",
          value: "/study-materials",
          icon: HiPaperAirplane,
        },
      ],
    },
    {
      label: "Resources",
      items: [
        {
          name: "Public Flashcards",
          value: "/public-flashcards",
          icon: HiBell,
        },
        {
          name: "Saved",
          value: "/saved",
          icon: HiEmojiHappy,
        },
        {
          name: "Trash",
          value: "/trash",
          icon: HiPaperAirplane,
        },
      ],
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-dvh w-full">
        <Head>
          <title>Cram.ai</title>
        </Head>

        <Sidebar className="border-r border-white/5">
          <SidebarHeader className="p-4">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-black text-indigo-400 tracking-wider">
                  Cram.ai
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  AI-Powered Study Tools
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="mt-1 gap-0">
            {navGroups.map((group) => (
              <SidebarGroup key={group.label} className="mb-2">
                <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 px-4 mb-2">
                  {group.label}
                </SidebarGroupLabel>

                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const href =
                        item.value === "/"
                          ? baseUrl
                          : `${baseUrl}${item.value}`;

                      const isActive = pathname === href;

                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className="data-[active=true]:bg-indigo-600/10 data-[active=true]:text-white text-neutral-400 hover:text-white px-4 py-5"
                          >
                            <Link href={href}>
                              <item.icon
                                className={
                                  isActive
                                    ? "text-indigo-400"
                                    : "text-neutral-500"
                                }
                                size={20}
                              />
                              <span className="text-[13px] font-medium ml-1">
                                {item.name}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <div className="mt-auto border-t border-white/5 p-4">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 hover:border-slate-700 transition">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center rounded-full justify-center bg-indigo-500/10">
  <img
    src={avatarUrl ?? "/default-avatar.jpeg"}
    alt={`${session?.user.name ?? "User"}'s profile picture`}
    className="w-full h-full object-cover"
  />
          </div>

          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name ?? "User"}
            </p>

            <p className="text-xs text-slate-500 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>

        <HiChevronUp
          size={18}
          className="text-slate-500 shrink-0"
        />
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      side="top"
      align="start"
      className="w-72"
    >
      <DropdownMenuLabel>
        <div>
          <p className="font-medium">
            {session?.user?.name ?? "User"}
          </p>

          <p className="text-xs text-slate-500 font-normal">
            {session?.user?.email}
          </p>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <Link
          href="/dashboard/profile"
          className="cursor-pointer flex items-center gap-2"
        >
          <HiUser />
          Profile
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() =>
          signOut({
            callbackUrl: "/login",
          })
        }
        className="cursor-pointer text-red-400 focus:text-red-400"
      >
        Sign Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
        </Sidebar>
        <SidebarInset className="bg-transparent flex flex-col w-full">
          <header className="flex h-16 items-center gap-4 px-6 lg:px-10 border-b border-white/5">
            <SidebarTrigger className="text-white lg:hidden" />
          </header>

          <main className="flex-1 w-full h-full p-6 lg:p-10 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}