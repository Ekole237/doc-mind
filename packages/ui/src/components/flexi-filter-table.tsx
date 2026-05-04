"use client"

import { MoreVertical, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

export interface FlexiFilterTableRow {
  id: string
  sessionId: string | null
  question: string
  role: string
  flagged: boolean
  ignorance: boolean
  responseTimeMs: number
  timestamp: string
}

interface FlexiFilterTableProps {
  data: FlexiFilterTableRow[]
  onViewSession?: (sessionId: string) => void
}

export function FlexiFilterTable({ data, onViewSession }: FlexiFilterTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState("")
  const [focused, setFocused] = useState(false)

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return !(search &&
        !`${item.question} ${item.sessionId ?? ""} ${item.role}`
          .toLowerCase()
          .includes(search.toLowerCase()));
    })
  }, [data, search])

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex flex-col items-start gap-3 p-4 md:flex-row md:flex-wrap md:items-center ">
        <div className={cn(
          "flex justify-start items-center border rounded-xl px-2 py-1 transition-colors",
          focused && "ring-1 ring-ring ring-offset-2 border-transparent"
        )}>
          <SearchIcon className={cn("h-4 w-4 text-muted-foreground", focused && "text-primary")} />
          <Input
            placeholder="Rechercher question / session / rôle"
            value={search}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 border-none border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:placeholder:text-transparent"
          />
        </div>
      </div>

      <div className="max-h-100 overflow-y-auto md:hidden">
        <div className="space-y-3 p-3">
          {filteredData.map((row) => (
            <div key={row.id} className="rounded-lg border bg-card p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="text-sm font-medium wrap-break-word">{row.question}</div>
                <Checkbox checked={selectedRows.has(row.id)} onCheckedChange={() => toggleRow(row.id)} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Rôle: </span>
                  {row.role}
                </div>
                <div>
                  <span className="font-medium text-foreground">Temps: </span>
                  {row.responseTimeMs}ms
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-foreground">Session: </span>
                  {row.sessionId ? `${row.sessionId.substring(0, 8)}...` : "-"}
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-foreground">Date: </span>
                  {new Date(row.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={row.flagged ? "destructive" : "secondary"}>
                    {row.flagged ? "Signalé" : "Non signalé"}
                  </Badge>
                  <Badge variant={row.ignorance ? "destructive" : "success"}>
                    {row.ignorance ? "Sans réponse" : "Avec réponse"}
                  </Badge>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      disabled={!row.sessionId}
                      onClick={() => {
                        if (row.sessionId) {
                          onViewSession?.(row.sessionId)
                        }
                      }}
                    >
                      Voir la conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden max-h-100 overflow-x-auto overflow-y-auto md:block">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={data.length > 0 && selectedRows.size === data.length}
                  onCheckedChange={(checked) =>
                    setSelectedRows(checked ? new Set(data.map((d) => d.id)) : new Set())
                  }
                />
              </TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Signalé</TableHead>
              <TableHead>Réponse</TableHead>
              <TableHead>Temps</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox checked={selectedRows.has(row.id)} onCheckedChange={() => toggleRow(row.id)} />
                </TableCell>
                <TableCell className="max-w-[320px] truncate font-medium">{row.question}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.sessionId ? `${row.sessionId.substring(0, 8)}...` : "-"}</TableCell>
                <TableCell>
                  <Badge variant={row.flagged ? "destructive" : "secondary"}>
                    {row.flagged ? "Oui" : "Non"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={row.ignorance ? "destructive" : "success"}>
                    {row.ignorance ? "Sans réponse" : "Avec réponse"}
                  </Badge>
                </TableCell>
                <TableCell>{row.responseTimeMs}ms</TableCell>
                <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        disabled={!row.sessionId}
                        onClick={() => {
                          if (row.sessionId) {
                            onViewSession?.(row.sessionId)
                          }
                        }}
                      >
                        Voir la conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}