"use server";

import type { AuthorDocument } from "@/types/author";
import type { BookDocument } from "@/types/book";
import { client } from "./elastic";

const PREFIX_SLOP = 1;
const isArabicRegex = /[\u0600-\u06FF]/;

export const searchAuthors = async (q: string) => {
  const isArabic = isArabicRegex.test(q);
  const fieldToSearch = isArabic ? "arabicNames" : "latinNames";

  const result = await client.search<AuthorDocument>({
    index: "authors",
    query: {
      bool: {
        // must: [
        //   {
        //     multi_match: {
        //       query: q,
        //       type: "best_fields", // Use "best_fields" for best match against multiple fields
        //       fields: ["arabicNames", "latinNames"], // Fields to search against
        //       tie_breaker: 0.3, // Use for scoring based on the best field match
        //     },
        //   },
        // ],
        should: [
          // boost exact matches
          {
            term: {
              "arabicNames.raw": {
                value: q,
                boost: 10,
                case_insensitive: true,
              },
            },
          },
          {
            term: {
              "latinNames.raw": {
                value: q,
                boost: 10,
                case_insensitive: true,
              },
            },
          },
          {
            match: {
              arabicNames: {
                query: q,
                boost: 2, // Boosting relevance score for exact matches in Arabic names
              },
            },
          },
          {
            match: {
              latinNames: {
                query: q,
                boost: 2, // Boosting for exact matches in Latin names
              },
            },
          },
          {
            match_phrase: {
              arabicNames: {
                query: q,
                boost: 3, // Boosting relevance score for exact matches in Arabic names
              },
            },
          },
          {
            match_phrase: {
              latinNames: {
                query: q,
                boost: 3, // Boosting for exact matches in Latin names
              },
            },
          },
          // it can match the prefix as well
          {
            match_phrase_prefix: {
              arabicNames: {
                query: q,
                slop: PREFIX_SLOP, // Allow for a small number of additional words in the match
                boost: 3, // Boosting for matches with a small number of additional words
              },
            },
          },
          {
            match_phrase_prefix: {
              latinNames: {
                query: q,
                slop: PREFIX_SLOP, // Allow for a small number of additional words in the match
                boost: 3, // Boosting for matches with a small number of additional words
              },
            },
          },
        ],

        // should: [
        //   {
        //     multi_match: {
        //       query: q,
        //       fields: ["arabicNames^1", "latinNames^1"], // Adjusted the boost to 1 for uniformity
        //       fuzziness: "AUTO", // Enabling fuzziness
        //       prefix_length: 1, // Optional: to reduce the impact of fuzziness at the beginning of the term
        //     },
        //   },
        //   {
        //     match: {
        //       arabicNames: {
        //         query: q,
        //         fuzziness: "AUTO",
        //         prefix_length: 1, // Reducing the impact of fuzziness at the beginning
        //         boost: 2,
        //       },
        //     },
        //   },
        //   {
        //     match: {
        //       latinNames: {
        //         query: q,
        //         fuzziness: "AUTO",
        //         prefix_length: 1,
        //         boost: 2,
        //       },
        //     },
        //   },
        //   // boost exact matches
        //   {
        //     match_phrase: {
        //       arabicNames: {
        //         query: q,
        //         boost: 3,
        //       },
        //     },
        //   },
        //   {
        //     match_phrase: {
        //       latinNames: {
        //         query: q,
        //         boost: 3,
        //       },
        //     },
        //   },
        // ],
        minimum_should_match: 2, // At least one should condition must be met
      },
    },
    _source: ["id", "arabicNames", "latinNames", "shuhra"],
    sort: [
      {
        _score: {
          order: "desc",
        },
      },
    ],
    size: 5, // limit to 3 results
  });

  return result.hits.hits;
};

export const searchBooks = async (q: string) => {
  const isArabic = isArabicRegex.test(q);
  const fieldToSearch = isArabic ? "arabicNames" : "latinNames";

  const result = await client.search<BookDocument>({
    index: "books",
    query: {
      bool: {
        should: [
          {
            multi_match: {
              query: q,
              fields: ["arabicNames^1", "latinNames^1"], // Adjusted the boost to 1 for uniformity
              fuzziness: "AUTO", // Enabling fuzziness
              prefix_length: 1, // Optional: to reduce the impact of fuzziness at the beginning of the term
            },
          },
          {
            match: {
              arabicNames: {
                query: q,
                fuzziness: "AUTO",
                prefix_length: 1, // Reducing the impact of fuzziness at the beginning
                boost: 2,
              },
            },
          },
          {
            match: {
              latinNames: {
                query: q,
                fuzziness: "AUTO",
                prefix_length: 1,
                boost: 2,
              },
            },
          },
        ],
        minimum_should_match: 1, // Requires at least one 'should' condition to match
      },
    },
    highlight: {
      // Optional: Highlighting matching text snippets
      fields: {
        arabicNames: {},
        latinNames: {},
      },
    },
    sort: [],
    size: 20, // limit to 20 results
  });

  return result.hits.hits;
};

export const search = async (q: string) => {
  const [authors, books] = await Promise.all([
    searchAuthors(q),
    searchBooks(q),
  ]);

  return {
    authors,
    books,
  };
};
