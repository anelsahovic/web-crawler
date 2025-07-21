import {
  addUrlToQueue,
  crawlUrl,
  crawQueuedUrls,
  deleteUrl,
  getQueuedUrls,
} from '@/api/urls';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Url } from '@/types';
import { CrawlUrlSchema, type CrawlUrlBody } from '@/zodSchemas/schemas';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage } from '@/lib/utils';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import StatusBadge from '@/components/StatusBadge';
import { compareAsc } from 'date-fns';
import CrawlProgressDialog from '@/components/CrawlProgressDialog';
import { useCrawlUpdates } from '@/hooks/useCrawlUpdates';
import CrawlingLoader from '@/components/CrawlingLoader';
import CrawledDataDialog from '@/components/CrawledDataDialog';

// const mockQueuedUrls = [
//   {
//     url: 'https://example112313123123dwadwaawwadawwaadwdadwadawd.com',
//     status: 'QUEUED',
//   },
//   { url: 'https://example2.com', status: 'QUEUED' },
//   { url: 'https://example3.com', status: 'QUEUED' },
//   { url: 'https://example2.com', status: 'QUEUED' },
//   { url: 'https://example3.com', status: 'QUEUED' },
//   { url: 'https://example2.com', status: 'QUEUED' },
//   { url: 'https://example3.com', status: 'QUEUED' },
//   { url: 'https://example2.com', status: 'QUEUED' },
//   { url: 'https://example3.com', status: 'QUEUED' },
// ];

export default function Crawl() {
  const [crawledUrl, setCrawledUrl] = useState<Url>();
  const [queuedUrls, setQueuedUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [openCrawledUrlDialog, setOpenCrawledUrlDialog] = useState(false);
  const [openCrawlingListDialog, setOpenCrawlingListDialog] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [crawlingProgress, setCrawlingProgress] = useState(0);
  const [error, setError] = useState('');
  const actionRef = useRef<'crawl' | 'queue' | null>(null);

  // web socket listening for live status updates
  useCrawlUpdates((data) => {
    // update status progress
    setQueuedUrls((prev) =>
      prev.map((url) =>
        url.id === data.id ? { ...url, status: data.status } : url
      )
    );

    // update progress bar
    if (data.status === 'DONE' || data.status === 'ERROR') {
      setCompletedCount((prev) => prev + 1);
    }
    setCrawlingProgress((completedCount / queuedUrls.length) * 100);
  });

  // fetch queued urls
  useEffect(() => {
    const fetchQueuedUrls = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getQueuedUrls();

        if (response.status === 200) {
          setQueuedUrls(response.data);
          setError('');
        } else {
          setError(response.data);
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          const backendMessage = error.response?.data.error;
          if (backendMessage) {
            setError(backendMessage);
          } else {
            setError('An unexpected error occurred.');
          }
        } else {
          setError('Something went wrong. Try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQueuedUrls();
  }, []);

  // delete queued url
  const handleDeleteUrl = async (urlId: string) => {
    try {
      const response = await deleteUrl(urlId);

      if (response.status === 204) {
        setQueuedUrls((prev) => prev?.filter((url) => url.id !== urlId));
        toast.success('Url removed from queued list');
      } else {
        if (response.statusText) {
          toast.error(response.statusText);
        } else {
          toast.error("Cant't delete the member at the moment");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Uh oh! Something went wrong');
    }
  };

  // bulk crawl all queued urls
  const handleCrawlQueuedUrls = async () => {
    try {
      setIsSubmitting(true);
      setQueuedUrls((prev) =>
        [...prev].sort((a, b) =>
          compareAsc(new Date(a.createdAt), new Date(b.createdAt))
        )
      );
      setOpenCrawlingListDialog(true);

      const response = await crawQueuedUrls();

      if (response.status === 200) {
        toast.success('Crawling of queued urls complete');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error as Error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setQueuedUrls([]);
      setCompletedCount(0);
      setCrawlingProgress(0);
      setOpenCrawlingListDialog(false);
    }
  };

  // form for crawling and adding url to the queue
  const form = useForm<CrawlUrlBody>({
    resolver: zodResolver(CrawlUrlSchema),
  });

  const onSubmit = async (values: CrawlUrlBody) => {
    const action = actionRef.current;
    try {
      setIsSubmitting(true);

      // if Button 'Add to Queue' is clicked
      if (action === 'queue') {
        setError('');
        const response = await addUrlToQueue(values);
        if (response.status === 201) {
          setQueuedUrls((prev) => [...prev, response.data.data]);
          toast.success('URL added to the queue');
        } else {
          toast.error('Failed adding URL to the queue');
        }

        // if Button 'Crawl now' is clicked
      } else if (action === 'crawl') {
        setIsCrawling(true);
        const response = await crawlUrl(values);
        if (response.status === 201) {
          setOpenCrawledUrlDialog(true);
          toast.success('URL crawled successfully');
          setCrawledUrl(response.data);
        } else {
          toast.error("Can't crawl URL now. Please try again later");
        }
      }
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error as Error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsCrawling(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-20 px-4 gap-4">
      {/* Logo */}
      <div>
        <Link
          to="/"
          className="flex w-full justify-center items-center gap-2 font-bold uppercase tracking-wide text-neutral-800  transition-colors duration-300"
        >
          <div className="w-14">
            <img
              src="/logo.png"
              alt="Web Crawler Logo"
              className="size-10 object-contain"
            />
          </div>
          <span className="w-full whitespace-nowrap text-2xl ">
            Web Crawler
          </span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-8 text-center">
        Let's Crawl a Website
      </h1>

      {/* Form - Input + Buttons */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row items-center gap-4 w-full max-w-3xl justify-between"
        >
          <div className="w-auto sm:w-full relative">
            <FormField
              control={form.control}
              name="rawUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="w-full flex justify-center sm:hidden">
                    Enter URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter website URL..."
                      className="w-full sm:p-6"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-center sm:absolute sm:bottom-0 sm:translate-y-6" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex w-full justify-center sm:w-auto gap-2">
            <Button
              className="text-base sm:p-6 sm:text-lg"
              disabled={isSubmitting}
              type="submit"
              name="action"
              value="crawl"
              onClick={() => (actionRef.current = 'crawl')}
            >
              Crawl Now
            </Button>
            <Button
              disabled={isSubmitting}
              type="submit"
              name="action"
              value="queue"
              onClick={() => (actionRef.current = 'queue')}
              className={twMerge(
                buttonVariants({ variant: 'secondary' }),
                'text-base sm:p-6 sm:text-lg'
              )}
            >
              Add to Queue
            </Button>
          </div>
        </form>
      </Form>

      {/* show loader for immediate crawling */}
      <CrawlingLoader open={isCrawling} />

      {/* Show crawled data dialog */}
      <CrawledDataDialog
        url={crawledUrl}
        open={openCrawledUrlDialog}
        onOpenChange={setOpenCrawledUrlDialog}
        loading={isCrawling}
      />

      {/* Dialog that shows progress of the crawling */}
      <CrawlProgressDialog
        urls={queuedUrls}
        open={openCrawlingListDialog}
        onOpenChange={setOpenCrawlingListDialog}
        progress={crawlingProgress}
      />

      {/* Queued URLs and Button to crawl list */}
      <div className="mt-12 w-full max-w-3xl space-y-2 ">
        {/* title and button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Queued URLs</h2>
          <Button
            disabled={queuedUrls.length === 0 || isSubmitting}
            onClick={handleCrawlQueuedUrls}
            variant={'outline'}
            className="cursor-pointer"
          >
            Start Crawling
          </Button>
        </div>

        {/* list */}
        <div className="bg-white shadow-md rounded-xl overflow-y-auto max-h-[280px]">
          <ul>
            {loading ? (
              <p className="px-4 py-6 text-sm text-neutral-500">
                Loading queued URLs...
              </p>
            ) : error ? (
              <p className="px-4 py-6 text-sm text-neutral-500">{error}</p>
            ) : queuedUrls && queuedUrls.length > 0 ? (
              queuedUrls.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-4 sm:px-6 py-4 border-b"
                >
                  <div className="flex justify-center items-center gap-4 overflow-hidden">
                    <span onClick={() => handleDeleteUrl(item.id)}>
                      <FaMinus className="size-4 text-neutral-500 cursor-pointer hover:text-rose-500 transition duration-300" />
                    </span>
                    <span className="max-w-[160px] sm:max-w-xs truncate block">
                      {item.url}
                    </span>
                  </div>
                  <StatusBadge size="md" status={item.status} />
                </li>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-neutral-500">
                No queued URLs yet.
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
