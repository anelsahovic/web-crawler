import { getQueuedUrls } from '@/api/urls';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Url } from '@/types';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

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
  const [input, setInput] = useState('');
  const [queuedUrls, setQueuedUrls] = useState<Url[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        console.log(response);
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
      <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-3xl ">
        <Input
          type="text"
          placeholder="Enter website URL..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full  sm:p-6"
        />
        <div className="flex gap-2 w-full sm:w-auto justify-center">
          <Button className="text-base sm:p-6 sm:text-lg">Crawl Now</Button>
          <Button
            className={twMerge(
              buttonVariants({ variant: 'secondary' }),
              'text-base sm:p-6 sm:text-lg'
            )}
          >
            Add to Queue
          </Button>
        </div>
      </div>

      {/* Queued URLs */}
      <div className="mt-12 w-full max-w-3xl ">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Queued URLs
        </h2>

        <div className="bg-white shadow-md rounded-xl overflow-y-auto max-h-[280px]">
          <ul>
            {loading ? (
              <p className="px-4 py-6 text-sm text-neutral-500">
                Loading queued URLs...
              </p>
            ) : error ? (
              <p className="px-4 py-6 text-sm text-rose-500">
                Failed to fetch URLs.
              </p>
            ) : queuedUrls && queuedUrls.length > 0 ? (
              queuedUrls.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-4 sm:px-6 py-4 border-b"
                >
                  <div className="flex justify-center items-center gap-4 overflow-hidden">
                    <span>
                      <FaMinus className="size-4 text-neutral-500 cursor-pointer hover:text-rose-500 transition duration-300" />
                    </span>
                    <span className="max-w-[160px] sm:max-w-xs truncate block">
                      {item.url}
                    </span>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    {item.status}
                  </span>
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
