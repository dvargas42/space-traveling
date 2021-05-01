import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import { DateFormat, TimeFormat } from '../../utils/format'
import { ReadingTime } from '../../utils/readingTime'
import { getPrismicClient } from '../../services/prismic'


import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import Comment from '../../components/Comment'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'
import { PreviewButton } from '../../components/PreviewButton'

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  postBefore: {
    uid: string | null;
    title: string | null;
  },
  postAfter: {
    uid: string | null;
    title: string | null;
  },
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <h1 className={styles.loading}>Carregando...</h1>
  }

  return (      
    <>
      <Head>
        <title>Post | SpaceTraveling</title>
      </Head>
      <Header />
      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt="Banner"
      />
      <main className={styles.container}>
        <article className={styles.content}>
          <h1>{post.data.title}</h1>

          <div className={styles.info}>
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
            <span><FiUser />{post.data.author}</span>
            <span><FiClock />{ ReadingTime(post.data.content) } min</span>
          </div>

          {post.last_publication_date && (
             <div className={styles.lastUpdate}>
             * editado em { DateFormat(post.last_publication_date) }, 
             às { TimeFormat(post.last_publication_date)}
           </div>
          )}

         
          
          {post.data.content.map(content => {
            return(
              <div key={ content.heading } className={styles.postContent}>
                <h2>{ content.heading }</h2>
                <div
                  dangerouslySetInnerHTML={
                    { __html: RichText.asHtml(content.body)}} 
                />
              </div>
            )
          })}
        </article>

        <footer className={styles.footContent}>
          <section>
            {post.postBefore ? (
              <Link href={`/post/${post.postBefore?.uid}`}>
                <a >
                  <p>{post.postBefore?.title}</p>  
                  <span>Post anterior</span>
                </a>
              </Link>
            ) :  <a/>}

            {post.postAfter ? (
              <Link href={`/post/${post.postAfter?.uid}`}>
                <a >
                  <p>{post.postAfter?.title}</p>  
                  <span>Próximo Post</span>
                </a>
              </Link>
            ) : <a/>}
          </section>
          <Comment/>
          {preview && <PreviewButton/>}
        </footer>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
    fetch: ['post.uid'],
    pageSize: 2,
    page: 1,
    orderings: '[post.first_publication_date desc]',
    }
  )

  const paths = response.results.map(post => {
    return{
      params: { slug: post.uid }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params
  const { preview = false, previewData } = context
  
  const prismic = getPrismicClient();

  const response = await prismic.getByUID(
    'post', 
    String(slug),
    {
      ref: previewData?.ref ?? null,
    }
  )

  let postBefore = null

  let postAfter = null

  if (response.first_publication_date) {
    const responsePostBefore = await prismic.query([
      Prismic.Predicates.dateBefore(
        'document.first_publication_date',
        response.first_publication_date),
      ], {
        fetch: ['post.uid', 'post.title',],
        pageSize: 1,
        ref: previewData?.ref ?? null,
      }
    )
  
    const responsePostAfter = await prismic.query([
      Prismic.Predicates.dateAfter(
        'document.first_publication_date',
        response.first_publication_date),
      ], {
        fetch: ['post.uid', 'post.title',],
        orderings: '[document.first_publication_date]',
        pageSize: 1,
        ref: previewData?.ref ?? null,
      }
    )
  
    postBefore = responsePostBefore.results[0] ? {
      uid: responsePostBefore.results[0].uid,
      title: responsePostBefore?.results[0].data.title
    } : null;
  
    postAfter = responsePostAfter.results[0] ? {
      uid: responsePostAfter.results[0].uid,
      title: responsePostAfter?.results[0].data.title
    } : null;

  } 
  
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    postBefore,
    postAfter,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return{
          heading: content.heading,
          body: content.body,
        }
      }),
    }
  }
 
  return {
    props: {
      post,
      preview,
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
};
