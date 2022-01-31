import Image from 'next/image';
import Link from 'next/link';
import config from '../../config';
import { useEffect, useRef, useState } from 'react';
import { ProjectCard } from '../../types';
import { NextPage } from 'next';

interface Props {
  projectCards: ProjectCard[];
}

const Projects: NextPage<Props> = ({ projectCards }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageWidth, setImageWidth] = useState<number>(0);
  useEffect(() => {
    if (cardRef.current) {
      setImageWidth(cardRef.current.clientWidth);
    }
  }, [cardRef]);

  return (
    <div className="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
      <div className="absolute inset-0">
        <div className="bg-white h-1/3 sm:h-2/3" />
      </div>
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            {config.homePage.projects.title}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {config.homePage.projects.subtitle}
          </p>
        </div>
        <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {projectCards.map((projectCard) => (
            <Link key={projectCard.title} href={projectCard.href}>
              <a>
                <div className="flex flex-col rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="h-48 w-full object-cover" ref={cardRef}>
                      <Image
                        className="h-48 w-full object-cover"
                        src={projectCard.thumbnailURL}
                        height={192}
                        width={imageWidth}
                        alt={projectCard.thumbnailAlt}
                      />
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-gray-900">
                        {projectCard.title}
                      </p>
                      <p className="mt-3 text-base text-gray-500">
                        {projectCard.description}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        <div className="mt-10 max-w-lg mx-auto flex flex-1 justify-center">
          <Link href="/projects">
            <a className="text-xl tracking-tight font-normal text-gray-500 hover:underline">
              Read More
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Projects;
