import * as Sentry from "@sentry/remix";
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import { startTransition, StrictMode, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";

Sentry.init({
    dsn: window.ENV.SENTRY_DSN,
    enabled: window.ENV.SENTRY_ENABLED === "true",
    environment: window.ENV.SENTRY_ENVIRONMENT,
    integrations: [
        Sentry.browserTracingIntegration({
            useLocation,
            useEffect,
            useMatches
        }),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost"],
});


startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
