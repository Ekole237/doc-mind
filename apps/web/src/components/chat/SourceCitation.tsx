import { Button } from "@workspace/ui/components/button"
import { ExternalLink, FileText } from "lucide-react"
import type { ChatSource } from "../../types"

interface SourceCitationProps {
  source: ChatSource
}

export function SourceCitation({ source }: SourceCitationProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="mt-2 flex w-full max-w-[80%] items-center gap-3 overflow-hidden rounded-lg border border-border bg-muted/30 p-2 pr-3 transition-all hover:bg-muted/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background border border-border">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-xs text-foreground truncate" title={source.documentName}>
          {source.documentName}
        </h4>
        <p className="text-[10px] text-muted-foreground">
          Modifié le {formatDate(source.lastModified)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        asChild
        className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <a href={source.driveUrl} target="_blank" rel="noopener noreferrer" title="Ouvrir le document">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
    </div>
  )
}
