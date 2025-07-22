import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MdFindInPage, MdMoreVert, MdOutlineMoreHoriz } from 'react-icons/md';
import { IoMdRefresh } from 'react-icons/io';
import { BiError } from 'react-icons/bi';
import {
  FaCheckDouble,
  FaListOl,
  FaRegCheckSquare,
  FaRegClock,
  FaRegTrashAlt,
} from 'react-icons/fa';
import { LuLayoutDashboard, LuLoaderCircle } from 'react-icons/lu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import type { Stats, Url } from '@/types';
import {
  bulkDeleteUrls,
  crawQueuedUrls,
  crawSelectedUrls,
  deleteUrl,
  getAllUrls,
  getQueuedUrls,
  getUrlsStats,
  reanalyzeUrl,
} from '@/api/urls';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import { compareAsc, format } from 'date-fns';
import { BrokenLinksChartPie } from '@/components/BrokenLinksChartPie';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCrawlUpdates } from '@/hooks/useCrawlUpdates';
import StatusBadge from '@/components/StatusBadge';
import CrawlProgressDialog from '@/components/CrawlProgressDialog';
import { FaRepeat } from 'react-icons/fa6';
import { Link, useSearchParams } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import CrawlingLoader from '@/components/CrawlingLoader';
import CrawledDataDialog from '@/components/CrawledDataDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '6');

  const [allUrls, setAllUrls] = useState<Url[]>([]);
  const [queuedUrls, setQueuedUrls] = useState<Url[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Url[]>([]);
  const [crawlingUrlsList, setCrawlingUrlsList] = useState<Url[]>([]);
  const [reanalyzedUrl, setReanalyzedUrl] = useState<Url>();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    done: 0,
    queued: 0,
    error: 0,
    statusCodes: [],
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalUrls, setTotalUrls] = useState(0);
  const [selectedUrlsIds, setSelectedUrlsIds] = useState<string[]>([]);
  const [openCrawlingListDialog, setOpenCrawlingListDialog] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [crawlingProgress, setCrawlingProgress] = useState(0);
  const [checkedAll, setCheckedAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [openReanalyzedUrlDialog, setOpenReanalyzedUrlDialog] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // fetch paginated urls
  useEffect(() => {
    const fetchAllUrls = async () => {
      try {
        setLoading(true);
        const response = await getAllUrls(currentPage, limit);
        if (response.status === 200) {
          setAllUrls(response.data.urls);
          setTotalPages(response.data.totalPages);
          setTotalUrls(response.data.totalUrls);
        } else {
          toast.error('Error fetching URLs');
        }
      } catch (error) {
        console.error(error);
        const errorMessage = getErrorMessage(error as Error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUrls();
  }, [currentPage, limit, refresh]);

  // fetch  queued urls and stats
  useEffect(() => {
    const fetchUrlsStats = async () => {
      try {
        setLoading(true);
        const response = await getUrlsStats();
        if (response.status === 200) {
          setStats(response.data);
        } else {
          toast.error('Error fetching stats');
        }
      } catch (error) {
        console.error(error);
        const errorMessage = getErrorMessage(error as Error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchQueuedUrls = async () => {
      try {
        setLoading(true);

        const response = await getQueuedUrls();

        if (response.status === 200) {
          setQueuedUrls(response.data);
        } else {
          toast.error('Error fetching stats');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrlsStats();
    fetchQueuedUrls();
  }, [refresh]);

  // web socket listening for live status updates
  useCrawlUpdates((data) => {
    // update status progress in table
    setAllUrls((prev) =>
      prev.map((url) =>
        url.id === data.id ? { ...url, status: data.status } : url
      )
    );

    // update status progress in crawled list dialog
    setCrawlingUrlsList((prev) =>
      prev.map((url) =>
        url.id === data.id ? { ...url, status: data.status } : url
      )
    );

    // update all urls data in table if done
    if (data.status === 'DONE') {
      setAllUrls((prev) => {
        const exists = prev.some((url) => url.id === data.url.id);

        if (exists) {
          return prev.map((url) => (url.id === data.url.id ? data.url : url));
        } else {
          return [...prev, data.url];
        }
      });
    }

    // update progress bar
    if (data.status === 'DONE' || data.status === 'ERROR') {
      setCompletedCount((prev) => prev + 1);
    }
    setCrawlingProgress((completedCount / crawlingUrlsList.length) * 100);
  });

  // add/remove checked urls from the array
  const handleCheckboxChange = (id: string, urlObj: Url, checked: boolean) => {
    setSelectedUrlsIds((prev) =>
      checked ? [...prev, id] : prev.filter((existingId) => existingId !== id)
    );

    setSelectedUrls((prev) =>
      checked ? [...prev, urlObj] : prev.filter((u) => u.id !== id)
    );

    setSelectedUrls((prev) =>
      prev.map((url) => ({
        ...url,
        status: 'QUEUED',
      }))
    );
  };

  // select-deselect all urls / add-remove from the array
  const handleSelectAllUrls = () => {
    const allIds = allUrls.map((url) => url.id);

    if (!checkedAll) {
      setSelectedUrlsIds(allIds);
      setSelectedUrls(allUrls);
      setCheckedAll(true);
    } else {
      setSelectedUrlsIds([]);
      setSelectedUrls([]);
      setCheckedAll(false);
    }
  };

  // bulk delete selected urls
  const handleDeleteSelectedUrls = async () => {
    try {
      setSendingRequest(true);
      const response = await bulkDeleteUrls(selectedUrlsIds);

      if (response.status === 204) {
        setAllUrls((prev) =>
          prev.filter((url) => !selectedUrlsIds.includes(url.id))
        );
        toast.success('Successfully deleted URLs');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error as Error);
      toast.error(errorMessage);
    } finally {
      setSendingRequest(false);
    }
  };

  // bulk crawl all queued urls
  const handleCrawlQueuedUrls = async () => {
    try {
      setSendingRequest(true);
      setCrawlingUrlsList(queuedUrls);
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
      setSendingRequest(false);
      setCrawlingUrlsList([]);
      setOpenCrawlingListDialog(false);
      setCompletedCount(0);
      setCrawlingProgress(0);
    }
  };

  // bulk crawl selected urls
  const handleCrawlSelectedUrls = async () => {
    try {
      setSendingRequest(true);

      setCrawlingUrlsList(
        [...selectedUrls].sort((a, b) =>
          compareAsc(new Date(a.createdAt), new Date(b.createdAt))
        )
      );
      setOpenCrawlingListDialog(true);

      const response = await crawSelectedUrls(selectedUrlsIds);

      if (response.status === 200) {
        toast.success('Crawling of selected URLs completed');
      }
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error as Error);
      toast.error(errorMessage);
    } finally {
      setSendingRequest(false);
      setCrawlingUrlsList([]);
      setSelectedUrlsIds([]);
      setSelectedUrls([]);
      setOpenCrawlingListDialog(false);
      setCompletedCount(0);
      setCrawlingProgress(0);
    }
  };

  // recrawl/reanalyze single url
  const handleReanalyzeUrl = async (id: string) => {
    try {
      setSendingRequest(true);
      setReanalyzing(true);
      setAllUrls((prev) =>
        prev.map((url) => (url.id === id ? { ...url, status: 'RUNNING' } : url))
      );

      const response = await reanalyzeUrl(id);

      if (response.status === 200) {
        toast.success('Url reanalyzed successfully');
        setOpenReanalyzedUrlDialog(true);
        setReanalyzedUrl(response.data);
        setAllUrls((prev) =>
          prev.map((url) => (url.id === response.data.id ? response.data : url))
        );
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

  // delete single url
  const handleDeleteUrl = async (id: string) => {
    try {
      setSendingRequest(true);

      const response = await deleteUrl(id);

      if (response.status === 204) {
        toast.success('Url deleted successfully');
        setAllUrls((prev) => prev.filter((url) => url.id !== id));
      }
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(error as Error);
      toast.error(errorMessage);
    } finally {
      setSendingRequest(false);
    }
  };

  // when the user clicks on a pagination link
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString(), limit: limit.toString() });
  };

  const handlePerPageChange = (perPage: string) => {
    setSearchParams({ page: currentPage.toString(), limit: perPage });
  };

  // Determine start and end pages to always show 3 buttons when possible
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  // Adjust if we're at the start or end to keep 3 buttons
  if (currentPage === 1) {
    endPage = Math.min(totalPages, 3);
  } else if (currentPage === totalPages && totalPages >= 3) {
    startPage = totalPages - 2;
  }
  // Build the page number array
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen flex flex-col w-full p-4 gap-4">
      {/* title */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between py-4">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <span className="text-primary">
              <LuLayoutDashboard className="inline-block text-4xl text-primary" />
            </span>
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor crawl status, URLs, and system activity in real-time.
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {/* total urls card */}
        <div className="bg-sky-500 text-white rounded-md shadow-lg p-4 flex  items-end justify-between min-h-[110px]">
          <div className="flex flex-col">
            {loading ? (
              <div className="w-full h-full flex justify-center items-center">
                <LuLoaderCircle className="animate-spin text-white size-5" />
              </div>
            ) : (
              <>
                <span className="text-sm font-medium opacity-80">Total</span>
                <span className="text-2xl font-bold">{stats.total}</span>
              </>
            )}
          </div>
          <FaListOl className=" size-10" />
        </div>

        {/* done urls card */}
        <div className="bg-green-500 text-white rounded-md shadow-lg p-4 flex  items-end justify-between min-h-[110px]">
          <div className="flex flex-col">
            {loading ? (
              <div className="w-full h-full flex justify-center items-center">
                <LuLoaderCircle className="animate-spin text-white size-5" />
              </div>
            ) : (
              <>
                <span className="text-sm font-medium opacity-80">Done</span>
                <span className="text-2xl font-bold">{stats.done}</span>
              </>
            )}
          </div>
          <FaCheckDouble className=" size-10" />
        </div>

        {/* queued urls card */}
        <div className="bg-amber-500 text-white rounded-md shadow-lg p-4 flex  items-end justify-between min-h-[110px]">
          <div className="flex flex-col">
            {loading ? (
              <div className="w-full h-full flex justify-center items-center">
                <LuLoaderCircle className="animate-spin text-white size-5" />
              </div>
            ) : (
              <>
                <span className="text-sm font-medium opacity-80">Queued</span>
                <span className="text-2xl font-bold">{stats.queued}</span>
              </>
            )}
          </div>
          <FaRegClock className=" size-10" />
        </div>

        {/* errored urls card */}
        <div className="bg-red-500 text-white rounded-md shadow-lg p-4 flex  items-end justify-between min-h-[110px]">
          <div className="flex flex-col">
            {loading ? (
              <div className="w-full h-full flex justify-center items-center">
                <LuLoaderCircle className="animate-spin text-white size-5" />
              </div>
            ) : (
              <>
                <span className="text-sm font-medium opacity-80">Errored</span>
                <span className="text-2xl font-bold">{stats.error}</span>
              </>
            )}
          </div>
          <BiError className=" size-10" />
        </div>
      </div>

      {/* Table + Charts Section */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
        {/* Table */}
        <div className="md:col-span-2 bg-white rounded-md shadow-md border flex flex-col p-4 gap-2 min-h-0">
          {/* Select all, refresh, More options, Search and select */}
          <div className="flex flex-col sm:flex-row items-end gap-4 mb-4 w-full">
            <div className="flex justify-center items-end gap-4 w-full">
              {/* search */}
              <div className="flex flex-col justify-start gap-1 w-full">
                <p className="text-sm pl-1">Search urls</p>
                <Input
                  type="text"
                  className="bg-white"
                  placeholder="Search..."
                />
              </div>
            </div>

            <div className="flex sm:flex-row-reverse justify-center items-end gap-4 w-full">
              {/*more options */}
              <div className="flex items-center gap-4 text-neutral-500">
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
                      <span
                        onClick={() => setRefresh((prev) => !prev)}
                        className={buttonVariants({
                          variant: 'ghost',
                          size: 'default',
                        })}
                      >
                        <IoMdRefresh className="size-5" />
                        Refresh
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Button
                        onClick={handleCrawlQueuedUrls}
                        disabled={queuedUrls.length === 0 || sendingRequest}
                        variant={'ghost'}
                        size={'default'}
                      >
                        <FaRegClock />
                        Crawl Queued
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Button
                        onClick={handleCrawlSelectedUrls}
                        disabled={
                          selectedUrlsIds.length === 0 || sendingRequest
                        }
                        variant={'ghost'}
                        size={'default'}
                      >
                        <FaRegCheckSquare />
                        Crawl Selected
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Button
                        disabled={
                          selectedUrlsIds.length === 0 || sendingRequest
                        }
                        onClick={handleDeleteSelectedUrls}
                        variant={'ghost'}
                        size={'default'}
                      >
                        <FaRegTrashAlt />
                        Delete Selected
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* sorting */}
              <div className="flex flex-col justify-start gap-1">
                <p className="text-sm pl-1">Sort by</p>
                <Select>
                  <SelectTrigger className="max-w-[250px] bg-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Created At</SelectItem>
                    <SelectItem value="dark">Title</SelectItem>
                    <SelectItem value="system">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* new url link */}
              <div>
                <Link
                  className={buttonVariants({ variant: 'default' })}
                  to="/crawl"
                >
                  Add New URL
                </Link>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 border border-t-2 border-primary/25 border-b-0  rounded-t-md ">
            {loading && (
              <div className="w-full h-full flex justify-center items-center">
                <LuLoaderCircle className="animate-spin text-primary size-5" />
              </div>
            )}

            <Table className="overflow-y-scroll h-48">
              <TableHeader>
                <TableRow className="bg-primary/20 hover:bg-primary/20">
                  <TableHead className="">
                    {' '}
                    <Checkbox
                      className="bg-white border-neutral-300 shadow"
                      checked={checkedAll}
                      onCheckedChange={handleSelectAllUrls}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* data rows */}

                {!loading &&
                  allUrls &&
                  allUrls.length > 0 &&
                  allUrls.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell className="font-medium">
                        <Checkbox
                          className="border-neutral-300 shadow"
                          checked={selectedUrlsIds.includes(url.id)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(url.id, url, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <StatusBadge status={url.status} />
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate">
                        {url.title ? url.title : 'N/A'}
                      </TableCell>
                      <TableCell>{url.url}</TableCell>
                      <TableCell>
                        {format(new Date(url.createdAt), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="cursor-pointer">
                            <MdMoreVert className="size-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="p-0">
                            <DropdownMenuItem>
                              <Link
                                to={`/urls/${url.id}`}
                                className={twMerge(
                                  buttonVariants({
                                    variant: 'ghost',
                                    size: 'default',
                                  }),
                                  'w-full h-full m-0'
                                )}
                              >
                                <MdFindInPage />
                                Show Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Button
                                onClick={() => handleReanalyzeUrl(url.id)}
                                disabled={sendingRequest}
                                variant={'ghost'}
                                size={'default'}
                              >
                                <FaRepeat />
                                Reanalyze
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Button
                                onClick={() => handleDeleteUrl(url.id)}
                                disabled={sendingRequest}
                                variant={'ghost'}
                                size={'default'}
                              >
                                <FaRegTrashAlt />
                                Delete
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-end w-full p-2">
            <div></div>
            <div className="flex flex-col items-center justify-center gap-4">
              <Pagination>
                {/* pagination */}
                <PaginationContent>
                  {/* previous button */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                      }
                      className={
                        currentPage === 1
                          ? 'text-neutral-300 cursor-not-allowed hover:bg-neutral-50 hover:text-neutral-300'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {/* pagination numbers */}
                  {pageNumbers.map((page) => (
                    <PaginationItem key={page} className="cursor-pointer">
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {/* next button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                      }
                      className={
                        currentPage === totalPages
                          ? 'text-neutral-300 cursor-not-allowed hover:bg-neutral-50 hover:text-neutral-300'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              {/* results */}
              <p className="text-sm truncate text-neutral-600">
                Showing {currentPage * allUrls.length} / {totalUrls} urls
              </p>
            </div>

            {/* per page select */}
            <div className="flex flex-col justify-center sm:items-center gap-1 w-full sm:w-auto items-end">
              <span className="text-xs text-neutral-400">Per page</span>
              <Select
                defaultValue={limit.toString()}
                onValueChange={(value) => handlePerPageChange(value)}
              >
                <SelectTrigger className="w-[50px] p-0 flex justify-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className=" md:col-span-1 h-full">
          {loading ? (
            <div className="w-full h-full flex justify-center items-center rounded-md shadow-md bg-slate-100">
              <LuLoaderCircle className="animate-spin text-primary size-5" />
            </div>
          ) : (
            <>
              <BrokenLinksChartPie statusCodesArray={stats?.statusCodes} />
            </>
          )}
        </div>
      </div>

      {/* Dialog that shows progress of the crawling */}
      <CrawlProgressDialog
        urls={crawlingUrlsList}
        open={openCrawlingListDialog}
        onOpenChange={setOpenCrawlingListDialog}
        progress={crawlingProgress}
      />

      {/* show loader for reanalyze url / crawling */}
      <CrawlingLoader open={reanalyzing} />

      {/* Show crawled data dialog */}
      <CrawledDataDialog
        url={reanalyzedUrl}
        open={openReanalyzedUrlDialog}
        onOpenChange={setOpenReanalyzedUrlDialog}
        loading={reanalyzing}
      />
    </div>
  );
}
