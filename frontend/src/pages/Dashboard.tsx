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
import { MdMoreVert } from 'react-icons/md';
import { CgMoreO } from 'react-icons/cg';
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
import type { Url } from '@/types';
import {
  bulkDeleteUrls,
  crawQueuedUrls,
  crawSelectedUrls,
  getAllUrls,
} from '@/api/urls';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import { compareAsc, format } from 'date-fns';
import { BrokenLinksChartPie } from '@/components/BrokenLinksChartPie';
import { Button } from '@/components/ui/button';
import { useCrawlUpdates } from '@/hooks/useCrawlUpdates';
import StatusBadge from '@/components/StatusBadge';
import CrawlProgressDialog from '@/components/CrawlProgressDialog';

export default function Dashboard() {
  const [allUrls, setAllUrls] = useState<Url[]>([]);
  const [queuedUrls, setQueuedUrls] = useState<Url[]>([]);
  const [doneUrls, setDoneUrls] = useState<Url[]>([]);
  const [erroredUrls, setErroredUrls] = useState<Url[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Url[]>([]);
  const [crawlingUrlsList, setCrawlingUrlsList] = useState<Url[]>([]);
  const [selectedUrlsIds, setSelectedUrlsIds] = useState<string[]>([]);
  const [openCrawlingListDialog, setOpenCrawlingListDialog] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [crawlingProgress, setCrawlingProgress] = useState(0);
  const [checkedAll, setCheckedAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [refresh, setRefresh] = useState(false);

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

    // update progress bar
    if (data.status === 'DONE' || data.status === 'ERROR') {
      setCompletedCount((prev) => prev + 1);
    }
    setCrawlingProgress((completedCount / crawlingUrlsList.length) * 100);
  });

  // fetch all urls
  useEffect(() => {
    const fetchAllUrls = async () => {
      try {
        setLoading(true);
        const response = await getAllUrls();
        if (response.status === 200) {
          setAllUrls(response.data);
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
  }, [refresh]);

  // set done, queued, errored urls
  useEffect(() => {
    if (allUrls.length === 0) return;

    setDoneUrls(allUrls.filter((url) => url.status === 'DONE'));
    setQueuedUrls(allUrls.filter((url) => url.status === 'QUEUED'));
    setErroredUrls(allUrls.filter((url) => url.status === 'ERROR'));
  }, [allUrls]);

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
      setCrawlingUrlsList(
        [...queuedUrls].sort((a, b) =>
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
      setSendingRequest(false);
      setCrawlingUrlsList([]);
      setOpenCrawlingListDialog(false);
      setCompletedCount(0);
      setCrawlingProgress(0);
      setRefresh((prev) => !prev);
    }
  };

  // bulk crawl selected urls
  const handleCrawlSelectedUrls = async () => {
    setRefresh((prev) => !prev);

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
      setRefresh((prev) => !prev);
    }
  };

  // extract status codes from broken links in done urls
  const statusCodes = doneUrls.flatMap(
    (url) => url.brokenLinks?.map((link) => link.statusCode) || []
  );

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
                <span className="text-2xl font-bold">{allUrls.length}</span>
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
                <span className="text-2xl font-bold">{doneUrls.length}</span>
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
                <span className="text-2xl font-bold">{queuedUrls.length}</span>
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
                <span className="text-2xl font-bold">{erroredUrls.length}</span>
              </>
            )}
          </div>
          <BiError className=" size-10" />
        </div>
      </div>

      {/* Table + Charts Section */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
        {/* Table */}
        <div className="md:col-span-2 bg-slate-100 rounded-md shadow-md border flex flex-col p-4 gap-2 min-h-0">
          {/* Select all, refresh, More options, Search and select */}
          <div className="flex items-end gap-4 mb-4">
            <div className="flex items-center gap-4 pl-3 text-neutral-500">
              <Checkbox
                className="bg-white"
                checked={checkedAll}
                onCheckedChange={handleSelectAllUrls}
              />
              <IoMdRefresh
                onClick={() => setRefresh((prev) => !prev)}
                className="size-6 cursor-pointer hover:text-neutral-900 transition-all duration-300"
              />

              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <CgMoreO className="size-5 hover:text-neutral-900 transition-all duration-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-0">
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
                      disabled={selectedUrlsIds.length === 0 || sendingRequest}
                      variant={'ghost'}
                      size={'default'}
                    >
                      <FaRegCheckSquare />
                      Crawl Selected
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button
                      disabled={selectedUrlsIds.length === 0 || sendingRequest}
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

            <div className="flex flex-col justify-start gap-1 w-full">
              <p className="text-sm pl-1">Search urls</p>
              <Input type="text" className="bg-white" placeholder="Search..." />
            </div>

            <div className="flex flex-col justify-start gap-1">
              <p className="text-sm pl-1">Sort by</p>
              <Select>
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Created At</SelectItem>
                  <SelectItem value="dark">Title</SelectItem>
                  <SelectItem value="system">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1 shadow bg-white rounded-md ">
            {loading && (
              <div className="w-full h-full flex justify-center items-center">
                <LuLoaderCircle className="animate-spin text-primary size-5" />
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className=""></TableHead>
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
                  allUrls.slice(0, 6).map((url) => (
                    <TableRow key={url.id}>
                      <TableCell className="font-medium">
                        <Checkbox
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
                          <DropdownMenuContent>
                            <DropdownMenuItem>Show details</DropdownMenuItem>
                            <DropdownMenuItem>Reanalyze</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center w-full p-2">
            <div className="size-8 rounded-md bg-primary p-1 text-sm text-white flex justify-center items-center">
              1
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
              <BrokenLinksChartPie statusCodesArray={statusCodes} />
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
    </div>
  );
}
