import { createRequestHandler, type ServerBuild } from "react-router";
import * as build from "./../build/server";

declare module "react-router" {
    export interface AppLoadContext {
        cloudflare: {
            env: Env;
            ctx: ExecutionContext;
        };
    }
}

const requestHandler = createRequestHandler(build as unknown as ServerBuild);

export default {
    async fetch(request, env, ctx) {
        return requestHandler(request, {
            cloudflare: { env, ctx },
        });
    },
} satisfies ExportedHandler<Env>;
