/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Head from "next/head";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  HiBell,
  HiEmojiHappy,
  HiHome,
  HiPaperAirplane,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const baseUrl = "/dashboard";

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
          name: "Past Study Sets",
          value: "/studysets",
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
      <div className="flex min-h-screen w-full pt-20">
        <Head>
          <title>Cram.ai</title>
        </Head>

        <Sidebar className="border-r border-white/5">
          <SidebarHeader className="p-4">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-black text-indigo-400 tracking-wider">
                  cram.ai
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  AI-Powered Study Tools
                </p>
              </div>

              <div className="text-xs text-slate-500 truncate">
                Logged in as:
                <br />
                <span className="text-slate-300 font-medium">
                  {session?.user?.email}
                </span>
              </div>

              <button
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 hover:border-red-900/30 text-slate-400 hover:text-red-400 p-2.5 rounded-xl text-sm font-medium transition"
              >
                Sign Out
              </button>
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
        </Sidebar>

        <SidebarInset className="bg-transparent flex flex-col w-full">
          <header className="flex h-16 items-center gap-4 px-6 lg:px-10 border-b border-white/5">
            <SidebarTrigger className="text-white lg:hidden" />
          </header>

          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}