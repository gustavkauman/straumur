import { ArticleWithAdditionalData } from "@straumur/types";
import { Link, useLocation } from "react-router";

export default function ArticleList({
    articles,
    pageNumber,
    hasAdditionalPage

}:
{
    articles: ArticleWithAdditionalData[],
    pageNumber: number,
    hasAdditionalPage: boolean
}) {
    const location = useLocation();
    const parts = location.pathname.split("/").slice(1);
    const path = parts.slice(0, parts.length - 1).join("/");

    return (
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
                                dangerouslySetInnerHTML={{
                                    __html: article.title
                                }}
                            />
                            <p className="text-xs">{article.author}</p>
                        </div>
                    </div>
                ))
            }
            <div className="flex items-center justify-center my-4">
            {
                (articles.length > 0) ? (
                    <>
                        <Link
                            to={`/${path}/${pageNumber - 1}`}
                            className={`mr-2 ${(pageNumber <= 1) ? "invisible" : ""}`}
                        >
                            &lt;&lt;
                        </Link>

                        <p>Page { pageNumber }</p>

                        <Link
                            to={`/${path}/${pageNumber + 1}`}
                            className={`ml-2 ${(hasAdditionalPage) ? "visible" : "invisible"}`}
                        >
                            &gt;&gt;
                        </Link>
                    </>
                ) : (
                    <p>No articles</p>
                )
            }
            </div>
        </div>
    );
}
