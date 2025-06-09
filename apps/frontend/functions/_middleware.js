import * as Sentry from "@sentry/cloudflare";

export const onRequest = [
    // Sentry MUST be the first middleware
    Sentry.sentryPagesPlugin((context) => {
        const env = context.env;
        const { id: versionId } = env.CF_VERSION_METADATA;
        
        return {
            dsn: env.SENTRY_DSN,
            release: versionId,
            enabled: env.SENTRY_ENABLED,
            tracePropagationTargets: ["localhost", "straumur.app"],
            tracesSampleRate: 1.0,
        };
    })
];

