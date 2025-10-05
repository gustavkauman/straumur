import { redirect } from "react-router";
import { destroyUserSession } from "~/sessions";
import { Route } from "./+types/auth.logout";

export async function loader({ context, request }: Route.LoaderArgs) {
    const cookieString = await destroyUserSession(context, request);
    if (!cookieString) {
        return redirect("/");
    }

    return redirect("/", {
        headers: {
            "Set-Cookie": cookieString
        }
    });
}

export default function Logout() {
    return <></>;
}
