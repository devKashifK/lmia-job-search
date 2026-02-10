import { useSession } from '@/hooks/use-session';
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { User, Settings, LogOut, Palette } from 'lucide-react';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import CustomLink from './CustomLink';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { updateThemeColor } from '@/lib/colors';

export default function UserDropdown({ className }: { className?: string }) {
  const { session } = useSession();
  const { toast } = useToast();
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [brandColor, setBrandColor] = useState(
    session?.user?.user_metadata?.brandColor || 'brand'
  );

  const colorPalette = [
    { name: 'Brand', value: 'brand', color: '#4ade80' },
    { name: 'Blue', value: 'blue', color: '#3b82f6' },
    { name: 'Purple', value: 'purple', color: '#a855f7' },
    { name: 'Pink', value: 'pink', color: '#ec4899' },
    { name: 'Red', value: 'red', color: '#ef4444' },
    { name: 'Orange', value: 'orange', color: '#f97316' },
    { name: 'Yellow', value: 'yellow', color: '#eab308' },
    { name: 'Teal', value: 'teal', color: '#14b8a6' },
    { name: 'Cyan', value: 'cyan', color: '#06b6d4' },
    { name: 'Indigo', value: 'indigo', color: '#6366f1' },
    { name: 'Violet', value: 'violet', color: '#8b5cf6' },
    { name: 'Fuchsia', value: 'fuchsia', color: '#d946ef' },
    { name: 'Rose', value: 'rose', color: '#f43f5e' },
    { name: 'Amber', value: 'amber', color: '#f59e0b' },
    { name: 'Lime', value: 'lime', color: '#84cc16' },
    { name: 'Emerald', value: 'emerald', color: '#10b981' },
    { name: 'Apple', value: 'black', color: '#000000' },
  ];

  const handleColorChange = async (color: string) => {
    try {
      // Update user's brand color in the database
      const { error } = await db.auth.updateUser({
        data: {
          brandColor: color,
        },
      });

      if (error) throw error;

      // Update theme color immediately
      updateThemeColor(color);
      setBrandColor(color);
      setShowColorPalette(false);

      // Force a re-render of the entire app
      window.location.reload();

      toast({
        title: 'Success',
        description: 'Brand color updated successfully',
      });
    } catch (error) {
      console.error('Error updating brand color:', error);
      toast({
        title: 'Error',
        description: 'Failed to update brand color',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('brandColor');
      const { error } = await db.auth.signOut();
      if (error) {
        console.error('Sign-out error:', error.message);
        toast({
          title: 'Error Signing Out: ',
          description: error.message,
        });
      } else {
        toast({
          title: 'Signing Out',
          description: 'Sign Out Successfully',
        });
        window.location.reload();
      }
    } catch (err: unknown) {
      console.error('Unexpected error during sign-out:', err);
      toast({
        title: 'Error Signing Out: ',
        description:
          err instanceof Error ? err.message : 'An unknown error occurred',
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
                'bg-gradient-to-br from-brand-500 to-brand-600 text-white',
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
          <CustomLink
            className="w-full flex items-center gap-2"
            href="/dashboard/profile"
          >
            <User className="w-4 h-4 " />
            <span className="text-base">Profile</span>
          </CustomLink>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <CustomLink
            className="w-full flex items-center gap-2"
            href="/dashboard/settings"
          >
            <Settings className="w-4 h-4 " />
            <span className="text-base">Settings</span>
          </CustomLink>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowColorPalette(true)}
        >
          <Popover open={showColorPalette}>
            <PopoverTrigger asChild>
              <div className="w-full flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: colorPalette.find(
                        (c) => c.value === brandColor
                      )?.color,
                    }}
                  />
                  <span className="text-base capitalize">{brandColor}</span>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[280px] p-4"
              align="end"
              onMouseEnter={() => setShowColorPalette(true)}
              onMouseLeave={() => setShowColorPalette(false)}
            >
              <div className="grid grid-cols-4 gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color.value}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-zinc-50 transition-colors"
                    onClick={() => handleColorChange(color.value)}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-zinc-200"
                      style={{
                        backgroundColor: color.color,
                        borderColor:
                          brandColor === color.value
                            ? color.color
                            : 'transparent',
                      }}
                    />
                    <span className="text-xs text-zinc-600 capitalize">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer"
          onClick={async () => {
            await handleSignOut();
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-base">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
