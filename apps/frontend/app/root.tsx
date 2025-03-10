import { captureRemixErrorBoundaryError, withSentry, SentryMetaArgs } from "@sentry/remix";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, useRouteLoaderData } from "@remix-run/react";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
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

export const loader = async ({ context } : LoaderFunctionArgs) => {
    return json({
        ENV: {
            SENTRY_DSN: context.cloudflare.env.SENTRY_DSN,
            SENTRY_ENABLED: context.cloudflare.env.SENTRY_ENABLED,
            SENTRY_ENVIRONMENT: context.cloudflare.env.SENTRY_ENVIRONMENT,
        },
    });
}

export const meta = ({ data } : SentryMetaArgs<MetaFunction<typeof loader>>) => {
    return [
        {
            title: "Straumur"
        },
        {
            name: "sentry-trace",
            content: data.sentryTrace
        },
        {
            name: "baggage",
            content: data.sentryBaggage
        }
    ];
}

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useRouteLoaderData<typeof loader>("root");

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
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

export const ErrorBoundary = () => {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <div>Something went wrong</div>;
};

function App() {
    return (
        <Outlet />
    );
}

export default withSentry(App);
