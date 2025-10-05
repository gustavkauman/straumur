import TopBar from "~/components/TopBar";
import { getUserIdFromSession } from "~/sessions";
import { Outlet, redirect, useLoaderData } from "react-router";
import { Route } from "./+types/_app";

export const loader = async ({ context, request }: Route.LoaderArgs) => {
    const userId = await getUserIdFromSession(context, request);

    if (!userId) {
        return redirect("/");
    }

    const db = context.cloudflare.env.DB;

    const username = await db
        .prepare("select first_name from users where id = ?")
        .bind(userId)
        .first<{first_name: string}>();

    if (!username) {
        throw new Error("Failed to get user info from logged in user!");
    }

    return { username: username.first_name };
}

export default function AppLayout() {
    const { username } = useLoaderData<typeof loader>();

    return (
        <>
            <TopBar username={username} />
            <main>
                <div className="pt-12">
                    <Outlet />
                </div>
            </main>
        </>
    );
}
