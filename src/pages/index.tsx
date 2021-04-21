import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiClock } from 'react-icons/fi'
import Head from 'next/head';

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

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>

      <main className={styles.homeContainer}>
        <div className={styles.postList}>
          <img src="./images/logo.svg" alt="logo"/>
          <a href="#">
            <h1>Como utilizar Hooks</h1>
            <strong>Pensando em sincronização em vez de ciclos de vida</strong>
            <section>
              <time><FiCalendar />19 Abr 2021</time>
              <p><FiClock />Danilo Vieira</p>
            </section>
          </a>
          <a href="#">
            <h1>Como utilizar Hooks</h1>
            <strong>Pensando em sincronização em vez de ciclos de vida</strong>
            <section>
              <time><FiCalendar />19 Abr 2021</time>
              <p><FiClock />Danilo Vieira</p>
            </section>
          </a>
          <a href="#">
            <h1>Como utilizar Hooks</h1>
            <strong>Pensando em sincronização em vez de ciclos de vida</strong>
            <section>
              <time><FiCalendar />19 Abr 2021</time>
              <p><FiClock />Danilo Vieira</p>
            </section>
          </a>
          <a href="#">
            <h1>Como utilizar Hooks</h1>
            <strong>Pensando em sincronização em vez de ciclos de vida</strong>
            <section>
              <time><FiCalendar />19 Abr 2021</time>
              <p><FiClock />Danilo Vieira</p>
            </section>
          </a>
          <a href="#">
            <h1>Como utilizar Hooks</h1>
            <strong>Pensando em sincronização em vez de ciclos de vida</strong>
            <section>
              <time><FiCalendar />19 Abr 2021</time>
              <p><FiClock />Danilo Vieira</p>
            </section>
          </a>
          <button type="button">Carregar mais posts</button>
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
      fetch: ['post.title', 'post.subtitle'],
      pageSize: 3,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(post.last_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      ),
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author)
      },
    }
  })

  return {
    props: {
      posts
    },
    revalidate: 60 * 60 // 1 hour
  }
};
