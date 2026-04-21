export type ServiceType =
  | "Sunday Morning Worship"
  | "Sunday Evening Service"
  | "Wednesday Evening Service"
  | "Special Service"
  | "Funeral Service"
  | "Unknown";

export interface ScriptureReference {
  id: string;
  sermon_id: string;
  book: string;
  chapter: number | null;
  verse_start: number | null;
  verse_end: number | null;
  reference_text: string; // e.g. "John 3:16-17"
}

export interface SermonTag {
  id: string;
  sermon_id: string;
  tag_type: "theme" | "character" | "topic";
  tag_value: string;
}

export interface Sermon {
  id: string;
  sermon_id: string;           // e.g. S0001
  title: string | null;
  date: string | null;         // ISO date string
  service_type: ServiceType;
  speaker: string;
  series_name: string | null;
  series_chapter: number | null;
  audio_url: string;
  original_filename: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  transcript: string | null;
  is_private: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  scripture_references?: ScriptureReference[];
  sermon_tags?: SermonTag[];
}

export interface SermonSummary {
  id: string;
  sermon_id: string;
  title: string | null;
  date: string | null;
  service_type: ServiceType;
  speaker: string;
  series_name: string | null;
  series_chapter: number | null;
  audio_url: string;
  duration_seconds: number | null;
  scripture_references?: ScriptureReference[];
  sermon_tags?: SermonTag[];
}

export const BIBLE_BOOKS_OT = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1 Samuel","2 Samuel",
  "1 Kings","2 Kings","1 Chronicles","2 Chronicles",
  "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs",
  "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah",
  "Haggai","Zechariah","Malachi",
];

export const BIBLE_BOOKS_NT = [
  "Matthew","Mark","Luke","John","Acts",
  "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John","3 John",
  "Jude","Revelation",
];

export const BIBLE_BOOKS = [...BIBLE_BOOKS_OT, ...BIBLE_BOOKS_NT];
