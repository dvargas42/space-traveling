import Link from 'next/link'

import styles from './styles.module.scss'

export function PreviewButton() {
  return(
    <aside className={styles.container}>
      <Link href="/api/exit-preview">
        <a className={styles.content}>Sair do modo Preview</a>
      </Link>
    </aside>
  )
}