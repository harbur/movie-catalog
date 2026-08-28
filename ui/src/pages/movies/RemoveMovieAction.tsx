import SimpleTooltip from '@/components/molecules/SimpleTooltip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import Movie from '@/models/movie';
import { useDeleteMovie } from '@/stores/movies';
import { TrashIcon } from '@radix-ui/react-icons';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function RemoveMovieAction({ movie }: { movie: Movie }) {
  const { mutateAsync, isPending } = useDeleteMovie(movie.id!);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const closeDialog = () => setOpen(false)

  const onDelete = async () => {
    console.log('ondeete about to trigger')
    await mutateAsync();
    console.log('ondeete triggered')
    toast({
      title: 'Movie Deleted',
      description: <span>Movie <b>{movie.name}</b> has been deleted.</span>
    });
    closeDialog()
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SimpleTooltip text="Remove movie">
        <DialogTrigger asChild>
          <Button variant="ghost" type="button" size="icon"><TrashIcon /></Button>
        </DialogTrigger>
      </SimpleTooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Movie delete confirmation</DialogTitle>
          <DialogDescription>
            Confirm deletion of movie <b>{movie.name}</b>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={isPending} variant="outline" type="button" onClick={closeDialog}>Cancel</Button>
          {isPending ?
            <Button type="submit" disabled>
              <Loader2 className="animate-spin" />
              Please wait</Button>
            :
            <Button onClick={onDelete}>Delete movie</Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}