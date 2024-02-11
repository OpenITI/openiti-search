import { dedupeStrings } from "./utils";

type Book = {
  title_ar: string[];
  title_lat: string[];
  genre_tags: string[];
  versions: string[];
  relations: string[];
  uri: string; // gh uri authorUri.bookUri
};

type Author = {
  author_ar: string[];
  author_lat: string[];
  books: string[];
  date: string; // yyyy
  geo: string[];
  // name_elements: string[];
  // author_name_from_uri: string;
  full_name: string;
  shuhra: string;
  uri: string; // gh uri
  vers_uri: string;
};

export const getBooksData = async () => {
  const booksData: Record<string, Book> = await (
    await fetch(
      "https://raw.githubusercontent.com/OpenITI/kitab-metadata-automation/master/output/OpenITI_Github_clone_all_book_meta.json?v1",
      {
        cache: "no-store",
      },
    )
  ).json();

  return Object.values(booksData)
    .filter((book: Book) => {
      // filter out books without uri or don't have arabic or latin title
      return (
        !!book.uri && (book.title_ar.length > 0 || book.title_lat.length > 0)
      );
    })
    .map((book: Book) => {
      const author = book.uri.split(".")[0];

      const [primaryArabicName, ...otherArabicNames] = dedupeStrings(
        book.title_ar,
      );
      const [primaryLatinName, ...otherLatinNames] = dedupeStrings(
        book.title_lat,
      );

      return {
        id: book.uri,
        authorId: author,
        primaryArabicName,
        otherArabicNames,
        primaryLatinName,
        otherLatinNames,
        genreTags: book.genre_tags,
        versionIds: book.versions,
      };
    });
};

export const getAuthorsData = async () => {
  const authorsData: Record<string, Author> = await (
    await fetch(
      "https://raw.githubusercontent.com/OpenITI/kitab-metadata-automation/master/output/OpenITI_Github_clone_all_author_meta.json?v1",
      {
        cache: "no-store",
      },
    )
  ).json();

  return Object.values(authorsData).map((author: Author) => {
    const [primaryArabicName, ...otherArabicNames] = dedupeStrings(
      author.author_ar,
    );

    const latinNames = [...author.author_lat];
    if (author.shuhra.length > 0) {
      latinNames.unshift(author.shuhra); // use shuhra as a primary name if it exists
    }

    if (author.full_name.length > 0) {
      latinNames.push(author.full_name);
    }

    const [primaryLatinName, ...otherLatinNames] = dedupeStrings(latinNames);

    return {
      id: author.uri,
      year: Number(author.date),
      primaryArabicName,
      otherArabicNames,
      primaryLatinName,
      otherLatinNames,
    };
  });
};
