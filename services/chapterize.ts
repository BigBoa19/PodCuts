import { Sentence } from "./transcribe";
import stringSimilarity from 'string-similarity';

const BASE_URL = 'https://podcuts-backend-production.up.railway.app';
const BACKEND_KEY = 'b7cf1295cdfc1b6d82c92ed666fc57fb7308afd36b2cbb3c92876d68225de09d';

interface Chapter {
    title: string;
    summary: string;
    start: number;
    end: number;
}

export function getTranscriptFromSentences(sentences: any[]) {
    let sentenceArray: string[] = []
    for (const sentence of sentences) {
        sentenceArray.push(sentence.text)
    }
    return sentenceArray.join(" ")
}

export default async function chapterize(sentences: Sentence[]) {
    if (!sentences || sentences.length === 0) return [];
    
    try {
        const transcriptFromSentences = getTranscriptFromSentences(sentences)

        console.log("CHAPTERIZING")
        const response = await fetch(`${BASE_URL}/api/chapterize`, {
            headers: {
                'x-podcuts-secret': `${BACKEND_KEY}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ transcript: transcriptFromSentences }),
        });
        const data = await response.json();

        let chaptersWithTimes: Chapter[] = []
        let searchIndex = 0
        for (let i = 0; i < data.chapters.length; i++) {
            const chapter = data.chapters[i]
            if (i == 0) {
                chaptersWithTimes.push({ title: chapter.title, summary: chapter.summary, start: 0, end: 0 })
                continue
            }

            let bestMatchTime = 0
            let highScore = 0
            let foundIndex = searchIndex
            for (let j = searchIndex; j < sentences.length; j++) {
                const score = stringSimilarity.compareTwoStrings(sentences[j].text, chapter.start_phrase)
                if (score > 0.85) break;
                if (score > highScore) {
                    highScore = score
                    bestMatchTime = sentences[j].start * 1000
                    foundIndex = j
                }
            }
            searchIndex = foundIndex

            chaptersWithTimes.push({ title: chapter.title, summary: chapter.summary, start: Math.floor(bestMatchTime), end: 0 })
        }

        // Fill in end fields
        for (let i = 0; i < chaptersWithTimes.length; i++) {
            if (i == chaptersWithTimes.length - 1) {
                chaptersWithTimes[i].end = sentences[sentences.length - 1].end * 1000
            }
            else {
                chaptersWithTimes[i].end = chaptersWithTimes[i + 1].start
            }
        }
        const finalChapters = cleanChapters(chaptersWithTimes);
        // console.log("Returning Chapters", finalChapters)
        return finalChapters
    } catch (error) {
        console.error('Error chapterizing audio:', error);
        return null;
    }
}

function cleanChapters(chapters: Chapter[]): Chapter[] {
    if (chapters.length === 0) return [];

    // Filter out ghosts (Like Chapter 2)
    const validChapters = chapters.filter(c => (c.end - c.start) > 1000); 

    if (validChapters.length === 0) return [];

    const merged: Chapter[] = [validChapters[0]];

    for (let i = 1; i < validChapters.length; i++) {
        const current = validChapters[i];
        const previous = merged[merged.length - 1];
        const duration = current.end - current.start;

        // Merge anything under 60 seconds (Fixes Ch 4, Ch 8, Ch 9)
        if (duration < 60000) { 
            previous.end = current.end;
        } else {
            merged.push(current);
        }
    }
    return merged;
}