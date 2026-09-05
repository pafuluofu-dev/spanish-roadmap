/** Старый курс Бебриса «Испанский язык до автоматизма»: ID первых 60 уроков в порядке плейлиста — по уроку на будний день, 12 недель × 5 */
export const BEBRIS_OLD_LIST = 'PLmCjHvvYpNqb8tiywUv0QPlN30dPFW6yq'

export const BEBRIS_OLD_LESSONS: string[] = [
  'ScBdmyCtPuo', 'FlRVlh9jYgI', 'YEghZPs7zQo', 'T5D19f06w3A', '5mMwvnG9udQ', 'y3bQF8uunrg',
  'NPbXjt2DWdg', 'j_4LjXK1mv0', 'VSLQrrebLGw', 'PvSaqrhDFes', 'c2YQvbMwfkk', 'zrRe_qrkISk',
  'fnL0akY92FA', 'HcG5mwiOFEE', '-N_dQv4UrVw', 'wGy9PuLc338', '01Kjex2nDFI', 'UXEO7TYfXwA',
  's2J1aAjT6YA', 'iQRTMWIq0WM', 'b4Zs3zDz368', 'of89Dw4s08o', 'Db3kVTiA3xw', 'aXd1H3s4ZCk',
  'AmEt78WpOtA', 'NpGw3_FJEfs', 'g1GR78TCwEM', 'cVbG9fAm_Rs', 'TlGS-KCIqpg', 'kupGFwopH_g',
  'APkWLCJm48Q', 'OkoCkJ79--c', 'eXNQEpDKK8U', 'Zfju6BcROHM', 'NQdEABaPWUo', 'jp6qJ43Z-V8',
  'ZrWe-Di_TaE', 'Iz4XJyPF488', 'zT8HxujzxWc', 'KKm_78fMbho', 'WD7TOU5EJ-c', 'KbakEjAulgI',
  'Mxs0eCboQFw', 'ERDom3V82I8', 'j8Xhtr300Bg', 'bATHxSD-yIs', 'e9CAIMdQ-90', 'R2kncRTdCeQ',
  '2qe2jCuCOh4', 'zTgU4gqSFa0', 'q-sBTWPJR48', 'PGetS-JNZT0', '_ri9YF24qCY', 'OZPUpKd3LL8',
  '8n7VnvqVNgA', 'WydOrCpjbJo', 'dlVlWL3pvfQ', 'sc7P0O_BUCU', 'ZxlktSqZbmI', 'JKFBtjRu7io',
]

/** Ссылка на урок N (1-based) с подсветкой позиции в плейлисте */
export function bebrisLessonUrl(n: number): string | undefined {
  const id = BEBRIS_OLD_LESSONS[n - 1]
  return id ? `https://www.youtube.com/watch?v=${id}&list=${BEBRIS_OLD_LIST}&index=${n}` : undefined
}
