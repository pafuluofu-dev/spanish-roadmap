// Задания к субботним тестам и рубежам. Ключ — id проверки (он же id занятия в плане):
// check-01…check-11 для тестов недели, exam-1…exam-3 для рубежей.
// Автопроверки нет: сайт показывает задание, ответ или образец открывается по кнопке,
// балл владелец ставит сам в форму результата. Правило: доля фраз без подсказки и долгих пауз.

export type TestItemKind = 'task' | 'speak'

export interface TestItem {
  /** Номер: '1.1' — тест недели 1, '1.S1' — устная часть, 'E1.1' — рубеж 1 */
  id: string
  /** task — письменно или вслух с точным ответом; speak — сценка или монолог на диктофон, ответ — что должно прозвучать */
  kind: TestItemKind
  /** Короткая тема: 'Глагол ser', 'В ресторане' */
  title: string
  prompt: string
  /** Для task — ответ, для speak — что обязательно должно прозвучать */
  answer: string
}

export interface TestVariant {
  /** Совпадает с Check.id: check-01…check-11, exam-1…exam-3 */
  checkId: string
  items: TestItem[]
}

const BANK: TestVariant[] = [
  // Неделя 1 — звучание и первые фразы
  {
    checkId: 'check-01',
    items: [
      { id: '1.1', kind: 'task', title: 'Приветствия', prompt: 'Перевести: «Привет! Доброе утро. Как дела? Хорошо, спасибо. До свидания».', answer: '¡Hola! Buenos días. ¿Qué tal? (¿Cómo estás?) Bien, gracias. Adiós.' },
      { id: '1.2', kind: 'task', title: 'Знакомство', prompt: 'Перевести: «Как тебя зовут? Меня зовут Хорхе. Очень приятно».', answer: '¿Cómo te llamas? Me llamo Jorge. Mucho gusto (Encantado).' },
      { id: '1.3', kind: 'task', title: 'Откуда ты', prompt: 'Перевести: «Откуда ты? Я из России, из Москвы».', answer: '¿De dónde eres? Soy de Rusia, de Moscú.' },
      { id: '1.4', kind: 'task', title: 'Глагол ser', prompt: 'Проспрягать ser во всех шести лицах.', answer: 'soy, eres, es, somos, sois, son' },
      { id: '1.5', kind: 'task', title: 'ser в предложении', prompt: 'Вставить форму ser: Yo … estudiante. Tú … de España. Nosotros … amigos. Ellos … médicos.', answer: 'soy, eres, somos, son' },
      { id: '1.6', kind: 'task', title: 'Числа словами', prompt: 'Написать словами: 3, 7, 12, 15, 21, 30, 48, 100.', answer: 'tres, siete, doce, quince, veintiuno, treinta, cuarenta y ocho, cien' },
      { id: '1.7', kind: 'task', title: 'Числа цифрами', prompt: 'Записать цифрами: dieciséis, veinticinco, sesenta y tres, noventa y nueve.', answer: '16, 25, 63, 99' },
      { id: '1.8', kind: 'task', title: 'Местоимения', prompt: 'Перевести: я, ты, он, она, мы, вы (несколько человек), они.', answer: 'yo, tú, él, ella, nosotros / nosotras, vosotros / vosotras (вежливо: usted, ustedes), ellos / ellas' },
      { id: '1.9', kind: 'task', title: 'Страны и национальности', prompt: 'Перевести: «Он из Италии — он итальянец. Она из Германии — она немка. Мы из Испании — мы испанцы».', answer: 'Él es de Italia, es italiano. Ella es de Alemania, es alemana. Somos de España, somos españoles.' },
      { id: '1.10', kind: 'task', title: 'Правила чтения', prompt: 'Прочитать вслух, следя за c, g, j, ll, ñ, h, z: cinco, gente, jamón, calle, España, hola, guitarra, zapato.', answer: 'c перед e/i — межзубный [θ] (в Латинской Америке [s]): cinco; g перед e/i — [х]: gente; j — [х]: jamón; ll — [й]: calle; ñ — [нь]: España; h не читается: hola; gu перед i/e — [г]: guitarra; z — [θ] / [s]: zapato' },
      { id: '1.S1', kind: 'speak', title: 'Представиться', prompt: 'Тридцать секунд вслух: имя, откуда, где живёшь, чем занимаешься.', answer: 'Me llamo… Soy de… Vivo en… Soy estudiante / Trabajo en… — четыре факта без остановки' },
      { id: '1.S2', kind: 'speak', title: 'Счёт', prompt: 'Посчитать от 1 до 20 и десятками до 100, не останавливаясь.', answer: 'uno … veinte; diez, veinte, treinta, cuarenta, cincuenta, sesenta, setenta, ochenta, noventa, cien' },
    ],
  },
  // Неделя 2 — ser и estar, простые вопросы
  {
    checkId: 'check-02',
    items: [
      { id: '2.1', kind: 'task', title: 'Глагол estar', prompt: 'Проспрягать estar во всех шести лицах.', answer: 'estoy, estás, está, estamos, estáis, están' },
      { id: '2.2', kind: 'task', title: 'Как дела', prompt: 'Перевести: «Как дела? Я хорошо. Я устал. Я дома».', answer: '¿Cómo estás? Estoy bien. Estoy cansado (cansada). Estoy en casa.' },
      { id: '2.3', kind: 'task', title: 'ser или estar', prompt: 'Выбрать глагол и поставить форму: Madrid … en España. Yo … ruso. Mi madre … profesora. El café … frío. Nosotros … contentos.', answer: 'está, soy, es, está, estamos' },
      { id: '2.4', kind: 'task', title: 'Правило ser / estar', prompt: 'Одной фразой: когда ser, а когда estar? По примеру на каждый.', answer: 'ser — кто или что это, откуда, профессия, постоянный признак: Soy médico, es de Chile; estar — где находится и временное состояние: Estoy en Madrid, estoy cansado' },
      { id: '2.5', kind: 'task', title: 'Вопросительные слова', prompt: 'Перевести: что, кто, где, как, сколько (о людях), почему.', answer: 'qué, quién, dónde, cómo, cuántos, por qué' },
      { id: '2.6', kind: 'task', title: 'Задать вопрос', prompt: 'К каждому ответу задать вопрос: — Soy de México. — Vivo en Madrid. — Tengo dos hermanos. — Me llamo Ana.', answer: '¿De dónde eres? ¿Dónde vives? ¿Cuántos hermanos tienes? ¿Cómo te llamas?' },
      { id: '2.7', kind: 'task', title: 'Предметы вокруг', prompt: 'Назвать с артиклем: стол, стул, книга, окно, дверь, телефон, дом, город.', answer: 'la mesa, la silla, el libro, la ventana, la puerta, el teléfono, la casa, la ciudad' },
      { id: '2.8', kind: 'task', title: 'Люди и места', prompt: 'Назвать с артиклем: друг, подруга, учитель, врач, улица, магазин, школа, работа.', answer: 'el amigo, la amiga, el profesor (la profesora), el médico (la médica), la calle, la tienda, la escuela, el trabajo' },
      { id: '2.9', kind: 'task', title: 'Где что', prompt: 'Перевести: «Где книга? Книга на столе. Где Мария? Она в школе».', answer: '¿Dónde está el libro? El libro está en la mesa. ¿Dónde está María? Está en la escuela.' },
      { id: '2.10', kind: 'task', title: 'Диалог знакомства', prompt: 'Сказать по-испански: — Привет, как тебя зовут? — Меня зовут Пабло, а тебя? — Я Лаура. Откуда ты? — Я из Аргентины. А ты? — Я из России. — Очень приятно. — Мне тоже.', answer: '— Hola, ¿cómo te llamas? — Me llamo Pablo, ¿y tú? — Yo soy Laura. ¿De dónde eres? — Soy de Argentina. ¿Y tú? — Soy de Rusia. — Mucho gusto. — Igualmente.' },
      { id: '2.S1', kind: 'speak', title: 'Пять вопросов собеседнику', prompt: 'Спросить имя, откуда, где живёт, как дела, сколько лет — и ответить за него.', answer: '¿Cómo te llamas? ¿De dónde eres? ¿Dónde vives? ¿Cómo estás? ¿Cuántos años tienes? — и пять ответов полными фразами' },
      { id: '2.S2', kind: 'speak', title: 'Тридцать слов', prompt: 'За две минуты назвать не меньше тридцати существительных с артиклем: предметы, люди, места. Без списка.', answer: 'Тридцать разных слов; повторы и слова без артикля не считаются' },
    ],
  },
  // Неделя 3 — настоящее время правильных глаголов
  {
    checkId: 'check-03',
    items: [
      { id: '3.1', kind: 'task', title: 'Глаголы на -ar', prompt: 'Проспрягать hablar.', answer: 'hablo, hablas, habla, hablamos, habláis, hablan' },
      { id: '3.2', kind: 'task', title: 'Глаголы на -er', prompt: 'Проспрягать comer.', answer: 'como, comes, come, comemos, coméis, comen' },
      { id: '3.3', kind: 'task', title: 'Глаголы на -ir', prompt: 'Проспрягать vivir.', answer: 'vivo, vives, vive, vivimos, vivís, viven' },
      { id: '3.4', kind: 'task', title: 'Глагол tener', prompt: 'Проспрягать tener.', answer: 'tengo, tienes, tiene, tenemos, tenéis, tienen' },
      { id: '3.5', kind: 'task', title: 'Глагол querer', prompt: 'Проспрягать querer.', answer: 'quiero, quieres, quiere, queremos, queréis, quieren' },
      { id: '3.6', kind: 'task', title: 'О себе в настоящем', prompt: 'Перевести: «Я говорю по-русски и учу испанский. Я живу в Москве и работаю в офисе. Я ем дома».', answer: 'Hablo ruso y aprendo (estudio) español. Vivo en Moscú y trabajo en una oficina. Como en casa.' },
      { id: '3.7', kind: 'task', title: 'Пять вопросов', prompt: 'Перевести: «Где ты работаешь? Что ты ешь на завтрак? Ты говоришь по-английски? Сколько у тебя братьев? Что ты хочешь?»', answer: '¿Dónde trabajas? ¿Qué desayunas? ¿Hablas inglés? ¿Cuántos hermanos tienes? ¿Qué quieres?' },
      { id: '3.8', kind: 'task', title: 'Отрицание', prompt: 'Ответить «нет» полной фразой: ¿Hablas francés? ¿Vives en Madrid? ¿Tienes coche? ¿Quieres café?', answer: 'No, no hablo francés. No, no vivo en Madrid. No, no tengo coche. No, no quiero café.' },
      { id: '3.9', kind: 'task', title: 'Определённый артикль', prompt: 'Вставить el / la / los / las: … casa, … libro, … amigos, … ciudades, … problema, … mano.', answer: 'la casa, el libro, los amigos, las ciudades, el problema, la mano' },
      { id: '3.10', kind: 'task', title: 'Неопределённый артикль', prompt: 'Вставить un / una: … mesa, … coche, … día, … foto.', answer: 'una mesa, un coche, un día, una foto' },
      { id: '3.11', kind: 'task', title: 'Род и число', prompt: 'Назвать род и множественное число: ciudad, profesor, universidad, hombre, mujer.', answer: 'la ciudad — las ciudades; el profesor — los profesores; la universidad — las universidades; el hombre — los hombres; la mujer — las mujeres' },
      { id: '3.S1', kind: 'speak', title: 'Диалог на слух', prompt: 'Новый диалог из «800 диалогов» без текста: кто говорит и о чём — понять со второго прослушивания, потом открыть текст и повторить вслух.', answer: 'Тема и участники названы верно после второго прослушивания' },
      { id: '3.S2', kind: 'speak', title: 'Пять глаголов вслух', prompt: 'hablar, comer, vivir, tener, querer — по всем лицам подряд, без подглядывания и пауз.', answer: 'Тридцать форм без ошибок в ударении: habláis, coméis, vivís, tenéis, queréis' },
    ],
  },
  // Неделя 4 — рубеж 1: фундамент
  {
    checkId: 'exam-1',
    items: [
      { id: 'E1.1', kind: 'task', title: 'Предлоги a, de, en', prompt: 'Вставить предлог: Voy … Madrid. Soy … Rusia. Vivo … una casa pequeña. El libro … Ana. Trabajo … una tienda.', answer: 'a, de, en, de, en' },
      { id: 'E1.2', kind: 'task', title: 'Множественное число', prompt: 'Поставить во множественное число с артиклем: el libro, la ciudad, el profesor, la casa, el lápiz, el país.', answer: 'los libros, las ciudades, los profesores, las casas, los lápices, los países' },
      { id: 'E1.3', kind: 'task', title: 'Согласование', prompt: 'Перевести: красный дом, красные дома; хорошая подруга, хорошие подруги; большой город, большие города.', answer: 'la casa roja, las casas rojas; la buena amiga, las buenas amigas; la ciudad grande, las ciudades grandes' },
      { id: 'E1.4', kind: 'task', title: 'Десять предложений', prompt: 'По схеме «кто + глагол + что» составить по предложению с hablar, comer, vivir, tener, querer, trabajar, estudiar, beber, leer, escribir — каждое в новом лице.', answer: 'Например: Yo hablo español. Ella come pan. Nosotros vivimos en Moscú. Tú tienes un coche. Ellos quieren café… Считается: глагол в нужном лице, дополнение на месте' },
      { id: 'E1.5', kind: 'task', title: 'Перевод', prompt: 'Перевести: «У меня есть брат и сестра. Мой брат живёт в Барселоне, он работает в банке. Я хочу поехать в Испанию».', answer: 'Tengo un hermano y una hermana. Mi hermano vive en Barcelona, trabaja en un banco. Quiero ir a España.' },
      { id: 'E1.6', kind: 'task', title: 'Вопрос и ответ', prompt: 'Задать вопрос и ответить: где живёт твой друг; что он ест; работает он или учится.', answer: '¿Dónde vive tu amigo? — Vive en… ¿Qué come? — Come… ¿Trabaja o estudia? — Trabaja / Estudia' },
      { id: 'E1.7', kind: 'task', title: 'ser, estar, tener', prompt: 'Вставить нужный глагол в нужной форме: Yo … 25 años. Mi hermana … en casa. Madrid … una ciudad grande. Nosotros … cansados. Ellos … dos gatos.', answer: 'tengo, está, es, estamos, tienen' },
      { id: 'E1.8', kind: 'task', title: 'Числа в речи', prompt: 'Перевести: «Мне 32 года. Мне нужно 15 минут. У меня три книги и одиннадцать ручек».', answer: 'Tengo treinta y dos años. Necesito quince minutos. Tengo tres libros y once bolígrafos.' },
      { id: 'E1.S1', kind: 'speak', title: 'Часть 1 · о себе', prompt: 'Три минуты на диктофон: кто, откуда, где живёшь, семья, работа или учёба, что делаешь каждый день. Десять минут подготовки — без записи текста.', answer: 'Не меньше двенадцати фраз; ser, estar, tener в правильных лицах; глаголы всех трёх спряжений' },
      { id: 'E1.S2', kind: 'speak', title: 'Часть 2 · пять вопросов', prompt: 'Записать вопросы заранее с паузами и ответить, не останавливая запись: ¿Cómo te llamas? ¿De dónde eres? ¿Dónde vives? ¿Qué haces? ¿Tienes hermanos?', answer: 'Пять ответов полными предложениями, пауза не дольше трёх секунд' },
      { id: 'E1.S3', kind: 'speak', title: 'Часть 3 · чтение', prompt: 'Прочитать вслух свой рассказ о себе, следя за ударениями и чтением c, g, j, ll, ñ, h.', answer: 'j и g перед e/i — [х], ll — [й], h немая, ударение по правилам' },
    ],
  },
  // Неделя 5 — семья, работа, дом
  {
    checkId: 'check-05',
    items: [
      { id: '5.1', kind: 'task', title: 'Семья', prompt: 'Назвать с артиклем: мать, отец, родители, брат, сестра, сын, дочь, дедушка, бабушка, муж, жена.', answer: 'la madre, el padre, los padres, el hermano, la hermana, el hijo, la hija, el abuelo, la abuela, el marido (el esposo), la mujer (la esposa)' },
      { id: '5.2', kind: 'task', title: 'Притяжательные', prompt: 'Вставить: (мой) … padre, (твоя) … madre, (его) … hermanos, (наша) … casa, (их) … hijos.', answer: 'mi padre, tu madre, sus hermanos, nuestra casa, sus hijos' },
      { id: '5.3', kind: 'task', title: 'Профессии', prompt: 'Назвать в мужском и женском роде: врач, учитель, инженер, программист, продавец, повар, студент.', answer: 'el médico / la médica, el profesor / la profesora, el ingeniero / la ingeniera, el programador / la programadora, el vendedor / la vendedora, el cocinero / la cocinera, el estudiante / la estudiante' },
      { id: '5.4', kind: 'task', title: 'Глагол hacer', prompt: 'Проспрягать hacer и ответить на ¿Qué haces?', answer: 'hago, haces, hace, hacemos, hacéis, hacen. Trabajo en… / Estudio… / Soy…' },
      { id: '5.5', kind: 'task', title: 'Дом', prompt: 'Назвать с артиклем: кухня, спальня, ванная, гостиная, окно, стол, кровать, шкаф.', answer: 'la cocina, el dormitorio (la habitación), el baño, el salón (la sala), la ventana, la mesa, la cama, el armario' },
      { id: '5.6', kind: 'task', title: 'Указательные', prompt: 'Перевести: этот дом, эта комната, тот стол (рядом с тобой), та книга (далеко от обоих), эти стулья.', answer: 'esta casa, esta habitación, esa mesa, aquel libro, estas sillas' },
      { id: '5.7', kind: 'task', title: 'gustar', prompt: 'Перевести: «Мне нравится кофе. Мне нравятся книги. Мне не нравится вставать рано. Тебе нравится музыка? Ему нравится готовить».', answer: 'Me gusta el café. Me gustan los libros. No me gusta levantarme temprano. ¿Te gusta la música? Le gusta cocinar.' },
      { id: '5.8', kind: 'task', title: 'gusta или gustan', prompt: 'Вставить: Me … el chocolate. Me … los perros. ¿Te … viajar? Nos … las películas.', answer: 'gusta, gustan, gusta, gustan' },
      { id: '5.9', kind: 'task', title: 'Описание человека', prompt: 'Перевести: «Моя сестра высокая и худая. У неё длинные тёмные волосы и зелёные глаза. Она весёлая и умная».', answer: 'Mi hermana es alta y delgada. Tiene el pelo largo y oscuro y los ojos verdes. Es alegre y lista (inteligente).' },
      { id: '5.10', kind: 'task', title: 'Согласование прилагательных', prompt: 'Поставить в нужную форму: mi madre (simpático), mis hermanos (alto), la casa (grande), los coches (rojo), las chicas (inteligente).', answer: 'simpática, altos, grande, rojos, inteligentes' },
      { id: '5.S1', kind: 'speak', title: 'Моя семья', prompt: 'Две минуты на диктофон: кто есть в семье, сколько лет, чем занимаются, какие они.', answer: 'Не меньше восьми фраз; притяжательные, профессии, прилагательные согласованы по роду' },
      { id: '5.S2', kind: 'speak', title: 'Десять фраз с gustar', prompt: 'Подряд, о себе: пять с gusta, пять с gustan, хотя бы две с отрицанием.', answer: 'me gusta + единственное число или инфинитив, me gustan + множественное число; no me gusta…' },
    ],
  },
  // Неделя 6 — еда, время, повседневность
  {
    checkId: 'check-06',
    items: [
      { id: '6.1', kind: 'task', title: 'В ресторане', prompt: 'Сказать по-испански: «Добрый вечер. Столик на двоих, пожалуйста. Меню, пожалуйста. Мне салат и рыбу. Воду без газа. Счёт, пожалуйста».', answer: 'Buenas noches. Una mesa para dos, por favor. La carta, por favor. Para mí, una ensalada y pescado. Agua sin gas. La cuenta, por favor.' },
      { id: '6.2', kind: 'task', title: 'Глагол poder', prompt: 'Проспрягать poder; перевести: «Можно мне счёт? Ты можешь мне помочь?»', answer: 'puedo, puedes, puede, podemos, podéis, pueden. ¿Me trae la cuenta, por favor? (¿Puedo pedir la cuenta?) ¿Puedes ayudarme?' },
      { id: '6.3', kind: 'task', title: 'Цены', prompt: 'Перевести: «Сколько стоит? Сколько стоят яблоки? Это дорого. Это дёшево. Стоит 12 евро 50 центов».', answer: '¿Cuánto cuesta? (¿Cuánto es?) ¿Cuánto cuestan las manzanas? Es caro. Es barato. Cuesta doce euros con cincuenta.' },
      { id: '6.4', kind: 'task', title: 'Числа до 1000', prompt: 'Написать словами: 150, 215, 340, 500, 777, 999, 1000.', answer: 'ciento cincuenta, doscientos quince, trescientos cuarenta, quinientos, setecientos setenta y siete, novecientos noventa y nueve, mil' },
      { id: '6.5', kind: 'task', title: 'Который час', prompt: 'Ответить на ¿Qué hora es?: 8:00, 9:15, 10:30, 12:45, 13:00, 21:10.', answer: 'Son las ocho. Son las nueve y cuarto. Son las diez y media. Es la una menos cuarto. Es la una (de la tarde). Son las nueve y diez (de la noche).' },
      { id: '6.6', kind: 'task', title: 'Дни недели', prompt: 'Назвать дни недели; перевести: «В понедельник я работаю. По субботам я отдыхаю. Сегодня среда».', answer: 'lunes, martes, miércoles, jueves, viernes, sábado, domingo. El lunes trabajo. Los sábados descanso. Hoy es miércoles.' },
      { id: '6.7', kind: 'task', title: 'Возвратные глаголы', prompt: 'Проспрягать levantarse; перевести: «Я встаю в семь, принимаю душ и одеваюсь».', answer: 'me levanto, te levantas, se levanta, nos levantamos, os levantáis, se levantan. Me levanto a las siete, me ducho y me visto.' },
      { id: '6.8', kind: 'task', title: 'Мой день', prompt: 'Перевести: «Я завтракаю в восемь, работаю с девяти до шести, обедаю в два, ужинаю в девять и ложусь в двенадцать».', answer: 'Desayuno a las ocho, trabajo de nueve a seis, como a las dos, ceno a las nueve y me acuesto a las doce.' },
      { id: '6.9', kind: 'task', title: 'ir и venir', prompt: 'Проспрягать ir и venir.', answer: 'voy, vas, va, vamos, vais, van; vengo, vienes, viene, venimos, venís, vienen' },
      { id: '6.10', kind: 'task', title: 'Планы: ir a', prompt: 'Перевести: «Завтра я пойду в кино. В субботу мы поедем в Толедо. Ты придёшь ко мне?»', answer: 'Mañana voy a ir al cine. El sábado vamos a ir a Toledo. ¿Vienes a mi casa?' },
      { id: '6.S1', kind: 'speak', title: 'Сценка в ресторане', prompt: 'Одна минута без подготовки: поздороваться, заказать, попросить счёт.', answer: 'Обязательно: por favor, quiero / para mí, la cuenta' },
      { id: '6.S2', kind: 'speak', title: 'День по часам', prompt: 'Полторы минуты: восемь действий со временем, не меньше трёх возвратных глаголов.', answer: 'a las…; me levanto, me ducho, me acuesto' },
    ],
  },
  // Неделя 7 — закрепление, первый круг
  {
    checkId: 'check-07',
    items: [
      { id: '7.1', kind: 'task', title: 'Десять вопросов о себе', prompt: 'Ответить полным предложением: ¿Cómo te llamas? ¿De dónde eres? ¿Dónde vives? ¿Cuántos años tienes? ¿Qué haces? ¿A qué hora te levantas? ¿Qué te gusta hacer? ¿Tienes hermanos? ¿Qué desayunas? ¿Adónde vas los fines de semana?', answer: 'Me llamo… Soy de… Vivo en… Tengo … años. Trabajo en… / Estudio… Me levanto a las… Me gusta… Tengo … hermanos / No tengo hermanos. Desayuno… Voy a…' },
      { id: '7.2', kind: 'task', title: 'Пять главных глаголов', prompt: 'Вставить форму: ¿Qué … (hacer, tú) hoy? Yo … (ir) al trabajo. Mi madre … (estar) en casa. Nosotros … (tener) mucho trabajo. Ellos … (ser) de Chile.', answer: 'haces, voy, está, tenemos, son' },
      { id: '7.3', kind: 'task', title: 'gustar с местоимениями', prompt: 'Перевести: «Нам нравится путешествовать. Им нравятся фильмы. Вам (usted) нравится город?»', answer: 'Nos gusta viajar. Les gustan las películas. ¿Le gusta la ciudad?' },
      { id: '7.4', kind: 'task', title: 'Возвратные в третьем лице', prompt: 'Перевести: «Мой брат встаёт в шесть. Мои родители ложатся рано. Мы принимаем душ утром».', answer: 'Mi hermano se levanta a las seis. Mis padres se acuestan temprano. Nos duchamos por la mañana.' },
      { id: '7.5', kind: 'task', title: 'Диалог о выходных', prompt: 'Сказать по-испански: — Что ты делаешь в выходные? — Хожу в спортзал и смотрю фильмы. А ты? — Гуляю с собакой.', answer: '— ¿Qué haces los fines de semana? — Voy al gimnasio y veo películas. ¿Y tú? — Paseo al perro.' },
      { id: '7.6', kind: 'task', title: 'Три диалога на слух', prompt: 'Три диалога «800» подряд без текста; после каждого — две фразы по-русски, о чём он, и две по-испански.', answer: 'Тема угадана во всех трёх; фразы по-испански без остановки на подбор слова' },
      { id: '7.7', kind: 'task', title: 'Карточки Anki', prompt: 'Из карточек за шесть недель выбрать десять самых нужных и назвать перевод без подглядывания.', answer: 'Десять из десяти' },
      { id: '7.S1', kind: 'speak', title: 'Десять ответов без пауз', prompt: 'Ответить на десять вопросов из задания 7.1 подряд на диктофон.', answer: 'Пауза не дольше трёх секунд; больше трёх таких пауз — не сдано' },
      { id: '7.S2', kind: 'speak', title: 'Те же вопросы — самому', prompt: 'Задать все десять вопросов вслух, как собеседнику.', answer: 'Порядок слов и вопросительная интонация — голос вверх в конце' },
    ],
  },
  // Неделя 8 — рубеж 2: быт
  {
    checkId: 'exam-2',
    items: [
      { id: 'E2.1', kind: 'task', title: 'Погода', prompt: 'Перевести: «Какая сегодня погода? Тепло и солнечно. Идёт дождь. Холодно, идёт снег. Ветрено».', answer: '¿Qué tiempo hace hoy? Hace calor y hace sol. Llueve. Hace frío y nieva. Hace viento.' },
      { id: 'E2.2', kind: 'task', title: 'Месяцы и времена года', prompt: 'Назвать месяцы; перевести: «Мой день рождения в марте. Летом жарко. Зимой я не выхожу из дома».', answer: 'enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre. Mi cumpleaños es en marzo. En verano hace calor. En invierno no salgo de casa.' },
      { id: 'E2.3', kind: 'task', title: 'Спросить дорогу', prompt: 'Сказать по-испански (на «вы»): «Извините, где вокзал? — Идите прямо, потом направо. — Это далеко? — Нет, пять минут пешком. — Спасибо».', answer: 'Perdone, ¿dónde está la estación? — Siga todo recto y luego gire a la derecha. — ¿Está lejos? — No, está a cinco minutos a pie. — Gracias.' },
      { id: 'E2.4', kind: 'task', title: 'Направления', prompt: 'Перевести: слева, справа, прямо, рядом с, напротив, на углу, далеко, близко.', answer: 'a la izquierda, a la derecha, todo recto, al lado de, enfrente de, en la esquina, lejos, cerca' },
      { id: 'E2.5', kind: 'task', title: 'Купить билет', prompt: 'Перевести: «Один билет до Севильи на завтра, пожалуйста. Во сколько отправляется поезд? Сколько стоит? Туда и обратно».', answer: 'Un billete para Sevilla para mañana, por favor. ¿A qué hora sale el tren? ¿Cuánto cuesta? Ida y vuelta.' },
      { id: 'E2.6', kind: 'task', title: 'Договориться о встрече', prompt: 'Перевести: «Встретимся в пятницу в семь у метро? — Извини, в пятницу не могу. Лучше в субботу в пять».', answer: '¿Quedamos el viernes a las siete en el metro? — Lo siento, el viernes no puedo. Mejor el sábado a las cinco.' },
      { id: 'E2.7', kind: 'task', title: 'Неправильные глаголы', prompt: 'Вставить форму: ¿Adónde … (ir, tú)? Yo … (venir) del trabajo. ¿… (poder, usted) repetir? Mi amigo … (hacer) deporte. Nosotros … (querer) un café.', answer: 'vas, vengo, puede, hace, queremos' },
      { id: 'E2.8', kind: 'task', title: 'В магазине', prompt: 'Перевести: «Сколько стоит эта рубашка? — 35 евро. — Есть размер побольше? Я её беру. Можно картой?»', answer: '¿Cuánto cuesta esta camisa? — Treinta y cinco euros. — ¿Tiene una talla más grande? Me la llevo. ¿Puedo pagar con tarjeta?' },
      { id: 'E2.S1', kind: 'speak', title: 'Сценка 1 · ресторан', prompt: 'Одна минута на диктофон: заказать еду и попросить счёт.', answer: 'por favor, quiero / para mí, la cuenta' },
      { id: 'E2.S2', kind: 'speak', title: 'Сценка 2 · цена и дорога', prompt: 'Одна минута: спросить цену, спросить дорогу и «понять» ответ, повторив его.', answer: '¿Cuánto cuesta…? ¿Dónde está…? todo recto, a la derecha, a la izquierda' },
      { id: 'E2.S3', kind: 'speak', title: 'Сценка 3 · мой день', prompt: 'Полторы минуты: день по часам, восемь действий.', answer: 'a las…; возвратные глаголы; ir и venir' },
      { id: 'E2.S4', kind: 'speak', title: 'Сценка 4 · погода и планы', prompt: 'Одна минута: погода сегодня и планы на выходные.', answer: 'hace…; voy a + инфинитив; день недели или месяц' },
    ],
  },
  // Неделя 9 — слух
  {
    checkId: 'check-09',
    items: [
      { id: '9.1', kind: 'task', title: 'Новый диалог', prompt: 'Диалог из «800», которого ещё не слушал, один раз без текста: кто говорит, где, о чём — три ответа по-русски.', answer: 'Три из трёх; потом открыть текст и сверить' },
      { id: '9.2', kind: 'task', title: 'Вопросы к диалогу', prompt: 'Ответить по-испански: ¿Quiénes hablan? ¿Dónde están? ¿Qué quieren?', answer: 'Три полные фразы; ошибка в окончании — полбалла, ошибка в смысле — ноль' },
      { id: '9.3', kind: 'task', title: 'Понятое и непонятое', prompt: 'Выписать восемь слов или выражений, которые понял на слух, и три, которые не понял; непонятные — в Anki.', answer: 'Восемь понятых выписаны верно' },
      { id: '9.4', kind: 'task', title: 'Догадка из контекста', prompt: 'Три незнакомых слова из диалога: объяснить значение из контекста, потом проверить по тексту.', answer: 'Два из трёх угаданы' },
      { id: '9.5', kind: 'task', title: 'История A1', prompt: 'Короткая история уровня A1 с аудио: пересказать тремя фразами по-испански.', answer: 'Три фразы в настоящем времени: кто, что делает, чем кончается' },
      { id: '9.6', kind: 'task', title: 'ir a + инфинитив', prompt: 'Перевести: «Завтра я буду учиться. В выходные мы поедем к бабушке. Что ты будешь делать вечером?»', answer: 'Mañana voy a estudiar. El fin de semana vamos a ir a casa de mi abuela. ¿Qué vas a hacer esta noche?' },
      { id: '9.7', kind: 'task', title: 'Обычно и потом', prompt: 'Рассказать, что обычно делаешь по вечерам (настоящее время), и что будешь делать завтра (ir a).', answer: 'normalmente + настоящее время; voy a + инфинитив не меньше трёх раз' },
      { id: '9.S1', kind: 'speak', title: 'Видео без субтитров', prompt: 'Десять минут видео для начинающих без субтитров: пять фактов по-русски и три фразы, повторённые за говорящим.', answer: 'Пять фактов; три фразы с интонацией говорящего' },
      { id: '9.S2', kind: 'speak', title: 'Повтор за диктором', prompt: 'Три реплики диалога повторить с интонацией диктора, записать и сравнить.', answer: 'Ударения и подъём голоса в вопросе совпадают с оригиналом' },
    ],
  },
  // Неделя 10 — настоящий испанский
  {
    checkId: 'check-10',
    items: [
      { id: '10.1', kind: 'task', title: 'Пересказ без подготовки', prompt: 'Новая история A1: прочитать один раз и пересказать своими словами за минуту.', answer: 'Названы герой, место, что происходит и чем кончается' },
      { id: '10.2', kind: 'task', title: 'Пересказ после аудио', prompt: 'Ту же историю прослушать и пересказать ещё раз — длиннее и точнее.', answer: 'Не меньше восьми фраз' },
      { id: '10.3', kind: 'task', title: 'Вопросы по истории', prompt: 'Ответить: ¿Quién es el protagonista? ¿Dónde vive? ¿Qué hace? ¿Qué le gusta? ¿Qué va a hacer?', answer: 'Пять ответов полными фразами' },
      { id: '10.4', kind: 'task', title: 'Описание комнаты', prompt: 'Описать свою комнату: шесть предметов, где что стоит — через hay и estar.', answer: 'Hay una mesa. La mesa está al lado de la ventana… — hay не меньше трёх раз, está не меньше трёх' },
      { id: '10.5', kind: 'task', title: 'Описание картинки', prompt: 'Любая фотография с людьми: кто, что делает, во что одет, какая погода — одна минута.', answer: 'Настоящее время: come, habla, lleva…; hace sol / hace frío' },
      { id: '10.6', kind: 'task', title: 'Описание друга', prompt: 'Внешность, характер, что любит, чем занимается — восемь фраз.', answer: 'es alto…, tiene el pelo…, le gusta…, trabaja / estudia' },
      { id: '10.7', kind: 'task', title: 'Выражения', prompt: 'Перевести: мне всё равно; конечно; ничего страшного; не знаю; до скорого; извините; я согласен; что случилось?', answer: 'me da igual; claro (por supuesto); no pasa nada; no sé; hasta luego (hasta pronto); perdón (lo siento); estoy de acuerdo; ¿qué pasa?' },
      { id: '10.S1', kind: 'speak', title: 'Три диалога с интонацией', prompt: 'Три диалога «800» подряд: повторить реплики с интонацией говорящего, записать.', answer: 'Вопрос — голос вверх; ударения как у диктора' },
      { id: '10.S2', kind: 'speak', title: 'Пересказ на диктофон', prompt: 'Полторы минуты пересказа истории без опоры на текст.', answer: 'Не больше двух остановок' },
    ],
  },
  // Неделя 11 — что я умею сказать
  {
    checkId: 'check-11',
    items: [
      { id: '11.1', kind: 'task', title: 'О себе', prompt: 'Кто я, откуда, сколько лет, где живу, кем работаю — тридцать секунд без опоры.', answer: 'Пять фактов: me llamo, soy de, tengo … años, vivo en, trabajo / estudio' },
      { id: '11.2', kind: 'task', title: 'Мой день', prompt: 'Обычный день по часам — сорок пять секунд.', answer: 'Шесть действий с a las…' },
      { id: '11.3', kind: 'task', title: 'Что люблю', prompt: 'Что люблю и что не люблю: шесть фраз с gustar.', answer: 'gusta / gustan согласованы; хотя бы одно no me gusta' },
      { id: '11.4', kind: 'task', title: 'Заказать еду', prompt: 'Заказать еду и попросить счёт.', answer: 'quiero / para mí, la cuenta, por favor' },
      { id: '11.5', kind: 'task', title: 'Спросить цену', prompt: 'Спросить цену и понять ответ с числом до 1000 (пусть его назовёт кто-то или запись).', answer: '¿Cuánto cuesta?; число понято: ciento veinte — 120' },
      { id: '11.6', kind: 'task', title: 'Спросить дорогу', prompt: 'Спросить дорогу и понять объяснение.', answer: '¿Dónde está…?; понято: todo recto, a la derecha, a la izquierda' },
      { id: '11.7', kind: 'task', title: 'Купить билет', prompt: 'Билет: куда, когда, сколько стоит.', answer: 'un billete para…, para el (день)…, ¿cuánto cuesta?' },
      { id: '11.8', kind: 'task', title: 'Не знаю слова', prompt: 'Объяснить, что нужно, не зная слова: например, «штопор» или «зарядка для телефона».', answer: 'Necesito una cosa para…; ¿Cómo se dice…?' },
      { id: '11.9', kind: 'task', title: 'Семья', prompt: 'Рассказать о семье: кто есть, сколько лет, чем занимаются.', answer: 'Не меньше четырёх человек, по два факта о каждом' },
      { id: '11.10', kind: 'task', title: 'Перенести встречу', prompt: 'Договориться о времени встречи и перенести её.', answer: '¿Quedamos…?; no puedo; mejor…' },
      { id: '11.11', kind: 'task', title: 'Простые разговоры', prompt: 'Ответить развёрнуто и задать вопрос в ответ: ¿Qué haces hoy? ¿Qué te gusta hacer? ¿De dónde eres?', answer: 'Два-три предложения на каждый вопрос и ¿y tú? в конце' },
      { id: '11.12', kind: 'task', title: 'Переспросить', prompt: 'Не понял с первого раза: три способа переспросить.', answer: '¿Puedes repetir, por favor? ¿Cómo? (¿Perdón?) Más despacio, por favor. No entiendo.' },
      { id: '11.S1', kind: 'speak', title: 'Пять сценок вслепую', prompt: 'Выбрать пять заданий из списка выше случайно (кубик или бумажки) и сыграть подряд на диктофон.', answer: 'В каждой сказано главное; остановка не дольше пяти секунд' },
      { id: '11.S2', kind: 'speak', title: 'Чек-лист', prompt: 'Пройти раздел «Умею сказать» и отметить каждый пункт: свободно, с подсказкой, не могу.', answer: 'Слабые пункты — в план недели 12' },
    ],
  },
  // Неделя 12 — рубеж 3: итог A1
  {
    checkId: 'exam-3',
    items: [
      { id: 'E3.1', kind: 'task', title: 'ser или estar', prompt: 'Вставить форму: Mi padre … médico. La cocina … limpia. Nosotros … en Madrid. ¿Cómo … (tú)? Hoy … lunes.', answer: 'es, está, estamos, estás, es' },
      { id: 'E3.2', kind: 'task', title: 'Настоящее время', prompt: 'Поставить в нужное лицо: (yo) hacer, (tú) ir, (él) tener, (nosotros) poder, (vosotros) querer, (ellos) venir, (yo) salir, (ella) levantarse.', answer: 'hago, vas, tiene, podemos, queréis, vienen, salgo, se levanta' },
      { id: 'E3.3', kind: 'task', title: 'gustar', prompt: 'Перевести: «Мне нравится испанский. Моей сестре нравятся сериалы. Нам не нравится вставать рано. Тебе нравится путешествовать?»', answer: 'Me gusta el español. A mi hermana le gustan las series. No nos gusta levantarnos temprano. ¿Te gusta viajar?' },
      { id: 'E3.4', kind: 'task', title: 'Распорядок', prompt: 'Перевести: «По будням я встаю в семь, принимаю душ, завтракаю и еду на работу. Ложусь в одиннадцать».', answer: 'Entre semana me levanto a las siete, me ducho, desayuno y voy al trabajo. Me acuesto a las once.' },
      { id: 'E3.5', kind: 'task', title: 'Планы: ir a', prompt: 'Перевести: «В следующем году я буду учить A2. Летом мы поедем в Испанию. Ты будешь работать завтра?»', answer: 'El año que viene voy a estudiar A2. En verano vamos a ir a España. ¿Vas a trabajar mañana?' },
      { id: 'E3.6', kind: 'task', title: 'Вопросы к ответам', prompt: 'К каждому ответу задать вопрос: — Tengo 30 años. — Vivo en Moscú. — Me levanto a las siete. — Me gusta leer. — Voy al trabajo en metro.', answer: '¿Cuántos años tienes? ¿Dónde vives? ¿A qué hora te levantas? ¿Qué te gusta hacer? ¿Cómo vas al trabajo?' },
      { id: 'E3.7', kind: 'task', title: 'Дата, время, возраст', prompt: 'Перевести: «Сегодня суббота, пятнадцатое марта. Сейчас половина седьмого вечера. Мне 34 года».', answer: 'Hoy es sábado, quince de marzo. Son las seis y media de la tarde. Tengo treinta y cuatro años.' },
      { id: 'E3.8', kind: 'task', title: 'Журнал ошибок', prompt: 'Открыть журнал ошибок: десять фраз, которые не получались, — сказать правильно без подглядывания.', answer: 'Восемь из десяти' },
      { id: 'E3.S1', kind: 'speak', title: 'Часть 1 · о себе', prompt: 'Три минуты на диктофон: кто, откуда, семья, работа, мой день, что люблю.', answer: 'Не меньше пятнадцати фраз; ser / estar / tener, gustar, возвратные, ir a' },
      { id: 'E3.S2', kind: 'speak', title: 'Часть 2 · сценка из быта', prompt: 'Вытянуть одну из: ресторан, магазин, дорога, билет, встреча, врач — и сыграть три минуты за обоих.', answer: 'Сказано главное для сценки; заданы вопросы, а не только ответы' },
      { id: 'E3.S3', kind: 'speak', title: 'Часть 3 · вопросы без подготовки', prompt: 'Десять вопросов, записанных заранее с паузами, — ответить не останавливая запись.', answer: 'Пауза не дольше трёх секунд; если не понял — переспросить по-испански' },
    ],
  },
]

export function testsFor(checkId: string): TestItem[] {
  return BANK.find((variant) => variant.checkId === checkId)?.items ?? []
}
