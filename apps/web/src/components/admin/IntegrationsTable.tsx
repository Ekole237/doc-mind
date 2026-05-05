import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import type { AdminFeedback } from "@/types"
import { Link } from "react-router-dom"

export function RecentFeedbacksTable({ feedbacks }: { feedbacks: AdminFeedback[] }) {
  return (
    <Card className="border-none shadow-sm flex-[1.5]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Recent Feedbacks</CardTitle>
        <Link to="/admin/feedbacks">
          <Button variant="link" className="text-primary text-xs h-auto p-0">
            See All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[10px] uppercase text-muted-foreground font-bold">Query ID</TableHead>
              <TableHead className="text-[10px] uppercase text-muted-foreground font-bold">Comment</TableHead>
              <TableHead className="text-[10px] uppercase text-muted-foreground font-bold">Status</TableHead>
              <TableHead className="text-[10px] uppercase text-muted-foreground font-bold text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                  No pending feedbacks
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.slice(0, 5).map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50 border-none">
                  <TableCell className="font-mono text-[10px]">
                    {item.queryLogId.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <span className="text-xs line-clamp-1">{item.comment || "No comment"}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "PENDING" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
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
