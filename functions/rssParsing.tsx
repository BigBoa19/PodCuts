import * as rssParser from 'react-native-rss-parser';

interface PodcastItem {
  title: string;
  description: string;
  enclosures?: Array<{
    url: string;
    type: string;
  }>;
  published: string;
}

interface PodcastEpisode {
  title: string;
  audioUrl: string;
  description: string;
  published: string;
}

export default async function getPodcastEpisodes(feedUrl: string): Promise<PodcastEpisode[]> {
  try {
    const response = await fetch(feedUrl);
    const responseData = await response.text();
    const feed = await rssParser.parse(responseData);
    
    const episodes: PodcastEpisode[] = [];

    if (feed.items && feed.items.length > 0) {
      feed.items.forEach((item: unknown) => {
        const episode = item as PodcastItem;
        if (episode.enclosures && episode.enclosures.length > 0) {

          episodes.push({
            title: episode.title,
            audioUrl: episode.enclosures[0].url,
            description: episode.description,
            published: episode.published,
          });
        }
      });
    }
    
    if (episodes.length === 0) {
      console.log('No episodes found in the feed');
    }
    return episodes;
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    return [];
  }
}