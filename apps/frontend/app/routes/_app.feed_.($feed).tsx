import { redirect } from "react-router"
import { Route } from "./+types/_app.feed_.($feed)";

export const loader = ({ params }: Route.LoaderArgs) => {
    let path = "/feed";

    if (params.feed)
        path += `/${params.feed}`;
    path += "/page/1";

    return redirect(path);
}

export default function Feed() {
    return <></>;
}
