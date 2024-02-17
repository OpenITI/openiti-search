import { Language, quran } from "@quranjs/api";

const allChapters = await quran.v4.chapters.findAll({
  language: Language.ENGLISH,
});

const variations = allChapters.map((chapter) => {
  const id = chapter.id;
  const shortName = chapter.translatedName.name;
  const nameSimple = chapter.nameSimple;
  const nameComplex = chapter.nameComplex;
  const nameArabic = chapter.nameArabic;

  return [
    id,
    shortName,
    nameSimple,
    nameArabic,
    nameComplex,
    `Surat ${nameSimple}`,
    `Surah ${nameSimple}`,
    `Sura ${nameSimple}`,

    `Surat ${id}`,
    `Surah ${id}`,
    `Sura ${id}`,

    `Surat ${shortName}`,
    `Surah ${shortName}`,
    `Sura ${shortName}`,

    `Chapter ${id}`,
    `Ch ${id}`,
    // `#{id.ordinalize} surah`
  ];
});

console.log(variations);
