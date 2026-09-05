export interface Resource {
  title: string
  /** Пустая строка — ссылки пока нет, владелец добавит */
  url: string
  note: string
}

/** Все ссылки проверены 04.09.2026 открытием страниц; названия курсов — как на Udemy */
export const RESOURCES: Resource[] = [
  {
    title: 'Бебрис «Испанский язык до автоматизма» — полный курс, 151 урок',
    url: 'https://www.youtube.com/playlist?list=PLmCjHvvYpNqb8tiywUv0QPlN30dPFW6yq',
    note: 'главный курс: примерно урок в день, слушать подряд и ничего не пропускать',
  },
  {
    title: 'Бебрис «Испанский язык за 50 уроков» — новый курс, ступени A00 → A2',
    url: 'https://www.youtube.com/playlist?list=PLmCjHvvYpNqauatku7kWn5VQtnKG7FMZy',
    note: 'та же методика, свежая запись; если старый курс пойдёт тяжело — переключиться сюда',
  },
  {
    title: 'Бебрис «Тренажёр» — 25 уроков отработки фраз',
    url: 'https://www.youtube.com/playlist?list=PLmCjHvvYpNqaboCloiSt2eLaJzr00j-XH',
    note: 'для субботних повторов',
  },
  {
    title: 'Udemy «A1 Испанский для начинающих — Spanish A1 for Russian Speakers», Moonika Miidu, 19 ч',
    url: 'https://www.udemy.com/course/spanish-a1-course-for-russian-speakers-learn-language-online/',
    note: 'второй основной курс: закреплять тему дня академичнее',
  },
  {
    title: 'Udemy «Полный курс испанского через 800 диалогов», Lingo Training',
    url: 'https://www.udemy.com/course/800-spanish-dialogues-with-translation-into-russian/',
    note: 'аудирование с недели 3; есть англоязычный близнец «Master Spanish Conversations» — проверьте, какой из двух куплен',
  },
  {
    title: 'Udemy «Испанский для начинающих», Julia Khukalenko, 2 ч',
    url: 'https://www.udemy.com/course/sqznhpjb/',
    note: 'повторение с недели 7 — быстро, останавливаться только на непонятном',
  },
  {
    title: 'Udemy «Испанский с нуля: А1 за 8 недель», Luna Kaplun, 1,5 ч',
    url: 'https://www.udemy.com/course/spanish-a1-8weeks/',
    note: 'дополнительное повторение',
  },
  {
    title: 'Udemy «Испанский для начинающих: учимся говорить с нуля», Aly Nekrushetc, 1,5 ч',
    url: 'https://www.udemy.com/course/spanish-for-russianspeakers-online/',
    note: 'посмотреть один раз после первых недель',
  },
  {
    title: 'Anki',
    url: 'https://apps.ankiweb.net/',
    note: 'карточки выражениями, ~10 новых в день',
  },
  {
    title: 'Quizlet',
    url: 'https://quizlet.com/',
    note: 'если Anki не зашёл',
  },
]
