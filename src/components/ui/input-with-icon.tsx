import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";
import { useId } from "react";

export default function IconInput({ ...props }) {
  const id = useId();
  return (
    <div className="relative">
      <Input
        id={id}
        className="peer pe-9 ps-9 focus-visible:border-active focus-visible:ring-0 focus-visible:ring-red-600"
        placeholder="Search..."
        type="search"
        {...props}
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
        <Search size={16} strokeWidth={2} />
      </div>
      <button
        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Submit search"
        type="submit"
      >
        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
