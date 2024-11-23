import * as Sentry from "@sentry/cloudflare";

export const onRequest = [
    // Sentry MUST be the first middleware
    Sentry.sentryPagesPlugin((context) => ({
        enabled: context.cloudflare.env.SENTRY_ENABLED,
        tracesSampleRate: 1.0,
    })),
];

