import type { Url } from '@/types';
import InfoCard from './InfoCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Link } from 'react-router-dom';

type Props = {
  url: Url | undefined;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

export default function CrawledDataDialog({
  url,
  open,
  onOpenChange,
  loading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Crawled URL Summary
          </DialogTitle>
          <DialogDescription>
            The following data was extracted from the provided URL.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {!loading && !url && (
            <p className="text-sm text-muted-foreground">
              No URL data available.
            </p>
          )}

          {!loading && url && (
            <div className="space-y-4">
              <div className="border rounded-xl p-4 shadow-sm bg-muted/50">
                {/* title */}
                <h2 className="text-lg font-semibold text-primary mb-1">
                  {url.title}
                </h2>
                {/* url */}
                <a
                  href={url.url}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {url.url}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="HTML Version" value={url.htmlVersion} />
                <InfoCard
                  label="Login Form"
                  value={url.hasLoginForm ? 'Yes' : 'No'}
                />
                <InfoCard label="H1 Tags" value={url.h1Count} />
                <InfoCard label="H2 Tags" value={url.h2Count} />
                <InfoCard label="H3 Tags" value={url.h3Count} />
                <InfoCard label="Internal Links" value={url.internalLinks} />
                <InfoCard label="External Links" value={url.externalLinks} />
                <InfoCard label="Broken Links" value={url.brokenLinksCount} />
                <InfoCard label="Status" value={url.status} />
                <InfoCard
                  label="Created At"
                  value={new Date(url.createdAt).toLocaleString()}
                />
              </div>
              <div className="flex w-full justify-end">
                <Link
                  to={`/urls/${url.id}`}
                  className="text-sm py-1.5 px-2 bg-primary text-white rounded-md "
                >
                  See details
                </Link>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
