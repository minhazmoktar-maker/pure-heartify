import { describe, expect, it } from "vitest";
import {
  buildIndex,
  didYouMean,
  expandSynonyms,
  normalize,
  search,
} from "@/lib/searchEngine";

const corpus = [
  { id: "1", title: "Andrew Huberman explains dopamine and focus", channelTitle: "Huberman Lab" },
  { id: "2", title: "Quran recitation Surah Rahman", channelTitle: "Mishary Rashid" },
  { id: "3", title: "Mufti Menk Ramadan reminders", channelTitle: "Mufti Menk" },
  { id: "4", title: "Halal finance basics", channelTitle: "Islamic Finance Guru" },
  { id: "5", title: "Deep work and productivity", channelTitle: "Cal Newport" },
  { id: "6", title: "Nasheed collection", channelTitle: "Muslim Belal" },
  { id: "7", title: "Introduction to programming with Python", channelTitle: "Coder Talks" },
];

describe("normalize", () => {
  it("lowercases, strips punctuation and diacritics", () => {
    expect(normalize("  Qur'ān!!  ")).toBe("quran");
  });
  it("maps Islamic spelling variants", () => {
    expect(normalize("quraan")).toBe("quran");
    expect(normalize("mohammad")).toBe("muhammad");
    expect(normalize("ramadhan")).toBe("ramadan");
  });
});

describe("expandSynonyms", () => {
  it("includes cluster members", () => {
    const expanded = expandSynonyms(normalize("coding"));
    expect(expanded).toEqual(expect.arrayContaining(["coding", "programming"]));
  });
});

describe("search (typo tolerance + synonyms + ranking)", () => {
  const fuse = buildIndex(corpus);

  const cases: [string, string][] = [
    ["andrw hubrman", "1"],
    ["hubrman", "1"],
    ["quraan", "2"],
    ["ramadn", "3"],
    ["halal finance", "4"],
    ["deepwrk", "5"],
    ["progamming", "7"],
    ["isalm", "4"], // Islamic finance is closest via synonym
    ["nasheed", "6"],
  ];

  it.each(cases)("query %s returns %s in top results", (q, expectedId) => {
    const res = search(fuse, q, 5).map((r) => r.item.id);
    expect(res).toContain(expectedId);
  });
});

describe("didYouMean", () => {
  it("suggests close corpus tokens", () => {
    const s = didYouMean(corpus, "hubrmen");
    expect(s).toBe("huberman");
  });
  it("returns null on exact match", () => {
    expect(didYouMean(corpus, "huberman")).toBeNull();
  });
});
