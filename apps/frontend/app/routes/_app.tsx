import { json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";
import TopBar from "~/components/TopBar";
import { getUserIdFromSession } from "~/sessions";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
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

    return json({ username: username.first_name });
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
