import { createThemeSessionResolver, isTheme } from "remix-themes"
 
import { createThemeSessionStorageFromCtx } from "./../sessions"
import { ActionFunctionArgs } from "@remix-run/cloudflare";

interface ThemeRequest {
    theme: string;
}

export const action = async ({ context, request }: ActionFunctionArgs) => {
    const themeResolver = createThemeSessionResolver(createThemeSessionStorageFromCtx(context));
    const session = await themeResolver(request);
    const { theme } = await request.json<ThemeRequest>();

    if (!theme) {
        return Response.json(
            { success: true },
            { headers: { "Set-Cookie": await session.destroy() } },
        );
    }

    if (!isTheme(theme)) {
        return Response.json({
            success: false,
            message: `theme value of ${theme} is not a valid theme.`,
        });
    }

    session.setTheme(theme);
    return Response.json(
        { success: true },
        {
            headers: { "Set-Cookie": await session.commit() },
        },
    );
};
