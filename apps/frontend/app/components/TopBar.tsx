import { UserMenu } from "./UserMenu";
import { ClientOnly } from "./ClientOnly";
import { Link, useNavigate } from "react-router";

interface TopBarProps {
    username: string
}

export default function TopBar({ username }: TopBarProps) {
    const navigate = useNavigate();

    return (
        <div className="
            flex fixed top-0 z-40 w-full h-12 bg-white dark:bg-gray-950 align-middle justify-center leading-12
            px-4 text-end border-b border-slate-50/[0.06]
        ">
            <div className="flex px-16 w-360 justify-between">
                <Link to={"/feed"}><h1 className="font-bold">Straumur</h1></Link>
                <div className="flex items-center">
                    <ClientOnly>
                        <UserMenu
                            username={username} 
                            onNavigateToSettings={() => navigate("/settings")}
                            onLogout={() => navigate("/auth/logout")}
                        />
                    </ClientOnly>
                </div>
            </div>
        </div>
    );
}
