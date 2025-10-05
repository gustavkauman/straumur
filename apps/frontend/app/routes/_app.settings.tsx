import { Feed } from "@straumur/types";
import { Trash } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { getUserIdFromSession } from "~/sessions";
import { Route } from "./+types/_app.settings";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";

export async function loader({ context, request }: Route.LoaderArgs) {
    const userId = await getUserIdFromSession(context, request);

    if (!userId) {
        throw new Response("Not authorized", { status: 401 });
    }

    const db = context.cloudflare.env.DB;

    const getFeeds = async (): Promise<Feed[]> => {
        const { results: feeds } = await db
            .prepare("select * from feeds where user_id = ?")
            .bind(userId)
            .all<Feed>();
        return feeds;
    };
    
    type User = {
        id: string;
        first_name: string;
        name?: string;
        email: string;
    };

    const getUser = async (): Promise<User> => {
        const user = await db
            .prepare("select * from users where id = ?")
            .bind(userId)
            .first<User>();

        if (!user) {
            throw new Error("Failed to find user even though user was found from session");
        }

        return user;
    };

    const [feeds, user] = await Promise.all([getFeeds(), getUser()]);

    return { feeds, user };
}

export async function action({ context, request }: Route.ActionArgs) {
    const userId = await getUserIdFromSession(context, request);
    const db = context.cloudflare.env.DB;

    if (!userId) {
        throw new Response("Not authorized", { status: 401 });
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
        case "delete-feed": {
            const feedId = formData.get("feedId");

            if (typeof feedId !== "string") {
                return Response.json(
                    { errors: { feed: "Feed ID is required" } },
                    { status: 400 }
                );
            }

            await db.prepare("delete from feeds where id = ? and user_id = ?")
            .bind(feedId, userId)
            .run();


            return { success: true };
        }
        case "add-feed": {
            const name = formData.get("name");
            const url = formData.get("url");
               
            const errors: { name?: string; url?: string; form?: string } = {};

            if (!name || typeof name !== "string" || name.length === 0) {
                errors.name = "Feed name is required";
            }

            if (!url || typeof url !== "string" || url.length === 0) {
                errors.url = "Feed URL is required";
            } else if (!isValidUrl(url)) {
                errors.url = "Please enter a valid URL";
            }

            if (Object.keys(errors).length > 0) {
                return Response.json({ errors }, { status: 400 });
            }

            const parsedUrl = new URL(String(url));
            const faviconUrl = `https://${parsedUrl.hostname}/favicon.ico`;

            const feed = await db
                .prepare("select id from feeds where url = ? and user_id = ? limit 1")
                .bind(parsedUrl.toString(), userId)
                .run();

            if (feed.results.length > 0) {
                return { success: true };
            }
            
            await db
                .prepare("insert into feeds (name, url, favicon_url, user_id) values (?, ?, ?, ?)")
                .bind(name, parsedUrl.toString(), faviconUrl, userId)
                .run();

            return { success: true };
        }
    }

    return Response.json({ errors: { form: "Invalid intent" } }, { status: 400 });
}

function isValidUrl(string: string): boolean {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

export default function AdminUserPage() {
    const { feeds } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const actionData = useActionData<{ errors?: { name?: string; url?: string; form?: string } }>();
    const formRef = useRef<HTMLFormElement>(null);

    // Reset form on successful submission
    useEffect(() => {
        if (navigation.state === "idle" && !actionData?.errors) {
            formRef.current?.reset();
        }
    }, [navigation.state, actionData]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
            Your Feeds ({feeds.length})
        </h2>

        {feeds.length === 0 ? (
          <p>You don't currently have any feeds.</p>
        ) : (
        <div className="space-y-4">
        {feeds.map((feed) => (
          <div
              key={feed.id}
              className="border border-gray-200 rounded-lg p-4"
          >
          <div className="flex justify-between items-center">
              <div className="flex-1">
                  <h3 className="font-medium">{feed.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{feed.url}</p>
              </div>
              <Form method="post" className="ml-4">
                  <input type="hidden" name="intent" value="delete-feed" />
                  <input type="hidden" name="feedId" value={feed.id} />
                  <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700 hover:cursor-pointer text-sm disabled:opacity-50"
                      onClick={(e) => {
                          if (!confirm("Are you sure you want to delete this feed?")) {
                              e.preventDefault();
                          }
                      }}
                  >
                    <Trash />
                  </button>
              </Form>
              </div>
          </div>
        ))}
        </div>
        )}

        <div className="mt-8 border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">
                Add new feed
            </h2>

            <Form method="post" ref={formRef} className="space-y-4">
                <input type="hidden" name="intent" value="add-feed" />

                <div>
                    <label htmlFor="feed-name" className="block text-sm font-medium text-gray-700">
                        Feed Name
                    </label>
                    <input
                        id="feed-name"
                        name="name"
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., TechCrunch"
                        aria-invalid={actionData?.errors?.name ? true : undefined}
                        aria-describedby="name-error"
                    />
                    {actionData?.errors?.name && (
                        <p className="mt-1 text-sm text-red-600" id="name-error">
                            {actionData.errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="feed-url" className="block text-sm font-medium text-gray-700">
                        Feed URL
                    </label>
                    <input
                        id="feed-url"
                        name="url"
                        type="url"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-0"
                        placeholder="https://example.com/feed.xml"
                        aria-invalid={actionData?.errors?.url ? true : undefined}
                        aria-describedby="url-error"
                    />
                    {actionData?.errors?.url && (
                        <p className="mt-1 text-sm text-red-600" id="url-error">
                            {actionData.errors.url}
                        </p>
                    )}
                </div>

                {actionData?.errors?.form && (
                    <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{actionData.errors.form}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="hover:cursor-pointer"
                >
                    {isSubmitting ? "Adding Feed..." : "Add Feed"}
                </Button>
            </Form>
        </div>
    </div>
    </div>
  );
}
