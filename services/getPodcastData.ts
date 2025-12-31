export interface PodcastEpisode {
  id: string;
  title: string;
  audioUrl: string;
  description: string;
  datePublished: string;
  duration: number;
}

const BASE_URL = 'https://podcuts-backend-production.up.railway.app';
const BACKEND_KEY = 'b7cf1295cdfc1b6d82c92ed666fc57fb7308afd36b2cbb3c92876d68225de09d';

export default async function getPodcastEpisodes(id: string): Promise<PodcastEpisode[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/podcasts/episodes?feedId=${id}`, {
      headers: {
        'x-podcuts-secret': `${BACKEND_KEY}`
      }
    });
    const data = await response.json();
    // console.log(JSON.stringify(data, null, 2));
    const episodes: PodcastEpisode[] = data.map((episode: any) => ({
      id: episode.id,
      title: episode.title,
      audioUrl: episode.enclosureUrl,
      description: episode.description,
      datePublished: episode.datePublishedPretty,
      duration: episode.duration,
    }));
    return episodes;
  } catch (error) {
    console.error('Error getting podcast episodes:', error);
    return [];
  }
}