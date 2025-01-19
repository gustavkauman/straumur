import { XMLParser } from "fast-xml-parser";
import { RssFeed } from "./types";

export async function rssParse(feedUrl: string): Promise<RssFeed> {
    const response = await fetch(feedUrl, {
        method: "GET",
        headers: {
            "User-Agent": "Straumur-Rss-Parser"
        }
    });

    if (!response.ok)
        throw Error("Failed to parse feed");

    const parser = new XMLParser();

    /*
     * We should probably be operating on a stream instead of reading the entire
     * body in memory.
     * Hopefully, we will not see a big RSS feed until this is resolved.
     */
    const res = parser.parse(await response.text());

    const channel = res.rss.channel;
    const feed: RssFeed = {
        /*
         * Some sites will include multiple titles (which is not valid)
         * Looking at you, lobste.rs!...
         */
        title: Array.isArray(channel.title) ? channel.title[0] : channel.title,
        link: channel.link,
        description: channel.description
    };

    feed.items = channel.item;

    return feed;
}
