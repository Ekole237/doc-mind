import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import EjaraLogo from "@/assets/icons/Logo.svg?react";
import EjaraTextLogo from "@/assets/icons/ejara.svg?react";

export interface ChatHeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
  userEmail?: string;
}

function ChatHeader({
  onMenuClick,
  onProfileClick,
  userEmail,
}: ChatHeaderProps) {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={onMenuClick} aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center justify-center gap-2">
          <EjaraLogo width={51} height={51} fill="currentColor" />
          <div className="pt-2">
            <EjaraTextLogo fill="currentColor" />
          </div>
        </div>
      </div>

      <button
        onClick={onProfileClick}
        className="transition-transform hover:scale-105 active:scale-95"
      >
        <Avatar size="default" className="border border-primary/20 bg-primary/10">
          <AvatarFallback className="text-primary font-bold">{initial}</AvatarFallback>
        </Avatar>
      </button>
    </header>
  );
}
export default ChatHeader;
