import { json, Link, useLoaderData } from "@remix-run/react";
import type { Feed ,Article } from "@straumur/types";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getUserIdFromSession } from "~/sessions";

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
    const userId = await getUserIdFromSession(context, request);

    if (!userId) {
        throw new Response("Not authorized", { status: 401 });
    }

    const db = context.cloudflare.env.DB;

    const getFeeds = async (): Promise<Feed[]> => {
        const { results: feeds } = await db
            .prepare("select * from feeds where user_id = ? order by name asc")
            .bind(userId)
            .all<Feed>();
        return feeds;
    };

    type ArticleWithAdditionalData = Article & { feed_name: string, favicon_url: string };

    let conditions = "where f.user_id = ?1";
    const bindings: string[] = [ userId ];

    if (params.feed) {
        conditions += "and f.id = ?2";
        bindings.push(params.feed);
    }

    const getArticles = async (): Promise<ArticleWithAdditionalData[]> => {
        const { results: articles } = await db
            .prepare(`
select a.*, f.name as feed_name, f.favicon_url
from articles a
left join feeds f on a.feed_id = f.id
${conditions}
order by published_at asc`)
            .bind(...bindings)
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
        <div className="flex flex-col min-h-screen">
            <div className="w-360 mx-auto px-16">
                <div className="w-68 justify-center fixed block border-r border-slate-50/[0.06] h-screen">
                    <div className="mt-8">
                        <p className="font-bold mb-2">Feeds</p>
                        <div className="ml-4">
                        {
                            feeds.map((feed) => (
                                <p key={feed.id}><Link to={`/feed/${feed.id}`}>{feed.name}</Link></p>
                            ))
                        }
                        </div>
                    </div>
                </div>
                <div className="ml-70 pl-8">
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
