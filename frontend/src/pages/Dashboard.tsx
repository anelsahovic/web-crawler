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
import { bulkDeleteUrls, getAllUrls } from '@/api/urls';
import { toast } from 'sonner';
import { getErrorMessage, getUrlStatusColor } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BrokenLinksChartPie } from '@/components/BrokenLinksChartPie';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [allUrls, setAllUrls] = useState<Url[]>([]);
  const [queuedUrls, setQueuedUrls] = useState<Url[]>([]);
  const [doneUrls, setDoneUrls] = useState<Url[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [erroredUrls, setErroredUrls] = useState<Url[]>([]);
  const [checkedAll, setCheckedAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

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
  }, []);

  // set done, queued, errored urls
  useEffect(() => {
    if (allUrls.length === 0) return;

    setDoneUrls(allUrls.filter((url) => url.status === 'DONE'));
    setQueuedUrls(allUrls.filter((url) => url.status === 'QUEUED'));
    setErroredUrls(allUrls.filter((url) => url.status === 'ERROR'));
  }, [allUrls]);

  // add/remove checked urls id from the array
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedUrls((prev) =>
      checked ? [...prev, id] : prev.filter((existingId) => existingId !== id)
    );
  };

  // select-deselect all urls / add-remove from the array
  const handleSelectAllUrls = () => {
    const allIds = allUrls.map((url) => url.id);

    if (!checkedAll) {
      setSelectedUrls(allIds);
      setCheckedAll(true);
    } else {
      setSelectedUrls([]);
      setCheckedAll(false);
    }
  };

  const handleDeleteSelectedUrls = async () => {
    try {
      setSendingRequest(true);
      const response = await bulkDeleteUrls(selectedUrls);

      if (response.status === 204) {
        setAllUrls((prev) =>
          prev.filter((url) => !selectedUrls.includes(url.id))
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

  // extract status codes from done urls
  const statusCodes = doneUrls.flatMap(
    (url) => url.brokenLinks?.map((link) => link.statusCode) || []
  );

  return (
    <div className="min-h-screen flex flex-col w-full p-4 gap-4">
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
            <div className="flex items-center gap-4 pl-3 text-neutral-600">
              <Checkbox
                className="bg-white"
                checked={checkedAll}
                onCheckedChange={handleSelectAllUrls}
              />
              <IoMdRefresh className="size-6" />

              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <CgMoreO className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-0">
                  <DropdownMenuItem>
                    <Button
                      disabled={selectedUrls.length === 0 || sendingRequest}
                      variant={'ghost'}
                      size={'default'}
                    >
                      <FaRegClock />
                      Crawl Queued
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button
                      disabled={selectedUrls.length === 0 || sendingRequest}
                      variant={'ghost'}
                      size={'default'}
                    >
                      <FaRegCheckSquare />
                      Crawl Selected
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button
                      disabled={selectedUrls.length === 0 || sendingRequest}
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
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
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
                          checked={selectedUrls.includes(url.id)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(url.id, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge className={getUrlStatusColor(url.status)}>
                          {url.status}
                        </Badge>
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
    </div>
  );
}
