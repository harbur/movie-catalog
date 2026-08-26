import { Button } from "@/components/ui/button";
import { DataTable, dataTableFeatures } from "@/components/ui/data-table";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Movie from "@/models/movie";
import { useMovies } from "@/stores/movies";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import CreateMovieDialog from "./CreateMovieDialog";
import MovieActions from "./MovieActions";

function MoviesTable() {
  const { data, isLoading, error } = useMovies();

  const columns: ColumnDef<typeof dataTableFeatures, Movie>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 700,
      cell: (d) => <span>{d.cell.row.original.id}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 700,
      cell: (d) => <span>{d.cell.row.original.name}</span>,
    },
    {
      id: 'actions',
      enableHiding: false,
      size: 10,
      cell: ({ row }) => <MovieActions movie={row.original!} />,
    },
  ];


  if (isLoading) {
    return <DataTable columns={columns} data={[]} loading={true} />;
  }

  if (error || !data) {
    return <DataTable columns={columns} data={[]} loading={false} />;
  }

  return <DataTable columns={columns} data={data} />;
}


export function List() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center flex-col items-center gap-4">
      <h1>List Movies</h1>
      <div className="flex flex-col w-full gap-4">
      <div className="flex items-center">
          <div className="flex-1 text-sm font-semibold"/>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Create movie</Button>
            </DialogTrigger>
            <CreateMovieDialog open={open} closeDialog={() => setOpen(false)} />
          </Dialog>
        </div>
        <MoviesTable />
      </div>
    </div>
  )
}