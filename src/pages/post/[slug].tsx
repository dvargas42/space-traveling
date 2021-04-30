import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import { DateFormat} from '../../utils/dateFormat'
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
            <time><FiCalendar />{DateFormat(post.first_publication_date)}</time>
            <span><FiUser />{post.data.author}</span>
            <span><FiClock />{ ReadingTime(post.data.content) } min</span>
          </div>

          <div className={styles.lastUpdate}>
            * editado em 19 mar 2021, às 15:49
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

        <footer className={styles.footContent}>
          <section>
            <Link href="/">
              <a >
                <p>Como utilizar Hooks</p>  
                <span>Post anterior</span>
              </a>
            </Link>
            <Link href="/">
              <a>
                <p> Criando um app CRA do Zero</p>
                <span>Próximo Post</span>
                </a>
            </Link>
          </section>
          <Comment/>
          <PreviewButton/>
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
      post,
      preview,
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
};
