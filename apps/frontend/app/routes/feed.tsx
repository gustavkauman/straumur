import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, Link, useLoaderData } from "@remix-run/react";
import { customAlphabet } from "nanoid";
import { rssParse } from "@straumur/rss-parser";

type Article = {
    id: string;
    title: string;
    url: string,
    author: string;
    published_at: string;
}

export const loader = async ({ context } : LoaderFunctionArgs) => {
    const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);
    /*
    const db = Sentry.instrumentD1WithSentry(context.cloudflare.env.DB);

    const result = await db
        .prepare("SELECT * FROM articles")
        .all<Article>();

    const articles = result.results;
    */

    const parsedFeed = await rssParse("https://lobste.rs/rss");
    const articles = parsedFeed.items?.map((item) => {
        return {
            id: nanoid(),
            title: item.title,
            url: item.link,
            author: item.author,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null
        } as Article;
    });

    return json({ articles: articles ?? [] });
}

export default function Feed() {
    const { articles } = useLoaderData<typeof loader>();

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="items-center">
                {
                    articles.map((article) => (
                        <div key={article.id}>
                            <Link 
                                to={article.url}
                            >
                                {article.title}
                            </Link>
                            <p className="font-xs">{article.author}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
