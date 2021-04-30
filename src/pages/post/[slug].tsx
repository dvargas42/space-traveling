import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'
import Prismic from '@prismicio/client'


import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import { DateFormat} from '../../utility/dateFormat'
import { ReadingTime } from '../../utility/readingTime'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';


interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps) {
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
            <time><FiCalendar />{DateFormat(post.first_publication_date)}</time>
            <span><FiUser />{post.data.author}</span>
            <span><FiClock />{ ReadingTime(post.data.content) } min</span>
          </div>
          
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
    orderings: '[post.date desc]'
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

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
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
      post
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
};
