import { useState } from 'react'
import { GetStaticProps } from 'next'
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import { DateFormat } from '../utils/format'

import Head from 'next/head'
import Link from 'next/link'
import { FiCalendar, FiClock } from 'react-icons/fi'
import { PreviewButton } from '../components/PreviewButton'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps): JSX.Element {
  const [next_page, setNextPage] = useState(postsPagination.next_page)
  const [results, setResults] = useState(postsPagination.results)

  async function handleNextPage(){
    try {
      if (!next_page) {
        throw('No more pages')
      }

      const postsResponse = await fetch(next_page)
      .then(response => response.json())

      const posts: Post[] = postsResponse.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }
        }
      })
      setNextPage(postsResponse.next_page)

      setResults([...results, ...posts])
    } catch (err) {
      alert(err)
    }
  }

  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>

      <main className={styles.homeContainer}>
        <div className={styles.postList}>
          <img src="./images/logo.svg" alt="logo"/>
          {results.map(post => {
            return (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <section>
                    <time><FiCalendar />
                    {
                      DateFormat(!post.first_publication_date 
                        ? Intl.DateTimeFormat(
                            'en-GB',
                            { dateStyle: 'full' }
                          ).format(new Date()) 
                        : post.first_publication_date
                      )
                    }
                    </time>
                    <span><FiClock />{post.data.author}</span>
                  </section>
                </a>
              </Link>
            )
          })}
          {next_page && (
            <button
            type="button"
            onClick={handleNextPage}
            >
              Carregar mais posts
            </button>
          )}
        </div>
        {preview && <PreviewButton/>}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      fetch: [
        'post.title',
        'post.subtitle',
        'post.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: results,
  }

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
};
