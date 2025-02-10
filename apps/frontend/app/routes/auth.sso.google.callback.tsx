import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { OAuth2Client } from "google-auth-library";

export async function loader({ context, request }: LoaderFunctionArgs) {
    const params = new URL(request.url).searchParams;
    const code = params.get("code");

    if (!code)
        throw Error("Request does not include a code.");

    const client = new OAuth2Client({
        clientId: context.cloudflare.env.GOOGLE_CLIENT_ID,
        clientSecret: context.cloudflare.env.GOOGLE_CLIENT_SECRET,
        redirectUri: "http://localhost:5173/auth/sso/google/callback"
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

    if (!ssoUser)
        throw Error("Failed to get user information from token.");

    const user = {
        name: ssoUser.name,
        email: ssoUser.email,
        google_sub: ssoUser.sub
    };

    console.log(user);

    return redirect("/feed");
}

export default function GoogleCallback() {
    return <></>;
}
