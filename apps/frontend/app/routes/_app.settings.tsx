import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { Feed } from "@straumur/types";
import { useState } from "react";
import { getUserIdFromSession } from "~/sessions";

export async function loader({ context, request }: LoaderFunctionArgs) {
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

    return json({ feeds, user });
}

/*
export async function action({ context, request, params }: ActionFunctionArgs) {
    const userId = getUserIdFromSession(context, request);

    if (!userId) {
        throw new Response("Not authorized", { status: 401 });
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "update-name") {
        const name = formData.get("name");

        if (typeof name !== "string" || name.length === 0) {
            return json(
                { errors: { name: "Name is required" } },
                { status: 400 }
            );
        }

        await db.user.update({
            where: { id: userId },
            data: { name },
        });

        return json({ success: true });
    }

    if (intent === "delete-feed") {
        const feedId = formData.get("feedId");

        if (typeof feedId !== "string") {
            return json(
                { errors: { feed: "Feed ID is required" } },
                { status: 400 }
            );
        }

        await db.feed.delete({
            where: { id: feedId },
        });

        return json({ success: true });
    }

    return json({ errors: { form: "Invalid intent" } }, { status: 400 });
}
*/

export default function AdminUserPage() {
  const { feeds } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  // const [editingName, setEditingName] = useState(false);
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
          <div className="rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                  User Feeds ({feeds.length})
              </h2>

              {feeds.length === 0 ? (
                  <p>You currently don't have any feeds.</p>
              ) : (
              <div className="space-y-4">
              {feeds.map((feed) => (
                  <div
                      key={feed.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                  <div className="flex justify-between items-start">
                      <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{feed.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{feed.url}</p>
                      </div>
                      <Form method="post" className="ml-4">
                          <input type="hidden" name="intent" value="delete-feed" />
                          <input type="hidden" name="feedId" value={feed.id} />
                          <button
                              type="submit"
                              disabled={isSubmitting}
                              className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                              onClick={(e) => {
                                  if (!confirm("Are you sure you want to delete this feed?")) {
                                      e.preventDefault();
                                  }
                              }}
                          >
                              Delete
                          </button>
                      </Form>
                      </div>
                  </div>
              ))}
              </div>
          )}
        </div>
    </div>
  );
}
