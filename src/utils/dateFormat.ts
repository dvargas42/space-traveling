import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'


export function DateFormat(date: string) {
  return format(
    new Date(date),
    'dd MMM yyyy',
    { locale: ptBR }
  )
}