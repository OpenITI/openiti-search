"use server";

import { client } from "./typesense";
import type { AuthorDocument } from "@/types/author";
import type { BookDocument } from "@/types/book";
import type { Pagination } from '@/types/pagination';

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

export const searchAuthors = async (q: string, options?: SearchOptions) => {
  const { limit = DEFAULT_AUTHORS_PER_PAGE, page = 1 } = options ?? {};

  const results = await client
    .collections<AuthorDocument>(AUTHORS_INDEX)
    .documents()
    .search({
      q,
      query_by:
        "primaryArabicName, primaryLatinName, otherArabicNames, otherLatinNames",
      query_by_weights:
        "primaryArabicName:2, primaryLatinName:2, otherArabicNames:1, otherLatinNames:1",
      limit,
      page,
      ...(options?.sortBy && { sort_by: options.sortBy }),
    });

  return {
    results,
    pagination: makePagination(results.found, results.page, limit),
  };
};

export const searchBooks = async (q: string, options?: SearchOptions) => {
  const { limit = DEFAULT_BOOKS_PER_PAGE, page = 1 } = options ?? {};

  const results = await client
    .collections<
      BookDocument
    >(TITLES_INDEX)
    .documents()
    .search({
      q,
      query_by:
        "primaryArabicName, primaryLatinName, otherArabicNames, otherLatinNames",
      query_by_weights:
        "primaryArabicName:2, primaryLatinName:2, otherArabicNames:1, otherLatinNames:1",
      limit,
      page,
      ...(options?.sortBy && { sort_by: options.sortBy }),
    });

  return {
    results,
    pagination: makePagination(results.found, results.page, limit),
  };
};

export const search = async (q: string) => {
  const [
    { results: authors, pagination: authorsPagination },
    { results: books, pagination: booksPagination },
  ] = await Promise.all([searchAuthors(q), searchBooks(q)]);

  return {
    authors,
    books,
    authorsPagination,
    booksPagination,
  };
};
