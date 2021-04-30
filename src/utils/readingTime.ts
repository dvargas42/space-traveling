import { RichText } from "prismic-dom"

type ContentProps = {
  heading: string;
  body: Record<string, unknown>[];
}[];

export function ReadingTime( content: ContentProps ) {
  const wordsNumber = content.reduce((accum, content) => {
    const headingWords = content.heading.split(' ').length

    const bodyWords =  RichText.asText(content.body).split(' ').length

    return accum + headingWords + bodyWords
  }, 0)

  return Math.ceil(wordsNumber / 200) // 200 words per minute
}