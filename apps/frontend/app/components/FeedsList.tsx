import { Feed } from "@straumur/types";
import { Link } from "react-router";

export default function FeedsList({ feeds }: { feeds: Feed[] }) {
    return (
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
    );
}
