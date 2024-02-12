import { searchBooks } from "@/lib/search";
import Header from "../header";
import SearchResults from "@/components/search-results";
import BookItem from "@/components/book-item";

interface HomePageProps {
  searchParams: { q: string; page: string };
}

export default async function BooksPage({ searchParams }: HomePageProps) {
  const q = searchParams.q ?? "";
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const results = await searchBooks(q, { limit: 20, page });

  return (
    <>
      <Header query={q} currentPage="books" />

      <div className="mt-10 w-full">
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
        />
      </div>
    </>
  );
}
