import { useSession } from "@/hooks/use-session";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { User, Settings, LogOut } from "lucide-react";
import db from "@/db";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function UserDropdown({ className }: { className?: string }) {
  const { session } = useSession();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("brandColor");
      const { error } = await db.auth.signOut();
      if (error) {
        console.error("Sign-out error:", error.message);
        toast({
          title: "Error Signing Out: ",
          description: error.message,
        });
      } else {
        toast({
          title: "Signing Out",
          description: "Sign Out Successfully",
        });
        window.location.reload();
      }
    } catch (err: unknown) {
      console.error("Unexpected error during sign-out:", err);
      toast({
        title: "Error Signing Out: ",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer focus:outline-none focus:ring-0">
        <Avatar>
          {session?.user?.avatar_url ? (
            <AvatarImage src={session?.user?.avatar_url} />
          ) : (
            <AvatarFallback
              className={cn(
                "bg-gradient-to-br from-brand-500 to-brand-600 text-white",
                className
              )}
            >
              {session?.user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-48 bg-brand-50/80"
      >
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <User className="w-1 h-1 " />
          <span className="text-base">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <Settings className="w-1 h-1 " />
          <span className="text-base">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={async () => {
            await handleSignOut();
          }}
        >
          <LogOut className="w-1 h-1 " />
          <span className="text-base">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
