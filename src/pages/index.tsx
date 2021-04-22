import { useState } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiClock } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

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
}

export default function Home({postsPagination}: HomeProps) {
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
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            { locale: ptBR }
            ),
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
                    <time><FiCalendar />{post.first_publication_date}</time>
                    <span><FiClock />{post.data.author}</span>
                  </section>
                </a>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={handleNextPage}
          >
            Carregar mais posts
          </button>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      fetch: [
        'post.title',
        'post.subtitle',
        'post.author'],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
        ),
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
    },
    revalidate: 60 * 60 // 1 hour
  }
};
