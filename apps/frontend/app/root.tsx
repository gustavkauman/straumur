import { ClientLoaderFunctionArgs, Links, LinksFunction, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, useRouteLoaderData } from "react-router";

import "./tailwind.css";
import { Route } from "./+types/root";

export const links: LinksFunction = () => [
    {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
    },
    {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
    },
    {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
    },
    {
        rel: "manifest",
        href: "/site.webmanifest",
    },
    {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
    },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap",
    },
];

export const loader = async ({ context } : Route.LoaderArgs) => {
    return {
        theme: "dark",
        ENV: {
            SENTRY_DSN: context.cloudflare.env.SENTRY_DSN,
            SENTRY_ENABLED: context.cloudflare.env.SENTRY_ENABLED,
            SENTRY_ENVIRONMENT: context.cloudflare.env.SENTRY_ENVIRONMENT,
        },
    };
}

export const meta = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metas: any[] = [
        {
            title: "Straumur"
        },
    ];

    return metas;
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRouteLoaderData<typeof loader>("root");

    return (
        <html lang="en" className={data?.theme ?? ""}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className="min-h-screen">
                {children}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV = ${JSON.stringify(
                            data?.ENV
                        )}`,
                    }}
                />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export const clientLoader = async ({ serverLoader }: ClientLoaderFunctionArgs) => {
  return await serverLoader()
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  return <div>Something went wrong</div>;
};

function App() {
    return (
        <Outlet />
    );
}

export default App;
