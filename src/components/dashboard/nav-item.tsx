import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

export function NavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  badge,
}: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-3 h-11 relative group",
        isActive
          ? "bg-brand-50 text-brand-600 hover:bg-brand-50/80"
          : "text-zinc-600 hover:bg-zinc-50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1">
        <Icon
          className={cn(
            "w-4 h-4 transition-colors",
            isActive
              ? "text-brand-600"
              : "text-zinc-500 group-hover:text-zinc-800"
          )}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-5 min-w-[20px] rounded-full bg-brand-100 text-brand-600 text-xs font-medium flex items-center justify-center px-1.5"
          >
            {badge}
          </motion.div>
        </span>
      )}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Button>
  );
}
