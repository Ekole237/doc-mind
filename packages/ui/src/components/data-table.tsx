"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, SearchIcon } from "lucide-react"
import * as React from "react"

import { cn } from "../lib/utils"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Input } from "./input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

/**
 * État de pagination côté serveur.
 * À gérer par le composant parent.
 */
export interface PaginationState {
  pageIndex: number
  pageSize: number
}

/**
 * Props pour le composant DataTable
 * @template T - Type des données du tableau
 */
export interface DataTableProps<T> {
  /** Colonnes du tableau (ColumnDef de TanStack) */
  columns: ColumnDef<T>[]

  /** Données à afficher */
  data: T[]

  /** État total des données (pour pagination serveur) */
  totalCount?: number

  /** État actuel de pagination */
  pagination: PaginationState

  /** Callback quand la pagination change */
  onPaginationChange: (state: PaginationState) => void

  /** État de chargement */
  isLoading?: boolean

  /** Afficher la colonne de sélection ? */
  withSelection?: boolean

  /** Callback quand les lignes sélectionnées changent */
  onSelectionChange?: (selectedIds: string[]) => void

  /** Activer la recherche intégrée ? */
  withSearch?: boolean

  /** Placeholder pour le champ de recherche */
  searchPlaceholder?: string

  /** Callback quand la recherche change */
  onSearchChange?: (search: string) => void

  /** Valeur actuelle de la recherche */
  searchValue?: string

  /** Message quand aucune donnée */
  emptyMessage?: string

  /** Hauteur max du tableau (avec scroll) */
  maxHeight?: string
}

/**
 * En-tête de colonne avec support du tri
 */
export interface DataTableColumnHeaderProps {
  column: any
  title: string
  className?: string
}

export function DataTableColumnHeader({
  column,
  title,
  className,
}: DataTableColumnHeaderProps) {
  if (!column.getCanSort()) {
    return <div className={cn("text-left", className)}>{title}</div>
  }

  return (
    <div
      className={cn("flex cursor-pointer items-center gap-2", className)}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      {column.getIsSorted() === "desc" && <span>↓</span>}
      {column.getIsSorted() === "asc" && <span>↑</span>}
    </div>
  )
}

/**
 * Contrôles de pagination pour serveur
 */
function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  onPageChange,
  isLoading,
}: {
  pageIndex: number
  pageSize: number
  totalCount?: number
  onPageChange: (pageIndex: number) => void
  isLoading?: boolean
}) {
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1
  const canPreviousPage = pageIndex > 0
  const canNextPage = totalCount ? pageIndex < totalPages - 1 : false

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
      <div className="text-sm text-muted-foreground">
        {totalCount && (
          <span>
            Page <span className="font-semibold">{pageIndex + 1}</span> de{" "}
            <span className="font-semibold">{totalPages}</span> ({" "}
            <span className="font-semibold">{totalCount}</span> résultats )
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage || isLoading}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {pageIndex + 1}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage || isLoading}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * DataTable générique réutilisable
 * Supporte pagination serveur, tri, sélection, et recherche optionnelle
 *
 * @example
 * ```tsx
 * const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
 * const [search, setSearch] = useState("")
 *
 * return (
 *   <DataTable
 *     columns={columns}
 *     data={data}
 *     totalCount={total}
 *     pagination={pagination}
 *     onPaginationChange={setPagination}
 *     withSearch
 *     searchValue={search}
 *     onSearchChange={setSearch}
 *   />
 * )
 * ```
 */
export function DataTable<T extends { id?: string }>({
  columns,
  data,
  totalCount,
  pagination,
  onPaginationChange,
  isLoading = false,
  withSelection = false,
  onSelectionChange,
  withSearch = false,
  searchPlaceholder = "Rechercher...",
  onSearchChange,
  searchValue = "",
  emptyMessage = "Aucune donnée",
  maxHeight = "100%",
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
  const [focused, setFocused] = React.useState(false)

  // Notifier le parent des changements de sélection
  React.useEffect(() => {
    onSelectionChange?.([...selectedRows])
  }, [selectedRows, onSelectionChange])

  // Préparer les colonnes
  const displayColumns: ColumnDef<T>[] = React.useMemo(() => {
    if (!withSelection) return columns

    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
              // Mettre à jour selectedRows avec tous les IDs visibles
              if (value) {
                const allIds = data
                  .map((row) => (row as { id?: string }).id || "")
                  .filter(Boolean)
                setSelectedRows(new Set(allIds))
              } else {
                setSelectedRows(new Set())
              }
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
              // Mettre à jour selectedRows
              const id = (row.original as { id?: string }).id || ""
              if (id) {
                setSelectedRows((prev) => {
                  const newSet = new Set(prev)
                  if (value) {
                    newSet.add(id)
                  } else {
                    newSet.delete(id)
                  }
                  return newSet
                })
              }
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      } as ColumnDef<T>,
      ...columns,
    ]
  }, [columns, withSelection, data])

  const table = useReactTable({
    data,
    columns: displayColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    manualPagination: true,
    rowCount: totalCount || data.length,
  })

  // Reset sélection quand les données changent
  React.useEffect(() => {
    setSelectedRows(new Set())
  }, [data])

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {/* Search Bar */}
      {withSearch && (
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div
            className={cn(
              "flex items-center gap-2 rounded-2xl border border-input px-3 py-1 transition-colors",
              focused && "border-transparent ring-1 ring-ring ring-offset-2"
            )}
          >
            <SearchIcon
              className={cn(
                "h-4 w-4 text-muted-foreground",
                focused && "text-primary"
              )}
            />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            />
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block" style={{ maxHeight }}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-primary/50 text-primary-foreground backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={displayColumns.length}
                  className="h-12 text-center text-muted-foreground"
                >
                  Chargement...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={displayColumns.length}
                  className="h-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 p-3 md:hidden">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          table.getRowModel().rows.map((row) => {
            const dataRow = row.original as {
              id?: string
              _title?: string
              title?: string
              name?: string
            }
            return (
              <div
                key={row.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                {/* Première ligne: checkbox + titre ou première colonne notable */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  {withSelection && (
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => {
                        row.toggleSelected(!!value)
                        const id = dataRow.id || ""
                        if (id) {
                          setSelectedRows((prev) => {
                            const newSet = new Set(prev)
                            if (value) {
                              newSet.add(id)
                            } else {
                              newSet.delete(id)
                            }
                            return newSet
                          })
                        }
                      }}
                    />
                  )}
                  <div className="flex-1 text-sm font-medium">
                    {dataRow._title || dataRow.title || dataRow.name || "Item"}
                  </div>
                </div>

                {/* Contenu détaillé */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === "select") return null
                    return (
                      <div key={cell.id}>
                        <div className="font-medium text-foreground">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                        <div>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-border">
        <DataTablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalCount={totalCount}
          onPageChange={(pageIndex) =>
            onPaginationChange({ ...pagination, pageIndex })
          }
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
