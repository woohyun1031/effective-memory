'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { notoSansKrBold } from 'styles/fonts';
import { DarkModeThemeContext } from 'app/providers';
// import Moon from '/images/moon.svg';
// import Sun from '/images/sun.svg';
interface LayoutProps {
  children: React.ReactNode;
}

const Header = () => {
  const [isShow, setIsShow] = React.useState(false);
  const { isDark, setIsDark } = React.useContext(DarkModeThemeContext);

  const changeTheme = React.useCallback(() => {
    const localTheme = localStorage.getItem('theme');
    if (localTheme) {
      if (localTheme === 'dark') {
        localStorage.removeItem('theme');
        document.documentElement.classList.remove('dark');
        return setIsDark(false);
      }
    } else {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 flex justify-center border-b-2 border-gray-200 p-6 backdrop-blur-md dark:border-gray-500">
      <div className="mx-10 flex w-full max-w-container flex-wrap items-center justify-between">
        <Link
          href="/blog"
          className="mr-6 flex flex-shrink-0 cursor-pointer items-center"
        >
          <span className="font-sansM text-xl text-blue-600">WOOH</span>
          <span className="font-sansM text-xl text-gray-900 dark:text-white">
            TECH
          </span>
        </Link>

        <div className="flex lg:hidden ">
          <button
            className="text-gray-800 dark:text-white"
            onClick={() => changeTheme()}
          >
            {isDark ? (
              <div>
                <Image
                  src="/sun.svg"
                  alt="me"
                  width="25"
                  height="25"
                  className="fill-current"
                />
              </div>
            ) : (
              <div>
                <Image src="/moon.svg" alt="me" width="25" height="25" />
              </div>
            )}
          </button>
          <button
            className="flex items-center rounded  px-3 py-2 text-gray-900  hover:text-blue-600"
            onClick={() => setIsShow((prev) => !prev)}
          >
            {isShow ? (
              <svg
                className="fill-current dark:text-white"
                viewBox="0 96 960 960"
                height="20"
                width="20"
              >
                <path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" />
              </svg>
            ) : (
              <svg
                className="fill-current dark:text-white"
                viewBox="0 96 960 960"
                height="20"
                width="20"
              >
                <path d="M120 816v-60h720v60H120Zm0-210v-60h720v60H120Zm0-210v-60h720v60H120Z" />
              </svg>
            )}
          </button>
        </div>
        {isShow && (
          <div className="w-full lg:hidden">
            <div className="text-sm">
              <Link
                href="./resume"
                className="mt-4 block cursor-pointer text-stone-600 hover:text-black dark:text-white lg:mt-0 lg:inline-block"
              >
                채용
              </Link>
              <Link
                href="/blog"
                className="mt-4 block cursor-pointer text-stone-600 hover:text-black dark:text-white lg:mt-0 lg:inline-block"
              >
                블로그
              </Link>
              <Link
                target="_blank"
                href="https://woo1031.notion.site/Back-to-Back-a43f5fe01a5d46efac38f0c6cc0893c5"
                className="mt-4 block cursor-pointer text-stone-600 hover:text-black dark:text-white lg:mt-0 lg:inline-block"
              >
                LOG
              </Link>
            </div>
          </div>
        )}
        <div className="hidden w-full lg:flex lg:w-auto lg:items-center ">
          <div className="flex text-sm lg:flex-grow">
            <button
              className="mr-8 text-gray-800 dark:text-white"
              onClick={() => changeTheme()}
            >
              {isDark ? (
                <div>
                  <Image
                    src="/sun.svg"
                    alt="me"
                    width="25"
                    height="25"
                    className="fill-current"
                  />
                </div>
              ) : (
                <div>
                  <Image src="/moon.svg" alt="me" width="25" height="25" />
                </div>
              )}
            </button>
            <button>
              <Link
                href="./resume"
                className="mt-4 mr-8 block cursor-pointer  text-stone-600 hover:text-black dark:text-white lg:mt-0 lg:inline-block"
              >
                채용
              </Link>
            </button>
            <button>
              <Link
                href="/blog"
                className="mt-4 mr-8 block cursor-pointer text-stone-600 hover:text-black dark:text-white lg:mt-0 lg:inline-block"
              >
                블로그
              </Link>
            </button>
            <button>
              <Link
                target="_blank"
                href="https://woo1031.notion.site/Back-to-Back-a43f5fe01a5d46efac38f0c6cc0893c5"
                className="mt-4 mr-8 block cursor-pointer text-stone-600 hover:text-black dark:text-white lg:mt-0 lg:inline-block"
              >
                LOG
              </Link>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="mt-14 flex justify-center border-t-2 border-gray-200 p-6 backdrop-blur-md dark:border-gray-500"></footer>
  );
};

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
