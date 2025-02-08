import { json, Link, useLoaderData } from "@remix-run/react";
import type { Feed ,Article } from "@straumur/types";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";

export const loader = async ({ context }: LoaderFunctionArgs) => {
    const db = context.cloudflare.env.DB;

    const getFeeds = async (): Promise<Feed[]> => {
        const { results: feeds } = await db.prepare("select * from feeds order by name asc").all<Feed>();
        return feeds;
    };

    type ArticleWithAdditionalData = Article & { feed_name: string, favicon_url: string };

    const getArticles = async (): Promise<ArticleWithAdditionalData[]> => {
        const { results: articles } = await db
            .prepare(`
select a.*, f.name as feed_name, f.favicon_url
from articles a
left join feeds f on a.feed_id = f.id
order by published_at asc`)
            .all<ArticleWithAdditionalData>();
        return articles;
    }

    const [feeds, articles] = await Promise.all([getFeeds(), getArticles()]);

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
                flex fixed top-0 z-40 w-full h-[3rem] dark:bg-gray-950 align-middle justify-center leading-[3rem]
                px-4 text-end border-b border-slate-50/[0.06]
            ">
                <div className="flex justify-end w-[80%]">
                    <p>Howdy, user!</p>
                </div>
            </div>
            <div className="w-[90rem] mx-auto mt-[3rem] px-8">
                <div className="w-[17rem] px-4 justify-center fixed block p-4 border-r border-slate-50/[0.06] h-screen">
                    <div className="font-bold text-lg">
                        <h1>Straumur</h1>
                    </div>
                    <div className="mt-8">
                        <p className="font-bold mb-2">Feeds</p>
                        <div className="ml-4">
                        {
                            feeds.map((feed) => (
                                <p key={feed.id}><Link to={`${feed.id}`}>{feed.name}</Link></p>
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
                                    src={article.favicon_url}
                                    alt={`${article.feed_name} logo`}
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
