import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface UserMenuProps {
    username: string,
    onNavigateToSettings?: () => void
    onLogout?: () => void
}

export function UserMenu({ 
    username,
    onNavigateToSettings,
    onLogout,
}: UserMenuProps) {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <Button variant="ghost" className="h-auto p-2">
                {username}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            className="w-56 z-50"
            align="end"
            forceMount
        >
            <DropdownMenuItem onClick={onNavigateToSettings}>
                <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

