import SimpleTooltip from '@/components/molecules/SimpleTooltip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Movie from '@/models/movie';
import { useUpdateMovie } from '@/stores/movies';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateMovieForm, MovieSchema } from './form';

export default function UpdateMovieAction({ movie }: { movie: Movie }) {
  const { mutateAsync, isPending } = useUpdateMovie(movie.id!);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<CreateMovieForm>({
    resolver: zodResolver(MovieSchema),
    defaultValues: movie,
  });

  // 2. Define a submit handler.
  const closeDialog = () => setOpen(false)

  async function onSubmit(values: CreateMovieForm) {
    await mutateAsync(values);
    form.reset();
    toast({
      title: 'Movie Updated',
      description: <span>Movie <b>{values.name}</b> has been updated.</span>,
    });
    closeDialog();
  }

  useEffect(() => form.reset(movie), [form, movie])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SimpleTooltip text="Update movie">
        <DialogTrigger asChild>
          <Button variant="ghost" type="button" size="icon"><EditIcon /></Button>
        </DialogTrigger>
      </SimpleTooltip>

      <Form {...form}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Update movie</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Movie name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button disabled={isPending} variant="outline" type="button" onClick={closeDialog}>Cancel</Button>
              {isPending ?
                <Button type="submit" disabled>
                  <Loader2 className="animate-spin" />
                  Please wait</Button>
                :
                <Button type="submit">Update movie</Button>
              }

            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}