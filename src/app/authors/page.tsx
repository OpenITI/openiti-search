import { searchAuthors } from "@/lib/search";
import Header from "../_components/header";
import SearchResults from "../../components/search-results";
import AuthorItem from "@/components/author-item";
import Container from "@/components/ui/container";
import { SearchMode } from "@/types/search-mode";
import { authorSorts } from "@/lib/url";
import { type InferPagePropsType } from "next-typesafe-url";
import { withParamValidation } from "next-typesafe-url/app/hoc";
import { Route, type RouteType } from "./routeType";
import YearFilter from "../_components/author-filters/year";
import GeographiesFilter from "../_components/author-filters/geo";
import { gregorianYearToHijriYear } from "@/lib/date";

type HomePageProps = InferPagePropsType<RouteType>;

const getSortString = (sort: (typeof authorSorts)[number]["value"]) => {
  if (sort === "relevance") return undefined;

  if (sort === "year-asc") return "year:asc";
  if (sort === "year-desc") return "year:desc";
};

export const dynamic = "force-dynamic";

async function AuthorsPage({ searchParams }: HomePageProps) {
  const { q, sort, page, year, geo } = searchParams;

  const results = await searchAuthors(q, {
    limit: 20,
    page,
    sortBy: getSortString(sort),
    filters: {
      yearRange: year,
      geographies: geo,
    },
  });

  return (
    <>
      <Header query={q} currentMode={SearchMode.Authors} />

      <Container className="mt-10 sm:mt-16">
        <SearchResults
          response={results.results}
          pagination={results.pagination}
          renderResult={(result) => <AuthorItem result={result} />}
          emptyMessage="No authors found"
          sorts={authorSorts as any}
          currentSort={sort}
          filters={
            <>
              <YearFilter
                defaultRange={searchParams.year as any}
                maxYear={gregorianYearToHijriYear(new Date().getFullYear())}
              />

              <GeographiesFilter currentGeographies={searchParams.geo} />
            </>
          }
        />
      </Container>
    </>
  );
}

export default withParamValidation(AuthorsPage, Route);
