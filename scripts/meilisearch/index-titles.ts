import { client } from "@/lib/meilisearch";

type Book = {
  title_ar: string[];
  title_lat: string[];
  genre_tags: string[];
  versions: string[];
  relations: string[];
  uri: string; // gh uri authorUri.bookUri
};

const INDEX_NAME = "books";

console.log("Fetching books data...");
const booksData: Record<string, Book> = await (
  await fetch(
    "https://raw.githubusercontent.com/OpenITI/kitab-metadata-automation/master/output/OpenITI_Github_clone_all_book_meta.json?v1",
  )
).json();

try {
  console.log("Deleting books index...");
  // delete the index if it already exists
  await client.index(INDEX_NAME).delete();
} catch (e) {}

console.log("Creating books index...");
await client.createIndex(INDEX_NAME, {
  primaryKey: "id",
});

const chunk = (arr: any[], size: number) => {
  return arr.reduce(
    (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
    [],
  );
};

const dedeupeNames = (names: string[]) => {
  return Array.from(new Set(names.map((n) => n.trim())));
};

const booksDataArray = Object.values(booksData);
const batches = chunk(booksDataArray, 100);

console.log(
  `Starting indexing for ${booksDataArray.length} books in ${batches.length} batches...`,
);

let i = 1;
let total = 0;
for (const batch of batches) {
  console.log(`Indexing batch ${i} / ${batches.length}`);

  const operations = batch
    .filter((book: Book) => {
      // filter out books without uri or don't have arabic or latin title
      return (
        book.uri && (book.title_ar.length > 0 || book.title_lat.length > 0)
      );
    })
    .map((book: Book) => {
      const author = book.uri.split(".")[0];

      return {
        id: book.uri,
        authorId: author,
        arabicNames: dedeupeNames(book.title_ar),
        latinNames: dedeupeNames(book.title_lat),
      };
    });

  await client.index(INDEX_NAME).addDocuments(operations);
  total += operations.length;
  i++;
}

console.log(`Indexed ${total} books out of ${booksDataArray.length}`);
