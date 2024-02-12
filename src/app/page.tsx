import { searchAuthors } from "@/lib/search";
import Header from "./header";
import SearchResults from "../components/search-results";
import AuthorItem from "@/components/author-item";

interface HomePageProps {
  searchParams: { q: string; page: string };
}

export default async function AuthorsPage({ searchParams }: HomePageProps) {
  const q = searchParams.q ?? "";
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const results = await searchAuthors(q, { limit: 20, page });

  return (
    <>
      <Header query={q} currentPage="authors" />

      <div className="mt-10 w-full">
        <SearchResults
          response={results.results}
          pagination={results.pagination}
          renderResult={(result) => <AuthorItem result={result} />}
          columns={[
            {
              title: "Name",
            },
            {
              title: "Books",
              className: "text-center",
            },
            {
              title: "Year",
              className: "flex-[0.5] text-center pr-16",
            },
          ]}
          emptyMessage="No authors found"
        />
      </div>
    </>
  );
}
