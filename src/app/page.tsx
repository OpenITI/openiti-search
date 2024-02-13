import { searchAuthors } from "@/lib/search";
import Header from "./header";
import SearchResults from "../components/search-results";
import AuthorItem from "@/components/author-item";

interface HomePageProps {
  searchParams: { q: string; page: string; sort: string };
}

const sorts = [
  { label: "Relevance", value: "relevance" },
  { label: "Year ASC", value: "year-asc" },
  { label: "Year DESC", value: "year-desc" },
] as const;

const getSortString = (sort: (typeof sorts)[number]["value"]) => {
  if (sort === "relevance") return undefined;

  if (sort === "year-asc") return "year:asc";
  if (sort === "year-desc") return "year:desc";
};

export default async function AuthorsPage({ searchParams }: HomePageProps) {
  const q = searchParams.q ?? "";
  const currentSort = searchParams.sort ?? "relevance";
  const sort = sorts.find((s) => s.value === currentSort)?.value ?? "relevance";

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const results = await searchAuthors(q, {
    limit: 20,
    page,
    sortBy: getSortString(sort),
  });

  return (
    <>
      <Header query={q} currentPage="authors" />

      <div className="mt-20 w-full">
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
          sorts={sorts as any}
          currentSort={sort}
        />
      </div>
    </>
  );
}
