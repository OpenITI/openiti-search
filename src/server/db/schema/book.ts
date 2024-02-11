import { text, json, varchar } from "drizzle-orm/mysql-core";
import { createTable } from "./utils";
import { author } from ".";
import { relations } from "drizzle-orm";

export const book = createTable("book", {
  id: varchar("id", { length: 256 }).primaryKey(),
  authorId: text("author_id").notNull(),
  primaryArabicName: text("primary_arabic_name"),
  otherArabicNames: json("other_arabic_names")
    .$type<string[]>()
    .default([])
    .notNull(),
  primaryLatinName: text("primary_latin_name"),
  otherLatinNames: json("other_latin_names")
    .$type<string[]>()
    .default([])
    .notNull(),
  genre_tags: json("genre_tags").$type<string[]>().default([]).notNull(),
  version_ids: json("version_ids").$type<string[]>().default([]).notNull(),
});

export const bookRelations = relations(book, ({ one }) => ({
  author: one(author, {
    fields: [book.authorId],
    references: [author.id],
  }),
}));
