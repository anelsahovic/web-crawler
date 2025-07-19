import type { UrlStatus } from '@/types';
import { Badge } from './ui/badge';
import { getUrlStatusColor } from '@/lib/utils';
import { IoCheckmarkDone } from 'react-icons/io5';
import { FaRegClock } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { MdErrorOutline } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';

type Props = {
  status: UrlStatus;
  size?: 'sm' | 'md' | 'lg';
};

export default function StatusBadge({ status, size }: Props) {
  return (
    <Badge
      className={twMerge(
        getUrlStatusColor(status),
        size === 'sm'
          ? 'px-2 py-0.5 text-xs'
          : size === 'md'
          ? 'px-2.5 py-1 text-sm'
          : size === 'lg' && 'px-3 py-1.5 text-base',
        'flex justify-center items-center'
      )}
    >
      <span
        className={`${
          size === 'sm'
            ? 'text-xs'
            : size === 'md'
            ? 'text-sm'
            : size === 'lg' && 'text-base'
        }`}
      >
        {status === 'DONE' ? (
          <IoCheckmarkDone />
        ) : status === 'QUEUED' ? (
          <FaRegClock />
        ) : status === 'RUNNING' ? (
          <FiLoader className="animate-spin duration-75" />
        ) : (
          status === 'ERROR' && <MdErrorOutline />
        )}
      </span>

      <span>{status}</span>
    </Badge>
  );
}
