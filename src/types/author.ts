import type { BookDocument } from "./book";

export type AuthorDocument = {
  id: string;
  year: number;
  primaryArabicName: string;
  otherArabicNames: string[];
  primaryLatinName: string;
  otherLatinNames: string[];
  books: BookDocument[];
};
