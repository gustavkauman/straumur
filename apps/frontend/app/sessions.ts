import {  createSession, createSessionStorage } from "@remix-run/cloudflare";
import type { AppLoadContext, Session, SessionStorage  } from "@remix-run/cloudflare";
import { v4 as uuid } from "uuid";

let sessionStorage: SessionStorage<SessionData> | undefined;

export type SessionData = {
    userId?: string;
};

function createDatabaseSessionStorage({
    cookie,
    db
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cookie: any,
    db: D1Database
}) {
    return createSessionStorage<SessionData>({
        cookie,
        async createData(data, expires): Promise<string> {
            const sessionId = uuid();
            await db.prepare("insert into user_sessions (id, data, expires_at) values (?, ?, ?)")
                        .bind(sessionId, JSON.stringify(data), expires?.toISOString())
                        .run();

            return sessionId;
        },
        async readData(id): Promise<SessionData | null> {
            const result = await db.prepare("select data from user_sessions where id = ?")
                                    .bind(id)
                                    .first<{ data: string }>();
            return result ? JSON.parse(result.data) : null;
        },
        async updateData(id, data, expires) {
            await db.prepare("update user_sessions set data = ?, expires_at = ? where id = ?")
                    .bind(JSON.stringify(data), expires, id)
                    .run();
        },
        async deleteData(id) {
            await db.prepare("delete from user_sessions where id = ?")
                    .bind(id)
                    .run();
        },
    });
}

export function createDatabaseSessionStorageFromCtx(ctx: AppLoadContext) {
    return createDatabaseSessionStorage({
        cookie: {
            name: "session",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            secrets: [ctx.cloudflare.env.SESSION_SECRET!],
            maxAge: 60 * 60 * 24 * 7, // 1 week
        },
        db: ctx.cloudflare.env.DB
    });
}

export async function getUserIdFromSession(ctx: AppLoadContext, req: Request): Promise<string | undefined> {
    const session = await getSessionStorage(ctx).getSession(req.headers.get("Cookie"));
    return session.data.userId;
}

export async function getSession(ctx: AppLoadContext, req: Request): Promise<Session | undefined> {
    return await getSessionStorage(ctx).getSession(req.headers.get("Cookie"));
}

export async function createUserSession(ctx: AppLoadContext, request: Request, userId: string): Promise<string> {
    const session = createSession({ userId });
    return await getSessionStorage(ctx).commitSession(session);
}

export async function destroyUserSession(ctx: AppLoadContext, req: Request): Promise<string | undefined> {
    const session = await getSession(ctx, req);
    if (!session) return;
    return await getSessionStorage(ctx).destroySession(session);
}

function getSessionStorage(ctx: AppLoadContext) {
    if (!sessionStorage)
        sessionStorage = createDatabaseSessionStorageFromCtx(ctx);
    return sessionStorage;
}
