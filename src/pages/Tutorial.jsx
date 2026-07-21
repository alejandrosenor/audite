import {
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./Tutorial.css";

const tutorialSections = [
    {
        id: "welcome",
        icon: "👋",
        eyebrow: "BIENVENIDO",
        title: "¿Qué es Audite?",
        description:
            "Audite convierte la escucha de discos en una experiencia diaria de descubrimiento, memoria musical y progreso personal.",
        items: [
            {
                icon: "💿",
                title: "Un disco al día",
                text:
                    "La idea central de Audite es descubrir, escuchar y valorar discos completos. No se trata solo de guardar música: se trata de construir tu propia historia musical.",
            },
            {
                icon: "🧭",
                title: "Descubre música nueva",
                text:
                    "Puedes dejar que Audite te sorprenda, buscar por género, descubrir música en español o añadir manualmente un disco que ya tengas en mente.",
            },
            {
                icon: "✍️",
                title: "Guarda lo que sentiste",
                text:
                    "Cada escucha puede incluir una nota, una reacción, una reseña personal y tus canciones favoritas.",
            },
            {
                icon: "📈",
                title: "Observa cómo evolucionas",
                text:
                    "Audite registra tus géneros, artistas, notas, hábitos, rachas, retos y logros para mostrar cómo crece tu mapa musical.",
            },
        ],
    },

    {
        id: "first-steps",
        icon: "🚀",
        eyebrow: "EMPIEZA AQUÍ",
        title: "Tus primeros pasos",
        description:
            "Esta es la ruta más sencilla para empezar a utilizar Audite sin perderte nada.",
        steps: [
            {
                number: "01",
                title: "Completa tu perfil",
                text:
                    "Elige tu nombre, nombre de usuario, avatar y una pequeña biografía.",
                route: "/profile",
                action: "Abrir Perfil",
            },
            {
                number: "02",
                title: "Descubre un disco",
                text:
                    "Entra en Descubrir y deja que Audite seleccione un álbum para ti.",
                route: "/discover",
                action: "Ir a Descubrir",
            },
            {
                number: "03",
                title: "Guárdalo en Pendientes",
                text:
                    "Acepta la recomendación para escucharla más tarde o comienza la escucha directamente.",
                route: "/to-listen",
                action: "Ver Pendientes",
            },
            {
                number: "04",
                title: "Empieza a escucharlo",
                text:
                    "Cuando estés preparado, marca el disco como Escuchando para seguir su progreso.",
                route: "/listening",
                action: "Ver Escuchando",
            },
            {
                number: "05",
                title: "Termina y valora",
                text:
                    "Ponle nota, escribe tu reseña y escoge tus canciones favoritas.",
                route: "/library",
                action: "Abrir Biblioteca",
            },
        ],
    },

    {
        id: "home",
        icon: "⌂",
        eyebrow: "PANTALLA PRINCIPAL",
        title: "Inicio",
        description:
            "Inicio reúne lo más importante del día y te da acceso rápido a toda tu actividad.",
        route: "/",
        routeLabel: "Abrir Inicio",
        items: [
            {
                icon: "☀️",
                title: "Saludo y resumen",
                text:
                    "El encabezado cambia según la hora y muestra un resumen de tu situación musical.",
            },
            {
                icon: "🎯",
                title: "Reto diario",
                text:
                    "Una pequeña misión que concede experiencia y te anima a explorar diferentes funciones de la aplicación.",
            },
            {
                icon: "✨",
                title: "Recomendaciones",
                text:
                    "Audite utiliza tu actividad y tus valoraciones para sugerirte discos relacionados con tus gustos.",
            },
            {
                icon: "🎵",
                title: "Canción del día",
                text:
                    "Cada día aparece una canción para descubrir. Puedes abrirla, escucharla y completar acciones relacionadas.",
            },
            {
                icon: "🎨",
                title: "Género del día",
                text:
                    "Cada 24 horas Audite presenta un género distinto con descripción, artistas, instrumentos, sensaciones, disco inicial y una curiosidad.",
            },
            {
                icon: "📅",
                title: "Efeméride musical",
                text:
                    "Descubre acontecimientos, aniversarios, publicaciones y momentos importantes de la historia de la música.",
            }
        ],
    },

    {
        id: "discover",
        icon: "✦",
        eyebrow: "ENCUENTRA TU PRÓXIMO DISCO",
        title: "Descubrir",
        description:
            "La pantalla desde la que empieza casi toda nueva aventura musical.",
        route: "/discover",
        routeLabel: "Abrir Descubrir",
        items: [
            {
                icon: "🎲",
                title: "Sorpréndeme",
                text:
                    "Audite selecciona un álbum aleatorio para ti sin limitarse a un género concreto.",
            },
            {
                icon: "🎸",
                title: "Descubrir por género",
                text:
                    "Escoge el estilo que te apetezca explorar y recibe una propuesta relacionada.",
            },
            {
                icon: "🇪🇸",
                title: "Música en español",
                text:
                    "Activa el filtro para recibir discos interpretados principalmente en español.",
            },
            {
                icon: "➕",
                title: "Añadir manualmente",
                text:
                    "Busca y añade un álbum concreto cuando ya sabes qué quieres escuchar.",
            },
            {
                icon: "♡",
                title: "Quiero escucharlo",
                text:
                    "Guarda la recomendación en tu lista de discos pendientes.",
            },
            {
                icon: "↻",
                title: "Prefiero otro",
                text:
                    "Descarta temporalmente la propuesta y genera una alternativa.",
            },
            {
                icon: "✓",
                title: "Ya lo conozco",
                text:
                    "Indica que ese álbum ya forma parte de tu experiencia para evitar recomendaciones poco útiles.",
            },
        ],
    },

    {
        id: "album-states",
        icon: "◉",
        eyebrow: "EL VIAJE DEL DISCO",
        title: "Estados de una escucha",
        description:
            "Cada álbum atraviesa distintas etapas dentro de Audite.",
        states: [
            {
                icon: "🧭",
                name: "Descubierto",
                text:
                    "El disco ha sido generado o encontrado, pero todavía no forma parte de tu lista.",
            },
            {
                icon: "＋",
                name: "Pendiente",
                text:
                    "Has decidido que quieres escucharlo y queda guardado para más adelante.",
            },
            {
                icon: "🎧",
                name: "Escuchando",
                text:
                    "Has iniciado la escucha. Puedes volver a esta pantalla mientras no lo termines.",
            },
            {
                icon: "★",
                name: "Terminado",
                text:
                    "Has completado el disco y realizado su valoración.",
            },
            {
                icon: "⏹",
                name: "No terminado",
                text:
                    "Decidiste abandonar la escucha. No suma a tu racha como disco completado, pero queda registrado en su sección correspondiente.",
            },
        ],
    },

    {
        id: "pending",
        icon: "◷",
        eyebrow: "TU LISTA PERSONAL",
        title: "Pendientes",
        description:
            "Aquí viven todos los discos que quieres escuchar en el futuro.",
        route: "/to-listen",
        routeLabel: "Abrir Pendientes",
        items: [
            {
                icon: "📚",
                title: "Tu cola musical",
                text:
                    "Consulta todos los álbumes que has aceptado desde Descubrir o añadido manualmente.",
            },
            {
                icon: "▶",
                title: "Comenzar escucha",
                text:
                    "Selecciona un disco para moverlo al estado Escuchando.",
            },
            {
                icon: "🗑",
                title: "Eliminar pendiente",
                text:
                    "Retira de la lista los discos que ya no te interesen.",
            },
        ],
    },

    {
        id: "listening",
        icon: "🎧",
        eyebrow: "AHORA MISMO",
        title: "Escuchando",
        description:
            "La zona dedicada a los álbumes que has empezado y todavía no has terminado.",
        route: "/listening",
        routeLabel: "Abrir Escuchando",
        items: [
            {
                icon: "▶",
                title: "Continuar escuchando",
                text:
                    "Regresa al álbum activo y accede rápidamente a Spotify.",
            },
            {
                icon: "★",
                title: "Terminar escucha",
                text:
                    "Cuando acabes el disco, abre la valoración completa.",
            },
            {
                icon: "⏹",
                title: "Abandonar",
                text:
                    "Marca el disco como no terminado cuando no quieras continuar.",
            },
        ],
    },

    {
        id: "review",
        icon: "✍️",
        eyebrow: "TU OPINIÓN",
        title: "Valoraciones y reseñas",
        description:
            "El momento en el que conviertes una escucha en un recuerdo.",
        items: [
            {
                icon: "🔢",
                title: "Nota decimal",
                text:
                    "Valora el disco con precisión usando números enteros o decimales.",
            },
            {
                icon: "😍",
                title: "Reacción",
                text:
                    "Indica si te ha encantado, te ha gustado, te ha parecido normal, flojo o no te ha gustado.",
            },
            {
                icon: "📝",
                title: "Reseña personal",
                text:
                    "Escribe qué te ha parecido, qué destacarías y qué sensaciones te ha dejado.",
            },
            {
                icon: "⭐",
                title: "Canciones favoritas",
                text:
                    "Selecciona tus temas preferidos y ordénalos para crear tu Top 3.",
            },
            {
                icon: "↻",
                title: "¿Lo escucharías otra vez?",
                text:
                    "Guarda si el álbum merece una futura escucha completa.",
            },
            {
                icon: "✏️",
                title: "Editar valoración",
                text:
                    "Puedes corregir la nota, la reseña o el orden de tus canciones favoritas después de terminar.",
            },
        ],
    },

    {
        id: "library",
        icon: "▦",
        eyebrow: "TU HISTORIA",
        title: "Biblioteca",
        description:
            "El archivo completo de tu vida musical dentro de Audite.",
        route: "/library",
        routeLabel: "Abrir Biblioteca",
        items: [
            {
                icon: "💿",
                title: "Todos",
                text:
                    "Muestra los discos terminados que forman tu biblioteca principal.",
            },
            {
                icon: "⏹",
                title: "No terminados",
                text:
                    "Consulta y gestiona los álbumes que abandonaste.",
            },
            {
                icon: "♥",
                title: "Favoritos",
                text:
                    "Encuentra rápidamente los discos que marcaste como especiales.",
            },
            {
                icon: "↕",
                title: "Ordenación",
                text:
                    "Ordena por nota, fecha reciente o alfabéticamente. Audite recuerda tu elección.",
            },
            {
                icon: "🔍",
                title: "Ficha del disco",
                text:
                    "Abre cualquier álbum para consultar valoración, reseña, canciones favoritas, tracklist, duración, género e historial.",
            },
            {
                icon: "📤",
                title: "Compartir en Social",
                text:
                    "Publica tu escucha para que tus amigos puedan verla, darle me gusta y comentarla.",
            },
        ],
    },

    {
        id: "songs",
        icon: "♫",
        eyebrow: "TUS TEMAS",
        title: "Canciones",
        description:
            "Una biblioteca creada a partir de todas las canciones que has destacado.",
        route: "/songs",
        routeLabel: "Abrir Canciones",
        items: [
            {
                icon: "⭐",
                title: "Favoritas de cada disco",
                text:
                    "Reúne las canciones que seleccionaste durante tus valoraciones.",
            },
            {
                icon: "▶",
                title: "Abrir en Spotify",
                text:
                    "Accede directamente a la canción desde su ficha.",
            },
            {
                icon: "🏆",
                title: "Tu selección personal",
                text:
                    "Con el tiempo se convierte en una lista representativa de tu gusto musical.",
            },
        ],
    },

    {
        id: "progress",
        icon: "⚡",
        eyebrow: "PROGRESO",
        title: "XP, niveles y rachas",
        description:
            "Audite recompensa la constancia y la curiosidad, no solo la cantidad de discos.",
        items: [
            {
                icon: "⚡",
                title: "Experiencia",
                text:
                    "Obtienes XP completando escuchas, retos y acciones de descubrimiento.",
            },
            {
                icon: "📶",
                title: "Nivel musical",
                text:
                    "La experiencia acumulada aumenta tu nivel y desbloquea nuevos rangos de oyente.",
            },
            {
                icon: "🔥",
                title: "Racha",
                text:
                    "Completa discos en días consecutivos para mantener viva tu racha.",
            },
            {
                icon: "🛡",
                title: "Comodines",
                text:
                    "Algunos logros especiales pueden proteger una racha cuando no has podido completar una escucha.",
            },
            {
                icon: "🎯",
                title: "Retos diarios",
                text:
                    "Cada reto propone una acción concreta y ofrece experiencia al completarse.",
            },
        ],
    },

    {
        id: "achievements",
        icon: "🏆",
        eyebrow: "HITOS",
        title: "Logros",
        description:
            "Reconocimientos por tus hábitos, descubrimientos y momentos especiales.",
        route: "/achievements",
        routeLabel: "Abrir Logros",
        items: [
            {
                icon: "●",
                title: "Comunes",
                text:
                    "Primeros pasos y acciones habituales dentro de la aplicación.",
            },
            {
                icon: "◆",
                title: "Raros",
                text:
                    "Requieren mayor constancia, variedad o exploración.",
            },
            {
                icon: "✦",
                title: "Épicos",
                text:
                    "Premian objetivos difíciles y momentos destacados.",
            },
            {
                icon: "♛",
                title: "Legendarios",
                text:
                    "Los retos más exigentes y especiales de Audite.",
            },
            {
                icon: "🖼",
                title: "Vitrina",
                text:
                    "Selecciona tus logros preferidos para mostrarlos en tu perfil.",
            },
        ],
    },

    {
        id: "profile",
        icon: "☺",
        eyebrow: "TU IDENTIDAD",
        title: "Perfil",
        description:
            "El resumen de quién eres dentro de Audite y cómo ha evolucionado tu escucha.",
        route: "/profile",
        routeLabel: "Abrir Perfil",
        items: [
            {
                icon: "🖼",
                title: "Avatar",
                text:
                    "Utiliza una imagen propia, un emoji musical o la imagen de un artista.",
            },
            {
                icon: "@",
                title: "Nombre de usuario",
                text:
                    "Tu identificador público dentro de las funciones sociales.",
            },
            {
                icon: "📈",
                title: "Nivel y experiencia",
                text:
                    "Consulta tu nivel actual, XP acumulada y progreso hacia el siguiente.",
            },
            {
                icon: "🧬",
                title: "Afinidad por géneros",
                text:
                    "Cada disco terminado alimenta tu mapa musical y aumenta la experiencia de sus géneros.",
            },
            {
                icon: "🏆",
                title: "Logros destacados",
                text:
                    "Muestra los hitos que hayas colocado en tu vitrina.",
            },
            {
                icon: "⚙️",
                title: "Ajustes",
                text:
                    "Gestiona preferencias de perfil, privacidad y opciones de la cuenta.",
            },
        ],
    },

    {
        id: "ranking",
        icon: "♛",
        eyebrow: "TUS MEJORES DISCOS",
        title: "Ranking",
        description:
            "Ordena todos tus álbumes terminados de acuerdo con tus propias valoraciones.",
        route: "/ranking",
        routeLabel: "Abrir Ranking",
        items: [
            {
                icon: "1",
                title: "Clasificación personal",
                text:
                    "Los discos aparecen ordenados desde tu nota más alta hasta la más baja.",
            },
            {
                icon: "=",
                title: "Empates",
                text:
                    "Los álbumes con la misma nota comparten posición de forma coherente.",
            },
            {
                icon: "🔍",
                title: "Consulta rápida",
                text:
                    "Abre cualquier entrada para volver a ver su ficha completa.",
            },
        ],
    },

    {
        id: "statistics",
        icon: "📊",
        eyebrow: "TUS DATOS",
        title: "Estadísticas",
        description:
            "Una mirada profunda a tus hábitos y preferencias musicales.",
        route: "/statistics/listening",
        routeLabel: "Abrir Estadísticas",
        items: [
            {
                icon: "💿",
                title: "Discos terminados",
                text:
                    "Consulta cuántos álbumes has completado y cómo evoluciona tu ritmo.",
            },
            {
                icon: "⭐",
                title: "Notas",
                text:
                    "Observa tu media, mejores valoraciones y distribución de puntuaciones.",
            },
            {
                icon: "🎸",
                title: "Géneros",
                text:
                    "Descubre los estilos más frecuentes de tu biblioteca.",
            },
            {
                icon: "🎤",
                title: "Artistas",
                text:
                    "Comprueba qué artistas aparecen más veces en tu historial.",
            },
            {
                icon: "⏱",
                title: "Tiempo escuchado",
                text:
                    "Visualiza la duración aproximada de toda tu actividad musical.",
            },
        ],
    },

    {
        id: "calendar",
        icon: "▦",
        eyebrow: "CONSTANCIA",
        title: "Calendario de retos",
        description:
            "Un calendario visual de tu actividad y de los objetivos diarios completados.",
        route: "/challenge-calendar",
        routeLabel: "Abrir Calendario",
        items: [
            {
                icon: "✓",
                title: "Días completados",
                text:
                    "Identifica rápidamente qué jornadas superaste el reto.",
            },
            {
                icon: "🔥",
                title: "Rachas",
                text:
                    "Observa de forma visual tus periodos de mayor constancia.",
            },
            {
                icon: "📅",
                title: "Historial",
                text:
                    "Consulta la actividad musical registrada en días anteriores.",
            },
        ],
    },

    {
        id: "monthly",
        icon: "🗓",
        eyebrow: "TU MES EN MÚSICA",
        title: "Informe mensual",
        description:
            "Un resumen editorial de todo lo que ocurrió durante el mes.",
        route: "/monthly-report",
        routeLabel: "Abrir Informe",
        items: [
            {
                icon: "💿",
                title: "Resumen de escuchas",
                text:
                    "Cantidad de discos terminados, abandonados y añadidos.",
            },
            {
                icon: "🏅",
                title: "Momentos destacados",
                text:
                    "Mejor disco, nota media, géneros dominantes y otros hitos.",
            },
            {
                icon: "📖",
                title: "Tu historia mensual",
                text:
                    "Una forma de recordar cómo fue musicalmente cada etapa del año.",
            },
        ],
    },

    {
        id: "social",
        icon: "☻",
        eyebrow: "COMPARTE MÚSICA",
        title: "Social",
        description:
            "Conecta con amigos y descubre qué están escuchando.",
        route: "/social",
        routeLabel: "Abrir Social",
        items: [
            {
                icon: "➕",
                title: "Añadir amigos",
                text:
                    "Busca usuarios, envía solicitudes y acepta nuevas conexiones.",
            },
            {
                icon: "📰",
                title: "Actividad",
                text:
                    "Consulta las valoraciones y reseñas compartidas por tus amigos.",
            },
            {
                icon: "♥",
                title: "Me gusta",
                text:
                    "Reacciona a las publicaciones que te interesen.",
            },
            {
                icon: "💬",
                title: "Comentarios",
                text:
                    "Comenta discos, reseñas y canciones favoritas.",
            },
            {
                icon: "🗑",
                title: "Eliminar publicación",
                text:
                    "Puedes retirar del feed cualquier publicación que hayas creado.",
            },
            {
                icon: "👤",
                title: "Perfiles sociales",
                text:
                    "Visita el perfil de otros usuarios y consulta su actividad pública.",
            },
        ],
    },

    {
        id: "backup",
        icon: "☁️",
        eyebrow: "SEGURIDAD",
        title: "Copia de seguridad",
        description:
            "Protege tu historia musical y conserva una copia de tus datos.",
        route: "/data-backup",
        routeLabel: "Abrir Copia de seguridad",
        items: [
            {
                icon: "↓",
                title: "Exportar",
                text:
                    "Descarga una copia de la información almacenada en tu cuenta.",
            },
            {
                icon: "🛡",
                title: "Protege tu historial",
                text:
                    "La copia te permite conservar valoraciones, escuchas y datos importantes.",
            },
        ],
    },

    {
        id: "faq",
        icon: "?",
        eyebrow: "DUDAS FRECUENTES",
        title: "Preguntas y respuestas",
        description:
            "Algunas aclaraciones para entender mejor el funcionamiento de Audite.",
        questions: [
            {
                question:
                    "¿Tengo que escuchar obligatoriamente un disco cada día?",
                answer:
                    "No. Audite te anima a mantener una rutina, pero puedes utilizarla a tu ritmo. La racha solo representa constancia, no una obligación.",
            },
            {
                question:
                    "¿Un disco abandonado cuenta como terminado?",
                answer:
                    "No. Queda registrado en No terminados, pero no se suma como álbum completado ni aumenta la racha de escuchas.",
            },
            {
                question:
                    "¿Puedo cambiar una valoración?",
                answer:
                    "Sí. Desde la ficha del disco puedes editar la nota, la reacción, la reseña y tus canciones favoritas.",
            },
            {
                question:
                    "¿Se publican automáticamente mis reseñas?",
                answer:
                    "No. Compartir una valoración en Social requiere una acción expresa desde la ficha del disco.",
            },
            {
                question:
                    "¿Puedo eliminar una publicación?",
                answer:
                    "Sí. Abre el menú de opciones de una publicación propia y selecciona Eliminar publicación.",
            },
            {
                question:
                    "¿Cómo se calcula la afinidad de géneros?",
                answer:
                    "Audite analiza los géneros de tus discos terminados, su cantidad y tus valoraciones para construir tu experiencia dentro de cada estilo.",
            },
            {
                question:
                    "¿Qué ocurre si una recomendación no me interesa?",
                answer:
                    "Puedes pedir otra propuesta, indicar que ya conoces el disco o simplemente salir sin guardarlo.",
            },
        ],
    },
];

function Tutorial() {
    const navigate = useNavigate();

    const [query, setQuery] =
        useState("");

    const [completedSections, setCompletedSections] =
        useState(() => {
            try {
                return JSON.parse(
                    localStorage.getItem(
                        "audite_tutorial_completed",
                    ),
                ) ?? [];
            } catch {
                return [];
            }
        });

    const [openQuestions, setOpenQuestions] =
        useState([]);

    useEffect(() => {
        localStorage.setItem(
            "audite_tutorial_completed",
            JSON.stringify(completedSections),
        );
    }, [completedSections]);

    const filteredSections = useMemo(() => {
        const cleanQuery =
            query.trim().toLowerCase();

        if (!cleanQuery) {
            return tutorialSections;
        }

        return tutorialSections.filter(
            (section) =>
                JSON.stringify(section)
                    .toLowerCase()
                    .includes(cleanQuery),
        );
    }, [query]);

    const progress = Math.round(
        (
            completedSections.length /
            tutorialSections.length
        ) * 100,
    );

    function toggleSection(sectionId) {
        setCompletedSections((current) =>
            current.includes(sectionId)
                ? current.filter(
                    (id) => id !== sectionId,
                )
                : [...current, sectionId],
        );
    }

    function toggleQuestion(question) {
        setOpenQuestions((current) =>
            current.includes(question)
                ? current.filter(
                    (item) => item !== question,
                )
                : [...current, question],
        );
    }

    return (
        <main className="tutorial-page">
            <section className="tutorial-hero">
                <button
                    type="button"
                    className="tutorial-back"
                    onClick={() => navigate(-1)}
                >
                    ← Volver
                </button>

                <div className="tutorial-hero__icon">
                    A
                </div>

                <p>GUÍA COMPLETA</p>

                <h1>
                    Aprende a utilizar
                    <span> Audite</span>
                </h1>

                <p className="tutorial-hero__description">
                    Todo lo que necesitas saber para
                    descubrir discos, guardar tus
                    recuerdos y construir tu propia
                    historia musical.
                </p>

                <div className="tutorial-progress">
                    <header>
                        <span>Tu progreso</span>
                        <strong>{progress}%</strong>
                    </header>

                    <div>
                        <span
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>
            </section>

            <section className="tutorial-search">
                <span>⌕</span>

                <input
                    type="search"
                    value={query}
                    onChange={(event) =>
                        setQuery(event.target.value)
                    }
                    placeholder="Busca una pantalla o funcionalidad..."
                />

                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Limpiar búsqueda"
                    >
                        ×
                    </button>
                )}
            </section>

            <nav className="tutorial-index">
                {tutorialSections.map((section) => (
                    <a
                        key={section.id}
                        href={`#tutorial-${section.id}`}
                    >
                        <span>{section.icon}</span>
                        {section.title}
                    </a>
                ))}
            </nav>

            <div className="tutorial-sections">
                {filteredSections.map((section) => (
                    <section
                        id={`tutorial-${section.id}`}
                        className="tutorial-section"
                        key={section.id}
                    >
                        <header className="tutorial-section__header">
                            <div className="tutorial-section__icon">
                                {section.icon}
                            </div>

                            <div>
                                <p>{section.eyebrow}</p>
                                <h2>{section.title}</h2>
                                <span>
                                    {section.description}
                                </span>
                            </div>
                        </header>

                        {section.items && (
                            <div className="tutorial-cards">
                                {section.items.map((item) => (
                                    <article key={item.title}>
                                        <span>{item.icon}</span>

                                        <div>
                                            <h3>
                                                {item.title}
                                            </h3>

                                            <p>
                                                {item.text}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {section.steps && (
                            <div className="tutorial-steps">
                                {section.steps.map(
                                    (step) => (
                                        <article
                                            key={
                                                step.number
                                            }
                                        >
                                            <strong>
                                                {step.number}
                                            </strong>

                                            <div>
                                                <h3>
                                                    {
                                                        step.title
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        step.text
                                                    }
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            step.route,
                                                        )
                                                    }
                                                >
                                                    {
                                                        step.action
                                                    }
                                                    <span>→</span>
                                                </button>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        )}

                        {section.states && (
                            <div className="tutorial-states">
                                {section.states.map(
                                    (state) => (
                                        <article
                                            key={state.name}
                                        >
                                            <span>
                                                {state.icon}
                                            </span>

                                            <div>
                                                <h3>
                                                    {
                                                        state.name
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        state.text
                                                    }
                                                </p>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        )}

                        {section.questions && (
                            <div className="tutorial-faq">
                                {section.questions.map(
                                    (item) => {
                                        const isOpen =
                                            openQuestions.includes(
                                                item.question,
                                            );

                                        return (
                                            <article
                                                key={
                                                    item.question
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleQuestion(
                                                            item.question,
                                                        )
                                                    }
                                                >
                                                    <span>
                                                        {
                                                            item.question
                                                        }
                                                    </span>

                                                    <strong>
                                                        {isOpen
                                                            ? "−"
                                                            : "+"}
                                                    </strong>
                                                </button>

                                                {isOpen && (
                                                    <p>
                                                        {
                                                            item.answer
                                                        }
                                                    </p>
                                                )}
                                            </article>
                                        );
                                    },
                                )}
                            </div>
                        )}

                        <footer className="tutorial-section__footer">
                            {section.route && (
                                <button
                                    type="button"
                                    className="tutorial-section__route"
                                    onClick={() =>
                                        navigate(
                                            section.route,
                                        )
                                    }
                                >
                                    {section.routeLabel}
                                    <span>→</span>
                                </button>
                            )}

                            <button
                                type="button"
                                className={
                                    completedSections.includes(
                                        section.id,
                                    )
                                        ? "tutorial-section__complete tutorial-section__complete--active"
                                        : "tutorial-section__complete"
                                }
                                onClick={() =>
                                    toggleSection(
                                        section.id,
                                    )
                                }
                            >
                                {completedSections.includes(
                                    section.id,
                                )
                                    ? "✓ Sección aprendida"
                                    : "Marcar como aprendida"}
                            </button>
                        </footer>
                    </section>
                ))}
            </div>

            {filteredSections.length === 0 && (
                <section className="tutorial-empty">
                    <span>⌕</span>
                    <h2>No hemos encontrado esa función</h2>
                    <p>
                        Prueba con palabras como
                        “reseña”, “racha”, “social”,
                        “Spotify” o “biblioteca”.
                    </p>
                </section>
            )}

            <section className="tutorial-finish">
                <span>🎧</span>

                <div>
                    <p>YA ESTÁS PREPARADO</p>
                    <h2>
                        Tu historia musical empieza ahora
                    </h2>

                    <span>
                        Descubre un disco, escúchalo con
                        calma y deja que Audite recuerde
                        el viaje.
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/discover")
                    }
                >
                    Descubrir mi próximo disco
                </button>
            </section>
        </main>
    );
}

export default Tutorial;