import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { OAuth2Client } from "google-auth-library";
import { v7 as uuid } from "uuid";
import { createUserSession, getUserIdFromSession } from "~/sessions";

export async function loader({ context, request }: LoaderFunctionArgs) {
    const userId = await getUserIdFromSession(context, request);

    if (userId && userId !== "")
        return redirect("/feed");

    const params = new URL(request.url).searchParams;
    const code = params.get("code");

    if (!code)
        throw Error("Request does not include a code.");

    const client = new OAuth2Client({
        clientId: context.cloudflare.env.GOOGLE_CLIENT_ID,
        clientSecret: context.cloudflare.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${context.cloudflare.env.BASE_URL}/auth/sso/google/callback`
    });

    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
        throw Error("Returned token does not contain an id token.");
    }

    const payload = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: context.cloudflare.env.GOOGLE_CLIENT_ID
    });

    const ssoUser = payload.getPayload();

    if (!ssoUser || !ssoUser.email || !ssoUser.given_name)
        throw Error("Failed to get user information from token.");

    const db = context.cloudflare.env.DB;

    const identity = await getSsoIdentity(db, "google", ssoUser.sub);

    let user: User | null = null;

    if (!identity) {
        if (!context.cloudflare.env.USER_SIGNUP_ENABLED) {
            throw new Response("User sign up is not allowed at this time", { status: 404 });
        }

        user = {
            id: uuid(),
            first_name: ssoUser.given_name,
            name: ssoUser.name,
            email: ssoUser.email,
        };

        // User does not exist currently
        const userWithSso: UserWithSsoIdentity = {
            ...user,
            ssoProvider: "google",
            ssoId: ssoUser.sub
        };

        await insertUser(db, userWithSso);
    } else {
        // Find user and create session
        user = await getUser(db, identity);
    }
    
    if (!user) {
        throw new Error("Required to have user object");
    }

    const session = await createUserSession(context, request, user.id);

    return redirect("/feed", {
        headers: {
            "Set-Cookie": session
        }
    });
}

type SsoProvider = "google";

type SsoIdentity = {
    provider: SsoProvider;
    id: string;
    user_id: string;
};

type User = {
    id: string;
    first_name: string;
    name?: string;
    email: string;
}

type UserWithSsoIdentity = User & { ssoProvider: SsoProvider; ssoId: string; };

async function getSsoIdentity(db: D1Database, provider: SsoProvider, id: string): Promise<SsoIdentity | null> {
    return await db
        .prepare("select * from sso_identities where provider = ? and id = ?")
        .bind(provider, id)
        .first<SsoIdentity>();
}

async function insertUser(db: D1Database, request: UserWithSsoIdentity) {
    const userQuery = db
        .prepare("insert into users (id, first_name, name, email) values (?, ?, ?, ?)")
        .bind(request.id, request.first_name, request.name, request.email);

    const identityQuery = db
        .prepare("insert into sso_identities (provider, id, user_id) values (?, ?, ?)")
        .bind(request.ssoProvider, request.ssoId, request.id);

    await db.batch([userQuery, identityQuery]);
}

async function getUser(db: D1Database, identity: SsoIdentity): Promise<User | null> {
    return await db
        .prepare("select * from users where id = ?")
        .bind(identity.user_id)
        .first<User>();
}

export default function GoogleCallback() {
    return <></>;
}
