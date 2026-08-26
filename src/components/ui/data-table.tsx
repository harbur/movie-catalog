import { ColumnDef, columnSizingFeature, columnVisibilityFeature, flexRender, RowData, rowSelectionFeature, tableFeatures, useTable } from "@tanstack/react-table"
import { Skeleton } from "./skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

export const dataTableFeatures = tableFeatures({
    rowSelectionFeature,
    columnSizingFeature,
    columnVisibilityFeature,
})

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<typeof dataTableFeatures, TData, any>[]
    data: TData[]
    loading?: boolean
}

export function DataTable<TData extends RowData>({
    columns,
    data,
    loading,
}: DataTableProps<TData>) {
    const table = useTable({
        features: dataTableFeatures,
        data,
        columns,
    })

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                <div className="h-10">
                                    <div className="flex py-4 self-center">
                                        <Skeleton className="w-[100px] mr-[20px] h-[8px] rounded-full" />
                                        <Skeleton className="w-[100px] mr-[20px] h-[8px] rounded-full" />
                                        <Skeleton className="w-[100px] mr-[20px] h-[8px] rounded-full" />
                                    </div>
                                </div>
                                <div className="h-10">
                                    <div className="flex py-4 self-center">
                                        <Skeleton className="w-[100px] mr-[20px] h-[8px] rounded-full" />
                                        <Skeleton className="w-[100px] mr-[20px] h-[8px] rounded-full" />
                                        <Skeleton className="w-[100px] mr-[20px] h-[8px] rounded-full" />
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )
                    }
                </TableBody>
            </Table>
        </div>
    )
}
