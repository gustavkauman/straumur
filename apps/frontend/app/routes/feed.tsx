import { json, Link, useLoaderData } from "@remix-run/react";
import { customAlphabet } from "nanoid";
import { rssParse } from "@straumur/rss-parser";
import type { Feed ,Article } from "@straumur/types";

export const loader = async () => {
    const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

    const feeds: { [index: string]: Feed } = {
        "lobsters": {
            id: "lobsters",
            name: "Lobsters",
            favicon_url: "https://lobste.rs/favicon.ico"
        }
    };

    const parsedFeed = await rssParse("https://lobste.rs/rss");
    const articles = parsedFeed.items?.map((item) => {
        return {
            id: nanoid(),
            feed_id: "lobsters",
            title: item.title,
            url: item.link,
            author: item.author,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null
        } as Article;
    });

    return json({
        feeds, 
        articles: articles ?? [] 
    });
}

export default function Feed() {
    const { feeds, articles } = useLoaderData<typeof loader>();

    return (
        <div className="flex h-screen">
            <div className="flex w-[300px] px-4 justify-center">
                <h1>Straumur</h1>
            </div>
            <div className="flex-col flex-1 self-center overflow-scroll">
                {
                    articles.map((article) => (
                        <div key={article.id} className="flex items-center h-[45px] my-4">
                            <img 
                                src={feeds[article.feed_id].favicon_url}
                                alt={`${feeds[article.feed_id].name} logo`}
                                className="rounded-full max-h-full max-w-full object-contain"
                            />
                            <div className="flex flex-col ml-6">
                                <Link
                                    to={article.url}
                                    className="text-lg"
                                >
                                    {article.title}
                                </Link>
                                <p className="text-xs">{article.author}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
