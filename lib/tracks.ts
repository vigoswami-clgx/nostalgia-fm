export type Track = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number;
  duration: number;
  videoId: string;
};

export type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
};

const goldenEra: Track[] = [
  { id: "t1", title: "Darmiyaan (Unplugged)", artist: "Rekha Bhardwaj, Raghav Chaitanya, Amrita Singh", film: "Musafir Cafe", year: 0, duration: 0, videoId: "" },
  { id: "t2", title: "Jab Tu Sajan", artist: "Mohit Chauhan, Gurpreet Saini", film: "Aap Jaisa Koi", year: 0, duration: 0, videoId: "" },
  { id: "t3", title: "Chori Chori", artist: "Amit Trivedi", film: "Grahan", year: 2021, duration: 0, videoId: "" },
  { id: "t4", title: "Ek Dil Ek Jaan", artist: "Shivam Pathak", film: "Padmaavat", year: 2018, duration: 0, videoId: "" },
  { id: "t5", title: "Parvati", artist: "Hanuman Ansh", film: "Jab Zid Pe Aa Gayi Parvati", year: 0, duration: 0, videoId: "" },
  { id: "t6", title: "Shiv Kailash (Live in Mumbai)", artist: "Rishab Rikhiram Sharma", film: "Sitar for Mental Health", year: 0, duration: 0, videoId: "" },
  { id: "t7", title: "Dooron Dooron (Live)", artist: "Paresh Pahuja", film: "The Voice Notes Concert", year: 0, duration: 0, videoId: "" },
];

const monsoon: Track[] = [
  // { id: "song-001", title: "Song Title", artist: "Artist Name", film: "Film Name", year: 1988, duration: 248, videoId: "dQw4w9WgXcQ" },
];

const lateNight: Track[] = [
  // { id: "song-001", title: "Song Title", artist: "Artist Name", film: "Film Name", year: 1988, duration: 248, videoId: "dQw4w9WgXcQ" },
];

export const playlists: Playlist[] = [
  { id: "golden-era", name: "Golden Era", tracks: goldenEra },
  { id: "monsoon", name: "Monsoon", tracks: monsoon },
  { id: "late-night", name: "Late Night", tracks: lateNight },
];
