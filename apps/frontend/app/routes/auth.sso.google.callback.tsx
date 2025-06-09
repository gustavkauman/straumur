import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { v7 as uuid } from "uuid";
import { createUserSession, getUserIdFromSession } from "~/sessions";

interface GoogleTokenInfo {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    email: string;
    email_verified: string;
    at_hash?: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    locale?: string;
    iat: string;
    exp: string;
}

interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    id_token: string;
    refresh_token?: string;
    scope: string;
    token_type: string;
}


async function verifyGoogleToken(token: string, clientId: string): Promise<GoogleTokenInfo> {
    const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );

        if (!response.ok) {
            throw new Error('Failed to verify token with Google');
        }

        const tokenInfo = await response.json() as GoogleTokenInfo;

        if (tokenInfo.aud !== clientId) {
            throw new Error('Token audience mismatch');
        }

        const now = Math.floor(Date.now() / 1000);
        if (parseInt(tokenInfo.exp) < now) {
            throw new Error('Token has expired');
        }

        if (tokenInfo.iss !== 'https://accounts.google.com' && tokenInfo.iss !== 'accounts.google.com') {
            throw new Error('Invalid token issuer');
        }

    if (tokenInfo.email_verified !== 'true') {
        throw new Error('Email not verified');
    }

    return tokenInfo;
}

async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<GoogleTokenResponse> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
    }),
    });

    if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Token exchange failed:', errorData);
        throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    return tokenData as GoogleTokenResponse;
}


export async function loader({ context, request }: LoaderFunctionArgs) {
    const userId = await getUserIdFromSession(context, request);

    if (userId && userId !== "")
        return redirect("/feed");

    const params = new URL(request.url).searchParams;
    const code = params.get("code");

    if (!code)
        throw Error("Request does not include a code.");

    const clientId = context.cloudflare.env.GOOGLE_CLIENT_ID;
    const clientSecret = context.cloudflare.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${context.cloudflare.env.BASE_URL}/auth/sso/google/callback`;

    const tokenData = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri);

    if (!tokenData.id_token) {
        throw new Error('No ID token received');
    }

    const userInfo = await verifyGoogleToken(tokenData.id_token, clientId);

    if (!userInfo || !userInfo.email || !userInfo.given_name)
        throw Error("Failed to get user information from token.");

    const db = context.cloudflare.env.DB;

    const identity = await getSsoIdentity(db, "google", userInfo.sub);

    let user: User | null = null;

    if (!identity) {
        if (!context.cloudflare.env.USER_SIGNUP_ENABLED) {
            throw new Response("User sign up is not allowed at this time", { status: 404 });
        }

        user = {
            id: uuid(),
            first_name: userInfo.given_name,
            name: userInfo.name,
            email: userInfo.email,
        };

        // User does not exist currently
        const userWithSso: UserWithSsoIdentity = {
            ...user,
            ssoProvider: "google",
            ssoId: userInfo.sub
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
