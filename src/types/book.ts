import type { AuthorDocument } from "./author";

export type BookDocument = {
  id: string;
  authorId: string;
  primaryArabicName: string;
  otherArabicNames: string[];
  primaryLatinName: string;
  otherLatinNames: string[];
  author: AuthorDocument;
  versionIds: string[];
  genreTags: string[];
};
