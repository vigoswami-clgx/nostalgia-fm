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
  // { id: "song-001", title: "Song Title", artist: "Artist Name", film: "Film Name", year: 1988, duration: 248, videoId: "dQw4w9WgXcQ" },
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
