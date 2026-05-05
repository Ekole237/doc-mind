import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import type { AdminFeedback } from "@/types"
import { Link } from "react-router-dom"

export function RecentFeedbacksTable({ feedbacks }: { feedbacks: AdminFeedback[] }) {
  return (
    <Card className="flex-[1.5] border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Commentaires récents
        </CardTitle>
        <Link to="/admin/feedbacks">
          <Button variant="link" className="h-auto p-0 text-xs text-primary">
            See All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-muted-foreground uppercase">
                Query ID
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground uppercase">
                Comment
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="text-right text-[10px] font-bold text-muted-foreground uppercase">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No pending feedbacks
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.slice(0, 5).map((item) => (
                <TableRow
                  key={item.id}
                  className="border-none hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-[10px]">
                    {item.queryLogId.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-1 text-xs">
                      {item.comment || "No comment"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.status === "PENDING"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
