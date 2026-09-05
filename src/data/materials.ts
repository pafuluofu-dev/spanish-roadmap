/** Адреса материалов плана — одно место, на которое ссылаются занятия и список ресурсов */
export const MATERIALS = {
  bebrisOld: 'https://www.youtube.com/playlist?list=PLmCjHvvYpNqb8tiywUv0QPlN30dPFW6yq',
  bebrisNew: 'https://www.youtube.com/playlist?list=PLmCjHvvYpNqauatku7kWn5VQtnKG7FMZy',
  bebrisTrainer: 'https://www.youtube.com/playlist?list=PLmCjHvvYpNqaboCloiSt2eLaJzr00j-XH',
  udemyA1: 'https://www.udemy.com/course/spanish-a1-course-for-russian-speakers-learn-language-online/',
  udemyDialogues: 'https://www.udemy.com/course/800-spanish-dialogues-with-translation-into-russian/',
  udemyKhukalenko: 'https://www.udemy.com/course/sqznhpjb/',
  udemyEightWeeks: 'https://www.udemy.com/course/spanish-a1-8weeks/',
  udemyFromZero: 'https://www.udemy.com/course/spanish-for-russianspeakers-online/',
  anki: 'https://apps.ankiweb.net/',
  quizlet: 'https://quizlet.com/',
} as const

export const LINK_A1 = { label: 'Udemy · A1 для русскоговорящих', url: MATERIALS.udemyA1 }
export const LINK_DIALOGUES = { label: 'Udemy · 800 диалогов', url: MATERIALS.udemyDialogues }
export const LINK_KHUKALENKO = { label: 'Udemy · Julia Khukalenko', url: MATERIALS.udemyKhukalenko }
export const LINK_EIGHT_WEEKS = { label: 'Udemy · A1 за 8 недель', url: MATERIALS.udemyEightWeeks }
export const LINK_FROM_ZERO = { label: 'Udemy · Испанский с нуля, 1,5 ч', url: MATERIALS.udemyFromZero }
