// when the search query changes
export const getQueryUrlParams = (term: string) => {
  const oldParams = new URLSearchParams(window.location.search);

  const sort = oldParams.get("sort");
  const authors = oldParams.get("authors");

  const newParams = new URLSearchParams();

  if (term) {
    newParams.set("q", term);
  } else {
    newParams.delete("q");
  }

  if (sort) {
    newParams.set("sort", sort);
  }

  if (authors) {
    newParams.set("authors", authors);
  }

  return newParams;
};

// when the search query changes
export const getYearFilterUrlParams = (from: number, to: number) => {
  const params = new URLSearchParams(window.location.search);

  // make sure to reset pagination state
  if (params.has("page")) {
    params.delete("page");
  }

  params.set("year", `${from}-${to}`);

  return params;
};

// when the search query changes
export const getGeoFilterUrlParams = (geos: string[]) => {
  const params = new URLSearchParams(window.location.search);

  // make sure to reset pagination state
  if (params.has("page")) {
    params.delete("page");
  }

  if (geos.length === 0) {
    params.delete("geo");
  } else {
    params.set("geo", geos.join(","));
  }

  return params;
};

export const getGenresFilterUrlParams = (genres: string[]) => {
  const params = new URLSearchParams(window.location.search);

  // make sure to reset pagination state
  if (params.has("page")) {
    params.delete("page");
  }

  if (genres.length === 0) {
    params.delete("genres");
  } else {
    params.set("genres", genres.join(","));
  }

  return params;
};

export const getAuthorsFilterUrlParams = (authors: string[]) => {
  const params = new URLSearchParams(window.location.search);

  // make sure to reset pagination state
  if (params.has("page")) {
    params.delete("page");
  }

  if (authors.length === 0) {
    params.delete("authors");
  } else {
    params.set("authors", authors.join(","));
  }

  return params;
};

export const authorSorts = [
  { label: "Relevance", value: "relevance" },
  { label: "Year ASC", value: "year-asc" },
  { label: "Year DESC", value: "year-desc" },
] as const;

export const bookSorts = [{ label: "Relevance", value: "relevance" }] as const;
