import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Button } from "@straumur/ui";
import { OAuth2Client } from "google-auth-library";

export const meta: MetaFunction = () => {
  return [
    { title: "Straumur" },
    { name: "description", content: "Read the internet your way!" },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
    const oauthClient = new OAuth2Client({
        clientId: context.cloudflare.env.GOOGLE_CLIENT_ID,
        redirectUri: "http://localhost:5173/auth/sso/google/callback"
    });

    const url = oauthClient.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "email", "profile"]
    });

    return json({ authUrl: url });
}

export default function Index() {
    const { authUrl } = useLoaderData<typeof loader>();

    return (
      <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-16">
              <header className="flex flex-col items-center gap-2">
                  <h1 className="leading text-4xl font-bold text-gray-800 dark:text-gray-100">
                    Straumur
                  </h1>
                  <h2 className="italic">
                    Read the internet your way!
                  </h2>
              </header>
              <div>
                <Button to={authUrl}>
                    <div className="flex items-center py-4 px-12 bg-gray-700 hover:bg-gray-800 transition rounded-lg">
                        Continue with Google
                    </div>
                </Button>
              </div>
          </div>
      </div>
  );
}
