import Image from 'next/image';
import Link from 'next/link';
import config from '../../config';
export default function Banner() {
  return (
    <div className="bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:block bg-gray-50 absolute top-0 bottom-0 left-3/4 w-screen" />
        <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="relative lg:row-start-1 lg:col-start-2">
            <svg
              className="hidden lg:block absolute top-0 right-0 -mt-20 -mr-20"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="de316486-4a29-4312-bdfc-fbce2132a2c1"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)"
              />
            </svg>
            <div className="relative text-base mx-auto max-w-prose lg:max-w-none">
              <figure>
                <div className=" aspect-w-16 aspect-h-9 lg:aspect-1">
                  <Image
                    className="rounded-lg shadow-lg object-cover object-center"
                    src={config.homePage.banner.imageURL}
                    alt={config.homePage.banner.imageAlt}
                    layout="fill"
                  />
                </div>
              </figure>
            </div>
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="text-base max-w-prose mx-auto lg:max-w-none">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                {config.homePage.banner.header1}
              </h2>
              <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {config.homePage.banner.header2}
              </h3>
            </div>
            <div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1">
              <p>
                I&apos;m a Computer Science Major at Denison University.
                I&apos;m a Fullstack application engineer/developer, with
                experience in web technologies like{' '}
                <Link href="https://reactjs.org">React</Link>,{' '}
                <Link href="https://reactnative.dev">React Native</Link>,{' '}
                <Link href="https://tailwindcss.com">TailwindCSS</Link>,{' '}
                <Link href="https://nodejs.org">NodeJS</Link>,{' '}
                <Link href="https://www.mongodb.com">MongoDb</Link>,{' '}
                <Link href="https://firebase.google.com">Firebase</Link>,{' '}
                <Link href="https://www.docker.com">Docker</Link>, and{' '}
                <Link href="https://strapi.io">Strapi</Link>.
              </p>
              <p>
                I also have experience with cloud technologies like{' '}
                <Link href="https://cloud.google.com">GCP</Link>&apos;s{' '}
                <Link href="https://firebase.google.com">Firebase</Link>,{' '}
                <Link href="https://cloud.google.com/run">Cloud Run</Link>,{' '}
                <Link href="https://cloud.google.com/sql">Cloud SQL</Link>,{' '}
                <Link href="https://cloud.google.com/storage">
                  Cloud Storage
                </Link>
                , and <Link href="https://aws.amazon.com/">AWS</Link>&apos;s{' '}
                <Link href="https://aws.amazon.com/s3">
                  Simple Storage Service (S3)
                </Link>
                ,{' '}
                <Link href="https://aws.amazon.com/rds">
                  Relational Database Service
                </Link>
                ,{' '}
                <Link href="https://aws.amazon.com/ecs">
                  Elastic Container Service
                </Link>
                , etc. (check out my resume for details).
              </p>
              <p>
                I develop applications that create positive impacts for people
                around me, such as marketplace and chat application for Denison:{' '}
                <Link href="https://deerx.vercel.app">DeerX</Link> using React
                Native and Firebase. I&apos;m currently working for{' '}
                <Link href="https://www.dsw.com/">DSW</Link> as a Cloud
                Application Engineer intern to develop and maintain the
                company&apos;s content service.
              </p>
            </div>
            <div className="mt-5 max-w-2xl mx-auto">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <a href={config.homePage.resumeURL}>Resume</a>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
