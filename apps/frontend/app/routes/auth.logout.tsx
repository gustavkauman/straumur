import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { destroyUserSession } from "~/sessions";

export async function loader({ context, request }: LoaderFunctionArgs) {
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
