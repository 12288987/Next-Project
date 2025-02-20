import { formatDate } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { PLAYLIST_BY_SLUG_QUERY, STARTUPS_BY_ID_QUERY } from '@/sanity/lib/queries';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import markdownit from 'markdown-it';
import { Skeleton } from '@/components/ui/skeleton';
import View from '@/components/View';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';

export const experimental_ppr = true;

const md = markdownit();

const page = async ({params}: {params: Promise<{id: string}>}) => {
    const id = (await params).id;
    // // The below two fetchs are fetched sequentialy means one after the other it is time consuming
    // // and we only have to use if two fetchs are dependent on one another
    // const post = await client.fetch(STARTUPS_BY_ID_QUERY, {id});

    // const {select: editorposts} = await client.fetch(PLAYLIST_BY_SLUG_QUERY, {slug: 'editors-pick',});

    // The below is parallel fetching which is way faster
    const [post, {select: editorposts}] = await Promise.all([client.fetch(STARTUPS_BY_ID_QUERY, {id}), client.fetch(PLAYLIST_BY_SLUG_QUERY, {slug: 'editors-pick',})])
    // console.log(editorposts);

    if(!post) return notFound();
    const parsedContent = md.render(post?.pitch || '') 
  return (
    <>
      <section className='pink_container !min-h-[230px]'>
        <p className='tag'>{formatDate(post?._createdAt)}</p>
        <h1 className='heading'>{post.title}</h1>
        <p className='sub-heading !max-w-5xl'>{post.description}</p>
      </section>
      <section className='section_container'>
        <img src={post.image} alt="thumbnail" className='w-full h-auto rounded-xl' />
        <div className='space-y-5 mt-10 max-w-4xl mx-auto'>
          <div className='flex-between gap-5'>
            <Link href={`/user/${post.author?._id}`} className='flex gap-2 items-center mb-3'>
              <Image src={post.author.image} className='rounded-full drop-shadow-lg' alt='avatar' width={64} height={64}/>
              <div>
                <p className='text-20-medium'>{post.author.name}</p>
                <p className='text-16-medium !text-black-300'>@{post.author.username}</p>
              </div>
            </Link>
            <p className='category-tag'>{post.category}</p>
          </div>
          <h3 className='text-30-bold'>Pitch Details</h3>
          {parsedContent ? (
            <article className='prose max-w-4xl font-work-sans break-all' dangerouslySetInnerHTML={{__html: parsedContent}}/>
          ): (
            <p className='no-result'>
              No Details Provided
            </p>
          )}
        </div>
        <hr className='divider'/>
        {editorposts?.length > 0 && (
          <div className='max-w-4xl mx-auto'>
            <p className='text-30-semibold'>Editor picks</p>
            <ul className='mt-7 card_grid-sm'>
              {editorposts?.map((post: StartupTypeCard, i: number) => (
                <StartupCard key={i} post={post}/>
              ))}
            </ul>
          </div>
        )}

        <Suspense fallback={<Skeleton className='view_skeleton'/>}>
          <View id={id}/>
        </Suspense>
      </section>
    </>
  )
}

export default page