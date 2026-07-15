import { siteConfig } from './site-config';

const YOUTUBE_PLAYLIST_ITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

function pickThumbnail(thumbnails = {}) {
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ''
  );
}

async function fetchPlaylistItems(apiKey, playlistId) {
  const items = [];
  let pageToken = '';

  do {
    const url = new URL(YOUTUBE_PLAYLIST_ITEMS_URL);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('key', apiKey);

    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const response = await fetch(url, {
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) {
      console.error('YouTube playlist fetch failed:', response.status, await response.text());
      throw new Error('youtube-fetch-failed');
    }

    const data = await response.json();
    items.push(...(data.items || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return items;
}

export async function getRabbiClassVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const playlists = siteConfig.youtube.rabbiClassPlaylists?.length
    ? siteConfig.youtube.rabbiClassPlaylists
    : [
        {
          id: 'classes',
          name: 'שיעורים כלליים',
          playlistId: siteConfig.youtube.rabbiClassesPlaylistId,
        },
      ];

  if (!apiKey) {
    return {
      videos: [],
      error: 'missing-api-key',
    };
  }

  try {
    const playlistResults = await Promise.all(
      playlists.map(async (playlist, playlistIndex) => {
        const items = await fetchPlaylistItems(apiKey, playlist.playlistId);

        return items
          .map((item) => {
            const snippet = item.snippet || {};
            const videoId = snippet.resourceId?.videoId;
            const title = snippet.title || '';

            if (!videoId || title === 'Private video' || title === 'Deleted video') {
              return null;
            }

            return {
              id: `${playlist.id}-${videoId}`,
              videoId,
              title,
              description: snippet.description || '',
              publishedAt: snippet.publishedAt || '',
              position: Number(snippet.position ?? 0),
              playlistIndex,
              rabbiId: playlist.id,
              rabbiName: playlist.name,
              thumbnail: pickThumbnail(snippet.thumbnails),
              url: `https://www.youtube.com/watch?v=${videoId}`,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
            };
          })
          .filter(Boolean);
      })
    );

    const videos = playlistResults.flat().sort((a, b) => {
      if (a.playlistIndex !== b.playlistIndex) return a.playlistIndex - b.playlistIndex;
      return b.position - a.position;
    });

    return {
      videos,
      error: null,
    };
  } catch (error) {
    console.error('YouTube playlist fetch error:', error);
    return {
      videos: [],
      error: 'youtube-fetch-error',
    };
  }
}
