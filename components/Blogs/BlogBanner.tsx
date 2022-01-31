import { NextPage } from 'next';
import Image from 'next/image';
import config from '../../config';

const BlogBanner: NextPage = () => {
  const bannerTitle = config.blogs.banner.title;
  const bannerSubtitle = config.blogs.banner.subtitle;
  const bannerImageURL = config.blogs.banner.imageURL;
  const bannerImageAlt = config.blogs.banner.imageAlt;

  return (
    <div className="relative">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100" />
      <div className="max-w-7xl mx-auto sm:p-6 lg:p-8">
        <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
          <div className="absolute inset-0">
            <Image
              className="object-cover"
              src={bannerImageURL}
              layout="fill"
              alt={bannerImageAlt}
            />
          </div>
          <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
            <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block text-white">{bannerTitle}</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-center text-xl text-white sm:max-w-3xl">
              {bannerSubtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlogBanner;
