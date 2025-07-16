import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { BsDatabaseFillAdd } from 'react-icons/bs';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-extrabold text-primary tracking-widest">
          404
        </h1>
        <p className="text-2xl font-semibold text-gray-800 mt-4">
          Page Not Found
        </p>
        <p className="text-gray-500 mt-2">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-2 justify-center items-center">
          <Link
            to="/crawl"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary rounded-lg shadow hover:bg-primary-90 transition"
          >
            <BsDatabaseFillAdd className="text-white" />
            Crawl Url
          </Link>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-neutral-50 border text-neutral-700 rounded-lg shadow hover:bg-primary-90 transition"
          >
            <FiHome className="text-neutral-700" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
