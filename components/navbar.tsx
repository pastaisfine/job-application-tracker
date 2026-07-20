"use client";

import { Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

import { useSession } from "@/lib/auth/auth-client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuGroup } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";


export default function Navbar() {
    const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold text-primary"
        >
          <Briefcase />
          Job Tracker
        </Link>
        
        <div>
            {session?.user ? (
            <>
                <Link href="/dashboard">
                    <Button 
                        variant="ghost"
                        className="text-gray-700 ">
                            Dashboard
                    </Button>
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" className="rounded-full"/>}>
                            <Avatar>
                                <AvatarFallback>
                                    {session.user.name[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                <div className="font-normal">
                                    <p className="text-sm text-gray-500">
                                        {session.user.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {session.user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <SignOutButton />
                        </DropdownMenuGroup>

                    </DropdownMenuContent>
                </DropdownMenu>
            
            </>) : (
                <>
                    <Link href="/sign-in">
                    <Button variant="ghost" className="text-gray-700 hover:text-black">
                        Log In
                    </Button>
                    </Link>
                    <Link href="/sign-up">
                    <Button className="bg-primary hover:bg-primary/90">
                        Start for free
                    </Button>
                    </Link>
                </>
            )}
        </div>
      </div>
    </nav>
  );
}