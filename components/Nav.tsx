import { Fragment } from 'react';
import Image from 'next/image';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import config from '../config';
import Link from 'next/link';

const buttons = config.navBar.buttons;

export default function Nav() {
  return (
    <Disclosure as="div" className="bg-gray-800">
      {({ open }: { open: boolean }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <Link href="/">
                  <a>
                    <div className="flex-shrink-0 flex items-center">
                      <div className="h-8 w-32">
                        <Image
                          className="object-contain"
                          src={config.navBar.logo.url}
                          width={128}
                          height={32}
                          alt={config.navBar.logo.alt}
                        />
                      </div>
                    </div>
                  </a>
                </Link>

                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {buttons.map((item) => (
                      <a
                        key={item.text}
                        href={item.href}
                        className={
                          'text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
                        }
                      >
                        {item.text}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {buttons.map((item) => (
                <Disclosure.Button
                  key={item.text}
                  as="a"
                  href={item.href}
                  className={
                    'text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium'
                  }
                >
                  {item.text}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
