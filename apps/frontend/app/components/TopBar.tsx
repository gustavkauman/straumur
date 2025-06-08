import { Button } from "@straumur/ui";

interface TopBarProps {
    username: string
}

export default function TopBar({ username }: TopBarProps) {
    return (
        <div className="
            flex fixed top-0 z-40 w-full h-[3rem] dark:bg-gray-950 align-middle justify-center leading-[3rem]
            px-4 text-end border-b border-slate-50/[0.06]
        ">
            <div className="flex justify-end w-[80%]">
                <Button to={"/auth/logout"}>Howdy, {username}!</Button>
            </div>
        </div>
    );
}
