import { client } from "@/lib/elastic";

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
  await client.indices.delete({ index: INDEX_NAME });
} catch (e) {}

console.log("Creating books index...");
await client.indices.create(
  {
    index: INDEX_NAME,
    mappings: {
      properties: {
        id: { type: "keyword" }, // uri
        author: { type: "keyword" }, // author uri
        arabicNames: {
          type: "text",
          analyzer: "arabic",
          fields: {
            raw: {
              type: "keyword",
            },
            space: {
              type: "text",
              analyzer: "whitespace",
            },
            search_as_you_type: {
              type: "search_as_you_type",
            },
          },
        },
        latinNames: {
          type: "text",
          fields: {
            raw: {
              type: "keyword",
            },
            space: {
              type: "text",
              analyzer: "whitespace",
            },
            search_as_you_type: {
              type: "search_as_you_type",
            },
          },
        },
      },
    },
  },
  // if the index already exists, ignore the error
  { ignore: [400] },
);

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
for (const batch of batches) {
  console.log(`Indexing batch ${i} / ${batches.length}`);

  const operations = batch
    .filter((book: Book) => {
      // filter out books without uri or don't have arabic or latin title
      return (
        book.uri && (book.title_ar.length > 0 || book.title_lat.length > 0)
      );
    })
    .flatMap((book: Book) => {
      const author = book.uri.split(".")[0];

      return [
        { index: { _index: INDEX_NAME } },
        {
          id: book.uri,
          author,
          arabicNames: dedeupeNames(book.title_ar),
          latinNames: dedeupeNames(book.title_lat),
        },
      ];
    });

  const bulkResponse = await client.bulk({ refresh: true, operations });

  if (bulkResponse.errors) {
    const erroredDocuments: {
      // If the status is 429 it means that you can retry the document,
      // otherwise it's very likely a mapping error, and you should
      // fix the document before to try it again.
      status: any;
      error: any;
      operation: any;
      document: any;
    }[] = [];

    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]! as keyof typeof action;
      if (!action[operation]) return;

      if (action[operation]!.error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation]!.status,
          error: action[operation]!.error,
          operation: operations[i * 2],
          document: operations[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }

  i++;
}

const count = await client.count({ index: INDEX_NAME });
console.log(`Indexed ${count.count} books out of ${booksDataArray.length}`);
