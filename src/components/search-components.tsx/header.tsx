import { BriefcaseBusiness, FileDown, Save } from "lucide-react";
import { Button } from "../ui/button";
import { SearchBar } from "./search-bar";

import { Filter } from "../filters/filter";

export default function Header() {
  return (
    <div className="bg-gray-100 h-14 flex justify-between items-center px-6 border-b">
      <div className="flex justify-center items-center gap-2">
        <BriefcaseBusiness className="h-4 w-4" />
        Find a job (130)
      </div>
      <div className="flex gap-4">
        <SearchBar />
        <Filter />
        <Export />
        <SaveSearch />
      </div>
    </div>
  );
}

export function Export() {
  return (
    <Button className="flex justify-center items-center gap-2 shadow-none hover:bg-purple-800 hover:text-white bg-white text-black border-2 border-gray-200 hover:border-purple-600 rounded-sm transition-all duration-100">
      <FileDown className="h-4 w-4" />
      Export
    </Button>
  );
}

export function SaveSearch() {
  return (
    <Button className="flex justify-center items-center gap-2 shadow-none hover:bg-purple-800 hover:text-white bg-white text-black border-2 border-gray-200 hover:border-purple-600 rounded-sm transition-all duration-100">
      <Save className="h-4 w-4" />
      Save
    </Button>
  );
}
