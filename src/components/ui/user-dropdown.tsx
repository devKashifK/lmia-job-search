'use client';

import { useSession } from '@/hooks/use-session';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { User, LogOut, LayoutDashboard, Settings, ChevronRight } from 'lucide-react';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import CustomLink from './CustomLink';

export default function UserDropdown({ className }: { className?: string }) {
  const { session } = useSession();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('brandColor');
      const { error } = await db.auth.signOut();
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Signed out successfully',
        });
        window.location.href = '/';
      }
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const userName = session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User';
  const userEmail = session?.user?.email || '';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-full transition-all">
        <Avatar className="h-9 w-9 border-2 border-white shadow-sm hover:shadow-md hover:scale-105 transition-all">
          {session?.user?.avatar_url ? (
            <AvatarImage src={session?.user?.avatar_url} alt={userName} />
          ) : (
            <AvatarFallback
              className={cn(
                'bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold text-sm',
                className
              )}
            >
              {userInitials}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-72 p-0 border-gray-200 shadow-lg"
      >
        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-100">
              {session?.user?.avatar_url ? (
                <AvatarImage src={session?.user?.avatar_url} alt={userName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem className="cursor-pointer px-4 py-2 focus:bg-brand-50">
            <CustomLink href="/dashboard" className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Dashboard</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </CustomLink>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer px-4 py-2 focus:bg-brand-50">
            <CustomLink href="/dashboard/profile" className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </CustomLink>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer px-4 py-2 focus:bg-brand-50">
            <CustomLink href="/dashboard/settings" className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </CustomLink>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-100" />

        {/* Sign Out */}
        <div className="py-1">
          <DropdownMenuItem
            className="cursor-pointer px-4 py-2 focus:bg-red-50 text-red-600"
            onClick={handleSignOut}
          >
            <div className="flex items-center gap-3 w-full">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
