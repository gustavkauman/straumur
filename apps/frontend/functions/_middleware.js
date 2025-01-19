import * as Sentry from "@sentry/cloudflare";

export const onRequest = [
    // Sentry MUST be the first middleware
    Sentry.sentryPagesPlugin((context) => ({
        dsn: context.cloudflare.env.SENTRY_DSN,
        enabled: context.cloudflare.env.SENTRY_ENABLED,
        tracePropagationTargets: ["localhost"],
        tracesSampleRate: 1.0,
    })),
];

