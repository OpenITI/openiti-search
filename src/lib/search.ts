"use server";

import { client } from "./typesense";
import type { AuthorDocument } from "@/types/author";
import type { BookDocument } from "@/types/book";
import type { Pagination } from "@/types/pagination";

const AUTHORS_INDEX = "authors";
const TITLES_INDEX = "books";

const DEFAULT_AUTHORS_PER_PAGE = 5;
const DEFAULT_BOOKS_PER_PAGE = 20;

const makePagination = (
  totalRecords: number,
  currentPage: number,
  perPage: number,
): Pagination => {
  const totalPages = Math.ceil(totalRecords / perPage);

  return {
    totalRecords,
    totalPages,
    currentPage,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
};

interface SearchOptions {
  limit?: number;
  page?: number;
  sortBy?: string;
}

const authorsQueryWeights = {
  2: ["primaryArabicName", "primaryLatinName"],
  1: ["_nameVariations", "otherArabicNames", "otherLatinNames"],
};
const authorsQueryBy = Object.values(authorsQueryWeights).flat().join(", ");
const authorsQueryByWeights = Object.keys(authorsQueryWeights)
  // @ts-ignore
  .map((weight) => new Array(authorsQueryWeights[weight]!.length).fill(weight))
  .flat()
  .join(", ");

export const searchAuthors = async (q: string, options?: SearchOptions) => {
  const { limit = DEFAULT_AUTHORS_PER_PAGE, page = 1 } = options ?? {};

  const results = await client
    .collections<AuthorDocument>(AUTHORS_INDEX)
    .documents()
    .search({
      q: prepareQuery(q),
      query_by: authorsQueryBy,
      query_by_weights: authorsQueryByWeights,
      limit,
      page,
      prioritize_token_position: true,
      ...(options?.sortBy && { sort_by: options.sortBy }),
    });

  return {
    results,
    pagination: makePagination(results.found, results.page, limit),
  };
};

const booksQueryWeights = {
  4: ["primaryArabicName", "primaryLatinName"],
  3: ["_nameVariations", "otherArabicNames", "otherLatinNames"],
  2: ["author.primaryArabicName", "author.primaryLatinName"],
  1: [
    "author._nameVariations",
    "author.otherArabicNames",
    "author.otherLatinNames",
  ],
};

const booksQueryBy = Object.values(booksQueryWeights).flat().join(", ");
const booksQueryByWeights = Object.keys(booksQueryWeights)
  // @ts-ignore
  .map((weight) => new Array(booksQueryWeights[weight]!.length).fill(weight))
  .flat()
  .join(", ");

export const searchBooks = async (q: string, options?: SearchOptions) => {
  const { limit = DEFAULT_BOOKS_PER_PAGE, page = 1 } = options ?? {};

  const results = await client
    .collections<BookDocument>(TITLES_INDEX)
    .documents()
    .search({
      q: prepareQuery(q),
      query_by: booksQueryBy,
      query_by_weights: booksQueryByWeights,
      prioritize_token_position: true,
      limit,
      page,
      ...(options?.sortBy && { sort_by: options.sortBy }),
    });

  return {
    results,
    pagination: makePagination(results.found, results.page, limit),
  };
};

const prepareQuery = (q: string) => {
  const final = [q];

  const queryWithoutAl = q.replace(/(al-)/gi, "");
  if (queryWithoutAl !== q) final.push(queryWithoutAl);

  return final.join(" || ");
};
