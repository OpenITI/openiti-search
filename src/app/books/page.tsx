import { searchBooks } from "@/lib/search";
import Header from "../header";
import SearchResults from "@/components/search-results";
import BookItem from "@/components/book-item";

interface HomePageProps {
  searchParams: { q: string; page: string; sort?: string };
}

const sorts = [
  { label: "Relevance", value: "relevance" },
  // { label: "Year ASC", value: "year-asc" },
  // { label: "Year DESC", value: "year-desc" },
] as const;

const getSortString = (sort: (typeof sorts)[number]["value"]) => {
  if (sort === "relevance") return undefined;

  // if (sort === "year-asc") return "year:asc";
  // if (sort === "year-desc") return "year:desc";
};

export default async function BooksPage({ searchParams }: HomePageProps) {
  const q = searchParams.q ?? "";
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const currentSort = searchParams.sort ?? "relevance";
  const sort = sorts.find((s) => s.value === currentSort)?.value ?? "relevance";
  const results = await searchBooks(q, {
    limit: 20,
    page,
    sortBy: getSortString(sort),
  });

  return (
    <>
      <Header query={q} currentPage="books" />

      <div className="mt-20 w-full">
        <SearchResults
          response={results.results}
          pagination={results.pagination}
          renderResult={(result) => <BookItem result={result} />}
          columns={[
            {
              title: "Title",
              className: "flex-[1.5]",
            },
            {
              title: "Author",
              className: "text-center",
            },
            {
              title: "Versions",
              className: "text-center",
            },
            {
              title: "Tags",
              className: "text-center pr-16",
            },
          ]}
          emptyMessage="No books found"
          sorts={sorts as any}
          currentSort={sort}
        />
      </div>
    </>
  );
}
