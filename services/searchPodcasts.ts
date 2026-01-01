const BASE_URL = 'https://podcuts-backend-production.up.railway.app';
const BACKEND_KEY = 'b7cf1295cdfc1b6d82c92ed666fc57fb7308afd36b2cbb3c92876d68225de09d';

export interface Podcast {
    id: string;
    title: string;
    image: string;
    description: string;
    author: string;
    episodeCount: number;
    category?: string;
    newestItemPubdate?: number;
}

export default async function searchPodcasts(searchTerm: string): Promise<Podcast[]> {
    try {
        const response = await fetch(`${BASE_URL}/api/podcasts/search?term=${searchTerm}`, {
            headers: {
                'x-podcuts-secret': `${BACKEND_KEY}`
            }
        });
        const data = await response.json();
        // console.log(JSON.stringify(data, null, 2));
        const podcasts: Podcast[] = data.map((podcast: any) => {
            // Extract first category name from categories object
            const category = podcast.categories ? Object.values(podcast.categories)[0] as string : undefined;
            
            return {
                id: podcast.id,
                title: podcast.title,
                image: podcast.image,
                description: podcast.description,
                author: podcast.author || podcast.ownerName,
                episodeCount: podcast.episodeCount,
                category: category,
                newestItemPubdate: podcast.newestItemPubdate,
            };
        });
        return podcasts;
    } catch (error) {
        console.error('Error searching podcasts:', error);
        return [];
    }
};

export async function getPodcastData(id: string): Promise<Podcast | null> {
    try {
        const response = await fetch(`${BASE_URL}/api/podcasts/${id}`, {
            headers: {
                'x-podcuts-secret': `${BACKEND_KEY}`
            }
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
        
        // Use the title to search and find the matching podcast with newestItemPubdate
        let newestItemPubdate: number | undefined = undefined;
        if (data.title) {
            try {
                const searchResults = await searchPodcasts(data.title);
                const matchingPodcast = searchResults.find(podcast => String(podcast.id) === String(id));
                if (matchingPodcast) {
                    newestItemPubdate = matchingPodcast.newestItemPubdate;
                }
            } catch (searchError) {
                console.warn('Could not search podcasts to get newestItemPubdate:', searchError);
            }
        }

        console.log("Category: ", data.categories ? Object.values(data.categories)[0] as string : undefined);
        
        return {
            id: data.id,
            title: data.title,
            image: data.image,
            description: data.description,
            author: data.author || data.ownerName,
            episodeCount: data.episodeCount,
            category: Object.values(data.categories)[0] as string,
            newestItemPubdate: newestItemPubdate,
        };

    }
    catch (error) {
        console.error('Error getting podcast data:', error);
        return null;
    }
}