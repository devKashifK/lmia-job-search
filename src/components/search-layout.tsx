import { Header } from "./header";
import { SearchFilters } from "./search/filters";
import { SearchResults } from "./search/results";

export function SearchLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <SearchFilters />
          <SearchResults />
        </div>
      </main>
    </div>
  );
}
