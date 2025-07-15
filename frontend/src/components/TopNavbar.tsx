import { Link, useLocation } from 'react-router-dom';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';
import { FaAngleLeft, FaGithub, FaLinkedin } from 'react-icons/fa';
import { IoIosMail } from 'react-icons/io';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { buttonVariants } from './ui/button';
import { twMerge } from 'tailwind-merge';
import { FiHome, FiInfo } from 'react-icons/fi';

const navItems = [
  { title: 'Home', href: '/', icon: <FiHome /> },
  { title: 'About', href: '/about', icon: <FiInfo /> },
];

export default function TopNavbar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div className="p-1 h-12 w-full backdrop-blur rounded-lg bg-neutral-100/30 shadow-md border border-neutral-200 z-50">
        <div className="w-full h-full flex items-center justify-between gap-10 relative">
          <Link
            to="/"
            className="flex w-full items-center gap-2 font-bold uppercase tracking-wide text-neutral-800 hover:text-primary transition-colors duration-300"
          >
            <div className="w-10">
              <img
                src="/logo.png"
                alt="Web Crawler Logo"
                className="size-7 object-contain"
              />
            </div>
            <span className="w-full whitespace-nowrap text-sm sm:text-base ">
              Crawler
            </span>
          </Link>

          <div className="w-full h-full hidden sm:flex gap-2">
            {/* Desktop nav links */}
            {navItems.map((navItem) => (
              <Link
                key={navItem.href}
                to={navItem.href}
                className={`hidden sm:flex justify-center items-center h-full w-full p-4 gap-2 font-semibold rounded-lg transition duration-300 ${
                  navItem.href === pathname
                    ? 'bg-neutral-200/60 text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>{navItem.icon}</span>
                <span className=""> {navItem.title}</span>
              </Link>
            ))}
          </div>

          <Link
            to={'/home'}
            className={twMerge(
              buttonVariants({ variant: 'default' }),
              'text-base hidden sm:flex'
            )}
          >
            Start Crawling
          </Link>

          {/* Mobile menu */}
          <div className="flex sm:hidden items-center">
            <Sheet>
              <SheetTrigger className="flex items-center justify-center h-10 w-10 rounded-md border border-neutral-200 hover:border-neutral-300 transition">
                <HiOutlineMenuAlt1 className="w-6 h-6 text-neutral-700" />
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex flex-col justify-between p-6 space-y-6"
              >
                {/* Header */}
                <div className="space-y-1">
                  <SheetHeader className="flex flex-col justify-center items-center w-full text-center">
                    <SheetTitle>
                      <Link
                        to="/"
                        className="flex items-center gap-2 font-bold text-xl tracking-wide text-neutral-800 hover:text-primary transition"
                      >
                        <img
                          src="/logo.png"
                          alt="Web Crawler Logo"
                          className="w-7 h-7 object-contain"
                        />
                        <span>Web Crawler</span>
                      </Link>
                    </SheetTitle>
                    <SheetDescription className="text-sm text-neutral-500">
                      Analyze websites. Instantly.
                    </SheetDescription>
                  </SheetHeader>
                </div>

                {/* Navigation Items */}
                <nav className="flex flex-col gap-3 mt-4">
                  {navItems.map((navItem) => (
                    <SheetClose key={navItem.href} asChild>
                      <Link
                        to={navItem.href}
                        className={`flex items-center justify-between px-4 py-2 rounded-lg text-base font-medium transition-all ${
                          navItem.href === pathname
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        <span className="flex justify-center items-center gap-2">
                          {navItem.icon} {navItem.title}
                        </span>
                        {navItem.href === pathname && (
                          <FaAngleLeft className="text-blue-500" />
                        )}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* Footer / Social Links */}
                <SheetFooter className="border-t border-neutral-200 pt-4">
                  <div className="flex flex-col gap-2 text-sm text-neutral-600 w-full">
                    <p className="font-medium">Contact information</p>
                    <div className="flex items-center gap-4">
                      <a
                        href="https://linkedin.com/in/anelsahovic"
                        target="_blank"
                      >
                        <FaLinkedin className="w-5 h-5 hover:text-blue-600 transition" />
                      </a>
                      <a href="https://github.com/anelsahovic" target="_blank">
                        <FaGithub className="w-5 h-5 hover:text-neutral-800 transition" />
                      </a>
                      <a href="mailto:anel.sahovic.bsc@gmail.com">
                        <IoIosMail className="w-5 h-5 hover:text-red-500 transition" />
                      </a>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      &copy; {new Date().getFullYear()} Anel Šahović
                    </p>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
