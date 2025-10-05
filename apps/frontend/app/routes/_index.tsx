import { redirect, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { Button } from "~/components/ui/button";
import { getUserIdFromSession } from "~/sessions";

export const meta: MetaFunction = () => {
  return [
    { title: "Straumur" },
    { name: "description", content: "Read the internet your way!" },
  ];
};

function generateGoogleAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function loader({ context, request }: LoaderFunctionArgs) {
    const userId = await getUserIdFromSession(context, request);

    if (userId && userId !== "") {
        return redirect("/feed");
    }

    const redirectUri = `${context.cloudflare.env.BASE_URL}/auth/sso/google/callback`;
    const url = generateGoogleAuthUrl(context.cloudflare.env.GOOGLE_CLIENT_ID, redirectUri);

    return { authUrl: url };
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
                  <a href={authUrl}>
                    <Button type="button" className="hover:cursor-pointer">
                        <div>Continue with Google</div>
                    </Button>
                  </a>
              </div>
          </div>
        </div>
  );
}
