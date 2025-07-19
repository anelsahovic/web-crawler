import type { Url } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import StatusBadge from './StatusBadge';
import { Progress } from './ui/progress';

type Props = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  urls: Url[];
  progress: number;
};

export default function CrawlProgressDialog({
  open,
  onOpenChange,
  urls,
  progress,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crawling urls list</DialogTitle>
          <DialogDescription>We are getting your data</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <span className="absolute top-0 right-1 -translate-y-6 text-sm text-neutral-600 font-semibold ">
            {progress.toFixed()} %
          </span>
          <Progress value={progress} />
        </div>
        <ul>
          {urls.map((url, index) => (
            <li
              key={index}
              className="flex justify-between items-center px-4 sm:px-6 py-4 border-b gap-2"
            >
              <StatusBadge size="sm" status={url.status} />
              <span className="max-w-[120px] sm:max-w-xs truncate block text-sm">
                {url.url}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
