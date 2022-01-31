import { GetStaticProps, NextComponentType, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ProjectCard } from '../../types';

interface Props {
  projectCards: ProjectCard[];
}

const ProjectList: NextPage<Props> = ({ projectCards }) => {
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
      <div className="relative max-w-7xl mx-auto sm:p-6 lg:p-8">
        <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {projectCards.map((projectCard) => (
            <Link key={projectCard.title} href={projectCard.href}>
              <a>
                <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
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
                      <p className="text-xl font-medium text-indigo-600">
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
      </div>
    </div>
  );
};

export default ProjectList;
