import { Button } from '@/components/ui/button';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCreateMovie } from '@/stores/movies';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CreateMovieForm, MovieSchema } from './form';

export default function CreateMovieDialog({ open, closeDialog }: { open: boolean, closeDialog: () => void }) {
  const { mutateAsync, isPending } = useCreateMovie();
  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<CreateMovieForm>({
    resolver: zodResolver(MovieSchema),
    defaultValues: {
      name: '',
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: CreateMovieForm) {
    try {
      await mutateAsync(values);
    } catch (error) {
      // The dialog stays open with the values intact so the movie can be
      // resubmitted; reporting success here would be a lie.
      toast({
        variant: 'destructive',
        title: 'Could not create movie',
        description: (error as Error).message,
      });
      return;
    }

    form.reset();
    toast({
      title: 'Movie Created',
      description: <span>Movie <b>{values.name}</b> has been created.</span>,
    });
    closeDialog();
  }

  // reset values when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Form {...form}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <DialogHeader>
            <DialogTitle>Create movie</DialogTitle>
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
              <Button type="submit">Create movie</Button>
            }

          </DialogFooter>
        </form>
      </DialogContent>
    </Form>
  );
}