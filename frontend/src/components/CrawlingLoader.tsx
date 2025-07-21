import LoaderBars from './LoaderBars';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

type Props = {
  open: boolean;
};

export default function CrawlingLoader({ open }: Props) {
  return (
    <Dialog open={open}>
      <DialogTrigger asChild />
      <DialogClose disabled asChild className="hidden"></DialogClose>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="[&>button]:hidden"
      >
        <DialogHeader className="text-center w-full">
          <DialogTitle className="text-2xl text-center">
            Crawling your URL
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col justify-center items-center gap-7  pt-5 pb-10">
          <LoaderBars />
          <p className="text-sm text-neutral-500">
            Please wait this might take a while...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
