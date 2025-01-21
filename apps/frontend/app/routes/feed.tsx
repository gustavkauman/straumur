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
        },
        "hackernews": {
            id: "hackernews",
            name: "Hacker News",
            favicon_url: "https://news.ycombinator.com/favicon.ico"
        }
    };

    const lobstersFeed = await rssParse("https://lobste.rs/rss");
    const lobstersArticles = lobstersFeed.items?.map((item) => {
        return {
            id: nanoid(),
            feed_id: "lobsters",
            title: item.title,
            url: item.link,
            author: item.author,
            published_at: item.pubDate ? new Date(item.pubDate) : null
        } as Article;
    });

    const hnFeed = await rssParse("https://news.ycombinator.com/rss");
    const hnArticles = hnFeed.items?.map((item) => {
        return {
            id: nanoid(),
            feed_id: "hackernews",
            title: item.title,
            url: item.link,
            author: item.author,
            published_at: item.pubDate ? new Date(item.pubDate) : null
        } as Article;
    });

    const articles = lobstersArticles?.concat(hnArticles ?? []) ?? [];
    articles.sort((a, b) => a.published_at.getTime() - b.published_at.getTime());

    return json({
        feeds, 
        articles
    });
}

export default function Feed() {
    const { feeds, articles } = useLoaderData<typeof loader>();

    return (
        <div className="flex flex-col max-h-screen">
            <div className="
                flex sticky top-0 z-40 w-full h-[3rem] dark:bg-gray-950 align-middle justify-center leading-[3rem]
                px-4 text-end border-b border-slate-50/[0.06]
            ">
                <div className="flex justify-end w-[80%]">
                    <p>Howdy, user!</p>
                </div>
            </div>
            <div className="w-[90rem] mx-auto px-8">
                <div className="w-[17rem] px-4 justify-center fixed block p-4 border-r border-slate-50/[0.06] h-screen">
                    <div className="font-bold text-lg">
                        <h1>Straumur</h1>
                    </div>
                    <div className="mt-8">
                        <p className="font-bold mb-2">Feeds</p>
                        <div className="ml-4">
                        {
                            Object.values(feeds).map((feed) => (
                                <p key={feed.id}><Link to={feed.id}>{feed.name}</Link></p>
                            ))
                        }
                        </div>
                    </div>
                </div>
                <div className="ml-[17.5rem] pl-[2rem]">
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
        </div>
    );
}
