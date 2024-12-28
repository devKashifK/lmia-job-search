import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Package,
  FileText,
  Building2,
  Settings,
  SettingsIcon,
} from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";

export function NavigationMenu() {
  return (
    <header className="border-b">
      <div className="w-full flex justify-between items-center px-6">
        <div className="flex h-16 items-center  gap-8">
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm">
              L
            </div>
            LIMA
          </div>
          <nav className="flex items-center gap-4 lg:gap-6">
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-primary font-medium flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Find a Job
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Billings
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Plans
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Saved Search
            </Link>
          </nav>
        </div>
        <div className="flex gap-4 justify-center items-center text-muted-foreground hover:text-primary">
          <div>
            <SettingsIcon className="h-4 w-4" />
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          </Avatar>
        </div>
      </div>
    </header>
  );
}
