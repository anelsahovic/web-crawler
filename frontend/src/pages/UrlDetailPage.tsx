import { deleteUrl, getUrlById, reanalyzeUrl } from '@/api/urls';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import type { Url } from '@/types';
import { useEffect, useState } from 'react';
import { BsArrowRepeat, BsDatabaseFillAdd } from 'react-icons/bs';
import { FaInfoCircle, FaRegTrashAlt } from 'react-icons/fa';
import { CiCircleCheck, CiNoWaitingSign } from 'react-icons/ci';

import { LuLoaderCircle } from 'react-icons/lu';
import {
  MdLink,
  MdOutlineDashboard,
  MdOutlineError,
  MdOutlineMoreHoriz,
  MdOutlineViewHeadline,
} from 'react-icons/md';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BrokenLinksChartPie } from '@/components/BrokenLinksChartPie';
import { InternalVsExternalLinksChart } from '@/components/InternalVsExternalLinksChart';
import { Button, buttonVariants } from '@/components/ui/button';
import { FaRepeat } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

export default function UrlDetailPage() {
  const [urlData, setUrlData] = useState<Url>();
  const [statusCodes, setStatusCodes] = useState<number[]>([]);
  const [linkCounts, setLinkCounts] = useState<
    {
      internal: number;
      external: number;
    }[]
  >([
    {
      internal: 0,
      external: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  const { urlId } = useParams();
  const navigate = useNavigate();

  // fetching the url data
  useEffect(() => {
    if (!urlId) return;

    const fetchUrlById = async () => {
      try {
        setLoading(true);

        const response = await getUrlById(urlId as string);

        if (response.status === 200) {
          setUrlData(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrlById();
  }, [urlId]);

  // set the data for charts
  useEffect(() => {
    if (urlData) {
      setStatusCodes(urlData.brokenLinks.map((code) => code.statusCode));
      setLinkCounts([
        {
          internal: urlData.internalLinks,
          external: urlData.externalLinks,
        },
      ]);
    }
  }, [urlData]);

  // recrawl/reanalyze url
  const handleReanalyzeUrl = async (id: string) => {
    try {
      setSendingRequest(true);
      setReanalyzing(true);
      const response = await reanalyzeUrl(id);

      if (response.status === 200) {
        toast.success('Url reanalyzed successfully');
        setUrlData(response.data);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error as Error);
      toast.error(errorMessage);
    } finally {
      setSendingRequest(false);
      setReanalyzing(false);
    }
  };

  // delete url
  const handleDeleteUrl = async (id: string) => {
    try {
      setSendingRequest(true);

      const response = await deleteUrl(id);

      if (response.status === 204) {
        toast.success('Url deleted successfully');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error as Error);
      toast.error(errorMessage);
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="w-full h-screen relative">
      {/* reanalyzing the url */}
      {reanalyzing && (
        <div className="fixed flex justify-center items-center gap-2 top-20 sm:top-2 left-1/2 -translate-x-1/2 p-2 text-sm bg-amber-200 text-amber-600 backdrop-blur-2xl rounded-lg">
          <BsArrowRepeat className="animate-spin" /> Reanalyzing...
        </div>
      )}

      {/* fetching is still going and there is no url found */}
      {loading && !urlData && (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <LuLoaderCircle className="size-20 text-primary animate-spin" />{' '}
          <span>Please wait...</span>
        </div>
      )}

      {/* fetching is complete and there is no url found */}
      {!loading && !urlData && (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <span>No URL data found</span>
          <div className="flex gap-2 justify-center items-center">
            <Link
              to="/crawl"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary rounded-lg shadow hover:bg-primary-90 transition"
            >
              <BsDatabaseFillAdd className="text-white" />
              Crawl URL
            </Link>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-neutral-50 border text-neutral-700 rounded-lg shadow hover:bg-primary-90 transition"
            >
              <MdOutlineDashboard className="text-neutral-700" />
              Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* fetching is complete and there is url found */}
      {!loading && urlData && (
        <div className="py-20 sm:py-10 px-6 max-w-6xl mx-auto space-y-6">
          {/* Title and Meta & Links */}
          <div className="flex flex-col gap-6 sm:flex-row justify-between items-center text-center">
            <div className="flex flex-col justify-center items-center        sm:items-start gap-1">
              <h1 className="text-3xl font-bold text-primary">
                {urlData.title || 'Untitled Page'}
              </h1>
              <a className="text-gray-600 text-sm" href={urlData.url}>
                {urlData.url}
              </a>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>
                  Crawled: {new Date(urlData.updatedAt).toLocaleString()}
                </span>
                <StatusBadge status={urlData.status} />
              </div>
            </div>
            <div className="flex gap-2 justify-center items-center">
              <Button
                onClick={() => handleReanalyzeUrl(urlData.id)}
                disabled={sendingRequest}
                variant={'default'}
                size={'default'}
                className="cursor-pointer"
              >
                <FaRepeat />
                Reanalyze
              </Button>
              <Button
                onClick={() => handleDeleteUrl(urlData.id)}
                disabled={sendingRequest}
                variant={'destructive'}
                size={'default'}
                className="cursor-pointer"
              >
                <FaRegTrashAlt />
                Delete
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className={twMerge(
                    buttonVariants({ variant: 'outline' }),
                    'cursor-pointer'
                  )}
                >
                  <MdOutlineMoreHoriz className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-0">
                  <DropdownMenuItem>
                    <Link
                      to="/crawl"
                      className={twMerge(
                        buttonVariants({
                          variant: 'ghost',
                          size: 'default',
                        }),
                        'w-full h-full m-0 flex justify-start items-start'
                      )}
                    >
                      <BsDatabaseFillAdd />
                      Crawl New Url
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      to="/dashboard"
                      className={twMerge(
                        buttonVariants({
                          variant: 'ghost',
                          size: 'default',
                        }),
                        'w-full h-full m-0 flex justify-start items-start '
                      )}
                    >
                      <MdOutlineDashboard />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-2">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <FaInfoCircle className="text-primary" /> General Info
                </h2>
                <p>
                  <strong>HTML Version:</strong> {urlData.htmlVersion}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className="capitalize">
                    {urlData.status.toLowerCase()}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <strong>Login Form:</strong>{' '}
                  {urlData.hasLoginForm ? (
                    <span className="flex items-center justify-center gap-1 text-green-500">
                      <CiCircleCheck />
                      Yes
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1 text-red-500">
                      <CiNoWaitingSign />
                      No
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-2">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <MdOutlineViewHeadline className="text-primary" /> Headings
                  Count
                </h2>
                <ul className="grid grid-cols-2">
                  <li>H1: {urlData.h1Count}</li>
                  <li>H2: {urlData.h2Count}</li>
                  <li>H3: {urlData.h3Count}</li>
                  <li>H4: {urlData.h4Count}</li>
                  <li>H5: {urlData.h5Count}</li>
                  <li>H6: {urlData.h6Count}</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-2">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <MdLink className="text-primary" /> Links
                </h2>
                <p>Internal: {urlData.internalLinks}</p>
                <p>External: {urlData.externalLinks}</p>
                <p className="text-red-600 font-medium">
                  Broken: {urlData.brokenLinksCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InternalVsExternalLinksChart chartData={linkCounts} />

            <BrokenLinksChartPie
              statusCodesArray={statusCodes ? statusCodes : []}
            />
          </div>

          {/* Broken Links Table */}
          {urlData.brokenLinksCount > 0 && (
            <div>
              <h2 className="text-xl font-semibold mt-6 mb-2 text-red-600 flex items-center gap-2">
                <MdOutlineError />
                Broken Links ({urlData.brokenLinksCount})
              </h2>
              <div className="overflow-x-auto border rounded-md shadow-sm">
                <table className="min-w-full text-sm table-auto">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Link</th>
                      <th className="p-3">Status Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urlData.brokenLinks.map((link, index) => (
                      <tr key={link.id} className="border-t">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 break-all text-blue-600 underline">
                          <a href={link.link}>{link.link}</a>
                        </td>
                        <td className="p-3 text-red-500 font-semibold">
                          {link.statusCode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
