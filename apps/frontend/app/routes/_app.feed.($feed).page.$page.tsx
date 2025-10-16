import type { Feed, ArticleWithAdditionalData } from "@straumur/types";
import { getUserIdFromSession } from "~/sessions";
import { Route } from "./+types/_app.feed.($feed).page.$page";
import { useLoaderData } from "react-router";
import FeedsList from "~/components/FeedsList";
import ArticleList from "~/components/ArticleList";

const ARTICLES_PER_PAGE = 25;

export const loader = async ({ context, request, params }: Route.LoaderArgs) => {
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

    const pageNo = parseInt(params.page) || 1;

    let conditions = "where f.user_id = ?1";
    const bindings = [ userId ];

    if (params.feed) {
        conditions += "and f.id = ?2 order by published_at desc limit ?3 offset ?4";
        bindings.push(params.feed);
    } else {
        conditions += "order by published_at desc limit ?2 offset ?3";
    }

    bindings.push((ARTICLES_PER_PAGE + 1).toString());
    bindings.push(((pageNo - 1) * ARTICLES_PER_PAGE).toString());

    const getArticles = async (): Promise<ArticleWithAdditionalData[]> => {
        const { results: articles } = await db
            .prepare(`
select a.*, f.name as feed_name, f.favicon_url
from articles a
left join feeds f on a.feed_id = f.id
${conditions}
`)
            .bind(...bindings)
            .all<ArticleWithAdditionalData>();
        return articles;
    }

    const [feeds, articles] = await Promise.all([getFeeds(), getArticles()]);

    return {
        feeds,
        articles,
        pageNo
    };
}

export default function FeedPaginated() {
    const { feeds, articles, pageNo } = useLoaderData<typeof loader>();

    return (
        <div className="flex flex-col">
            <div className="w-360 mx-auto px-16">
                <FeedsList feeds={feeds} />
                <ArticleList
                    articles={articles.slice(0, ARTICLES_PER_PAGE - 1)}
                    hasAdditionalPage={articles.length > ARTICLES_PER_PAGE}
                    pageNumber={pageNo}
                />
            </div>
        </div>
    );
}

