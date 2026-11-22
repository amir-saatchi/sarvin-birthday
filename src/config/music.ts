export interface MusicTrack {
  title: string;
  src: string;
}

/**
 * Add your own MP3 files into `public/audio/` and list them here!
 * Example:
 *   export const MUSIC_TRACKS: MusicTrack[] = [
 *     { title: "Sarvin's Birthday Song", src: "/audio/birthday-song.mp3" },
 *     { title: "Unicorn Party", src: "/audio/unicorn-party.mp3" },
 *   ];
 *
 * When this list is empty, the website plays a built-in dreamy
 * Happy Birthday music-box melody automatically.
 */
export const MUSIC_TRACKS: MusicTrack[] = [];
