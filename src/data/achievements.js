export const achievementRarities = {
    common: {
        id: "common",
        label: "Común",
        icon: "●",
        color: "#a8acb8",
    },
    rare: {
        id: "rare",
        label: "Raro",
        icon: "◆",
        color: "#4f9cff",
    },
    epic: {
        id: "epic",
        label: "Épico",
        icon: "✦",
        color: "#a166ff",
    },
    legendary: {
        id: "legendary",
        label: "Legendario",
        icon: "♛",
        color: "#f4c95d",
    },
};

export const achievementCategories = {
    albums: {
        id: "albums",
        label: "Discografía",
        icon: "💿",
        description:
            "Completa discos y construye tu historia musical.",
    },
    streaks: {
        id: "streaks",
        label: "Constancia",
        icon: "🔥",
        description:
            "Mantén viva tu racha de escucha.",
    },
    reviews: {
        id: "reviews",
        label: "Crítica",
        icon: "✍️",
        description:
            "Valora, analiza y deja constancia de lo que escuchas.",
    },
    favorites: {
        id: "favorites",
        label: "Favoritas",
        icon: "🎵",
        description:
            "Construye tu selección personal de canciones.",
    },
    exploration: {
        id: "exploration",
        label: "Exploración",
        icon: "🌍",
        description:
            "Cruza géneros, décadas y artistas.",
    },
    formats: {
        id: "formats",
        label: "Épocas y formatos",
        icon: "⏳",
        description:
            "Explora discos antiguos, recientes, cortos y extensos.",
    },
    discovery: {
        id: "discovery",
        label: "Descubrimiento",
        icon: "🧭",
        description:
            "Utiliza las herramientas de Audite para encontrar música.",
    },
    decisions: {
        id: "decisions",
        label: "Decisiones",
        icon: "🎧",
        description:
            "Acepta, rechaza, abandona y vuelve a intentarlo.",
    },
    progression: {
        id: "progression",
        label: "Progresión",
        icon: "⚡",
        description:
            "Sube de nivel y acumula experiencia musical.",
    },
    daily: {
        id: "daily",
        label: "Juego diario",
        icon: "🧠",
        description:
            "Participa en las actividades musicales de cada día.",
    },
};

function achievement({
    id,
    title,
    description,
    category,
    rarity,
    icon,
    metric,
    target,
    reward,
    secret = false,
}) {
    return {
        id,
        title,
        description,
        category,
        rarity,
        icon,
        metric,
        target,
        reward,
        secret,
    };
}

export const achievements = [
    /*
     * DISCOS — 10
     */
    achievement({
        id: "first-album",
        title: "Primera aguja",
        description: "Termina tu primer disco.",
        category: "albums",
        rarity: "common",
        icon: "💿",
        metric: "completedAlbums",
        target: 1,
    }),
    achievement({
        id: "five-albums",
        title: "La colección empieza",
        description: "Termina 5 discos.",
        category: "albums",
        rarity: "common",
        icon: "📀",
        metric: "completedAlbums",
        target: 5,
    }),
    achievement({
        id: "ten-albums",
        title: "Cara A",
        description: "Termina 10 discos.",
        category: "albums",
        rarity: "common",
        icon: "🔟",
        metric: "completedAlbums",
        target: 10,
    }),
    achievement({
        id: "twenty-five-albums",
        title: "Coleccionista",
        description: "Termina 25 discos.",
        category: "albums",
        rarity: "rare",
        icon: "🗄️",
        metric: "completedAlbums",
        target: 25,
    }),
    achievement({
        id: "fifty-albums",
        title: "Estantería llena",
        description: "Termina 50 discos.",
        category: "albums",
        rarity: "rare",
        icon: "🪵",
        metric: "completedAlbums",
        target: 50,
    }),
    achievement({
        id: "hundred-albums",
        title: "Discoteca personal",
        description: "Termina 100 discos.",
        category: "albums",
        rarity: "epic",
        icon: "🏛️",
        metric: "completedAlbums",
        target: 100,
    }),
    achievement({
        id: "two-hundred-fifty-albums",
        title: "Archivo sonoro",
        description: "Termina 250 discos.",
        category: "albums",
        rarity: "epic",
        icon: "🗃️",
        metric: "completedAlbums",
        target: 250,
    }),
    achievement({
        id: "three-hundred-sixty-five-albums",
        title: "El año del oyente",
        description: "Termina 365 discos.",
        category: "albums",
        rarity: "legendary",
        icon: "🗓️",
        metric: "completedAlbums",
        target: 365,
        reward: {
            streakShields: 2,
            label: "2 comodines de racha",
        },
    }),
    achievement({
        id: "five-hundred-albums",
        title: "Toda una vida",
        description: "Termina 500 discos.",
        category: "albums",
        rarity: "legendary",
        icon: "🌌",
        metric: "completedAlbums",
        target: 500,
        reward: {
            streakShields: 2,
            tripleChoiceTokens: 1,
            label:
                "2 comodines de racha y 1 selección triple",
        },
    }),
    achievement({
        id: "thousand-albums",
        title: "Mil discos después",
        description: "Termina 1.000 discos.",
        category: "albums",
        rarity: "legendary",
        icon: "👑",
        metric: "completedAlbums",
        target: 1000,
        reward: {
            streakShields: 3,
            tripleChoiceTokens: 2,
            frame: "thousand-albums",
            label:
                "3 comodines, 2 selecciones triples y marco legendario",
        },
    }),

    /*
     * RACHAS — 8
     */
    achievement({
        id: "three-day-streak",
        title: "Primer hábito",
        description: "Alcanza una racha de 3 días.",
        category: "streaks",
        rarity: "common",
        icon: "🔥",
        metric: "bestStreak",
        target: 3,
    }),
    achievement({
        id: "seven-day-streak",
        title: "Semana perfecta",
        description: "Alcanza una racha de 7 días.",
        category: "streaks",
        rarity: "common",
        icon: "📅",
        metric: "bestStreak",
        target: 7,
    }),
    achievement({
        id: "fourteen-day-streak",
        title: "Dos semanas sin silencio",
        description: "Alcanza una racha de 14 días.",
        category: "streaks",
        rarity: "rare",
        icon: "🎧",
        metric: "bestStreak",
        target: 14,
    }),
    achievement({
        id: "thirty-day-streak",
        title: "Mes de oro",
        description: "Alcanza una racha de 30 días.",
        category: "streaks",
        rarity: "rare",
        icon: "🌕",
        metric: "bestStreak",
        target: 30,
    }),
    achievement({
        id: "sixty-day-streak",
        title: "Sin bajar el volumen",
        description: "Alcanza una racha de 60 días.",
        category: "streaks",
        rarity: "epic",
        icon: "🔊",
        metric: "bestStreak",
        target: 60,
    }),
    achievement({
        id: "hundred-day-streak",
        title: "Cien días de música",
        description: "Alcanza una racha de 100 días.",
        category: "streaks",
        rarity: "epic",
        icon: "💯",
        metric: "bestStreak",
        target: 100,
        reward: {
            streakShields: 1,
            label: "1 comodín de racha",
        },
    }),
    achievement({
        id: "half-year-streak",
        title: "Medio año sonando",
        description: "Alcanza una racha de 180 días.",
        category: "streaks",
        rarity: "legendary",
        icon: "☀️",
        metric: "bestStreak",
        target: 180,
        reward: {
            streakShields: 2,
            label: "2 comodines de racha",
        },
    }),
    achievement({
        id: "year-streak",
        title: "Un año sin silencio",
        description: "Alcanza una racha de 365 días.",
        category: "streaks",
        rarity: "legendary",
        icon: "♾️",
        metric: "bestStreak",
        target: 365,
        reward: {
            streakShields: 3,
            frame: "year-streak",
            label:
                "3 comodines de racha y marco legendario",
        },
    }),

    /*
     * CRÍTICA — 14
     */
    achievement({
        id: "first-review",
        title: "Opinión formada",
        description: "Valora tu primer álbum.",
        category: "reviews",
        rarity: "common",
        icon: "⭐",
        metric: "ratedAlbums",
        target: 1,
    }),
    achievement({
        id: "ten-ratings",
        title: "Con criterio",
        description: "Valora 10 álbumes.",
        category: "reviews",
        rarity: "common",
        icon: "📊",
        metric: "ratedAlbums",
        target: 10,
    }),
    achievement({
        id: "fifty-ratings",
        title: "Jurado musical",
        description: "Valora 50 álbumes.",
        category: "reviews",
        rarity: "rare",
        icon: "⚖️",
        metric: "ratedAlbums",
        target: 50,
    }),
    achievement({
        id: "hundred-ratings",
        title: "Veredicto experto",
        description: "Valora 100 álbumes.",
        category: "reviews",
        rarity: "epic",
        icon: "🏅",
        metric: "ratedAlbums",
        target: 100,
    }),
    achievement({
        id: "first-written-review",
        title: "Primera reseña",
        description: "Escribe tu primera reseña personal.",
        category: "reviews",
        rarity: "common",
        icon: "✏️",
        metric: "writtenReviews",
        target: 1,
    }),
    achievement({
        id: "ten-reviews",
        title: "Crítico musical",
        description: "Escribe 10 reseñas personales.",
        category: "reviews",
        rarity: "rare",
        icon: "✍️",
        metric: "writtenReviews",
        target: 10,
    }),
    achievement({
        id: "fifty-reviews",
        title: "Firma reconocible",
        description: "Escribe 50 reseñas personales.",
        category: "reviews",
        rarity: "epic",
        icon: "📰",
        metric: "writtenReviews",
        target: 50,
    }),
    achievement({
        id: "hundred-reviews",
        title: "Cronista musical",
        description: "Escribe 100 reseñas personales.",
        category: "reviews",
        rarity: "legendary",
        icon: "📚",
        metric: "writtenReviews",
        target: 100,
    }),
    achievement({
        id: "five-long-reviews",
        title: "Hay mucho que decir",
        description:
            "Escribe 5 reseñas de al menos 300 caracteres.",
        category: "reviews",
        rarity: "rare",
        icon: "🖋️",
        metric: "longReviews",
        target: 5,
    }),
    achievement({
        id: "twenty-long-reviews",
        title: "Ensayista musical",
        description:
            "Escribe 20 reseñas de al menos 300 caracteres.",
        category: "reviews",
        rarity: "epic",
        icon: "📜",
        metric: "longReviews",
        target: 20,
    }),
    achievement({
        id: "first-ten",
        title: "Obra maestra",
        description: "Concede tu primer 10.",
        category: "reviews",
        rarity: "rare",
        icon: "🔟",
        metric: "exactTenAlbums",
        target: 1,
    }),
    achievement({
        id: "ten-nine-plus",
        title: "Salón de la fama",
        description:
            "Puntúa 10 álbumes con un 9 o más.",
        category: "reviews",
        rarity: "epic",
        icon: "🏆",
        metric: "ninePlusAlbums",
        target: 10,
    }),
    achievement({
        id: "ten-low-ratings",
        title: "Crítico implacable",
        description:
            "Puntúa 10 álbumes por debajo de 5.",
        category: "reviews",
        rarity: "rare",
        icon: "🧊",
        metric: "lowRatedAlbums",
        target: 10,
    }),
    achievement({
        id: "rating-spectrum",
        title: "Todo el baremo",
        description:
            "Utiliza 15 puntuaciones diferentes.",
        category: "reviews",
        rarity: "epic",
        icon: "🎚️",
        metric: "uniqueRatingValues",
        target: 15,
    }),

    /*
     * FAVORITAS — 7
     */
    achievement({
        id: "first-favorites",
        title: "Buen oído",
        description:
            "Guarda tu primera canción favorita.",
        category: "favorites",
        rarity: "common",
        icon: "🎵",
        metric: "favoriteTracks",
        target: 1,
    }),
    achievement({
        id: "fifty-favorites",
        title: "Cara A, cara B",
        description:
            "Guarda 50 canciones favoritas.",
        category: "favorites",
        rarity: "common",
        icon: "🎶",
        metric: "favoriteTracks",
        target: 50,
    }),
    achievement({
        id: "hundred-favorites",
        title: "Selección personal",
        description:
            "Guarda 100 canciones favoritas.",
        category: "favorites",
        rarity: "rare",
        icon: "💙",
        metric: "favoriteTracks",
        target: 100,
    }),
    achievement({
        id: "two-hundred-favorites",
        title: "Banda sonora propia",
        description:
            "Guarda 200 canciones favoritas.",
        category: "favorites",
        rarity: "epic",
        icon: "🎼",
        metric: "favoriteTracks",
        target: 200,
    }),
    achievement({
        id: "five-hundred-favorites",
        title: "Fonoteca emocional",
        description:
            "Guarda 500 canciones favoritas.",
        category: "favorites",
        rarity: "legendary",
        icon: "💖",
        metric: "favoriteTracks",
        target: 500,
    }),
    achievement({
        id: "five-favorite-albums",
        title: "Discos con mucho que salvar",
        description:
            "Termina 10 discos guardando al menos 5 canciones favoritas en cada uno.",
        category: "favorites",
        rarity: "rare",
        icon: "🖐️",
        metric: "albumsWithFiveFavorites",
        target: 10,
    }),
    achievement({
        id: "perfect-favorite-albums",
        title: "Sin una sola canción de sobra",
        description:
            "Guarda como favoritas todas las canciones de 5 discos.",
        category: "favorites",
        rarity: "legendary",
        icon: "❤️‍🔥",
        metric: "perfectFavoriteAlbums",
        target: 5,
        secret: true,
    }),

    /*
     * EXPLORACIÓN — 13
     */
    achievement({
        id: "three-genres",
        title: "Explorador novato",
        description:
            "Termina discos de 3 géneros diferentes.",
        category: "exploration",
        rarity: "common",
        icon: "🧭",
        metric: "uniqueGenres",
        target: 3,
    }),
    achievement({
        id: "ten-genres",
        title: "Eclecticismo",
        description:
            "Termina discos de 10 géneros diferentes.",
        category: "exploration",
        rarity: "rare",
        icon: "🌈",
        metric: "uniqueGenres",
        target: 10,
    }),
    achievement({
        id: "thirty-genres",
        title: "Sin fronteras",
        description:
            "Termina discos de 30 géneros diferentes.",
        category: "exploration",
        rarity: "epic",
        icon: "🌍",
        metric: "uniqueGenres",
        target: 30,
    }),
    achievement({
        id: "fifty-genres",
        title: "Cartógrafo musical",
        description:
            "Termina discos de 50 géneros diferentes.",
        category: "exploration",
        rarity: "epic",
        icon: "🗺️",
        metric: "uniqueGenres",
        target: 50,
    }),
    achievement({
        id: "seventy-five-genres",
        title: "Enciclopedia musical",
        description:
            "Termina discos de 75 géneros diferentes.",
        category: "exploration",
        rarity: "legendary",
        icon: "📚",
        metric: "uniqueGenres",
        target: 75,
        reward: {
            streakShields: 1,
            tripleChoiceTokens: 1,
            label:
                "1 comodín de racha y 1 selección triple",
        },
    }),
    achievement({
        id: "five-decades",
        title: "Viajero temporal",
        description:
            "Termina discos de 5 décadas diferentes.",
        category: "exploration",
        rarity: "rare",
        icon: "⏳",
        metric: "uniqueDecades",
        target: 5,
    }),
    achievement({
        id: "eight-decades",
        title: "Historia viva",
        description:
            "Termina discos de 8 décadas diferentes.",
        category: "exploration",
        rarity: "epic",
        icon: "⌛",
        metric: "uniqueDecades",
        target: 8,
    }),
    achievement({
        id: "ten-decades",
        title: "Un siglo de discos",
        description:
            "Termina discos de 10 décadas diferentes.",
        category: "exploration",
        rarity: "legendary",
        icon: "🕰️",
        metric: "uniqueDecades",
        target: 10,
    }),
    achievement({
        id: "twenty-artists",
        title: "Cartel de festival",
        description:
            "Termina discos de 20 artistas diferentes.",
        category: "exploration",
        rarity: "common",
        icon: "🎤",
        metric: "uniqueArtists",
        target: 20,
    }),
    achievement({
        id: "fifty-artists",
        title: "Festival interminable",
        description:
            "Termina discos de 50 artistas diferentes.",
        category: "exploration",
        rarity: "rare",
        icon: "🎪",
        metric: "uniqueArtists",
        target: 50,
    }),
    achievement({
        id: "five-same-artist",
        title: "Fan declarado",
        description:
            "Termina 5 discos del mismo artista.",
        category: "exploration",
        rarity: "epic",
        icon: "🫶",
        metric: "maxAlbumsSameArtist",
        target: 5,
    }),
    achievement({
        id: "fifty-year-span",
        title: "Medio siglo de música",
        description:
            "Escucha discos separados por al menos 50 años de historia.",
        category: "exploration",
        rarity: "rare",
        icon: "5️⃣",
        metric: "historicalSpanYears",
        target: 50,
    }),
    achievement({
        id: "hundred-year-span",
        title: "Un siglo en los oídos",
        description:
            "Escucha discos separados por al menos 100 años de historia.",
        category: "exploration",
        rarity: "legendary",
        icon: "💯",
        metric: "historicalSpanYears",
        target: 100,
        secret: true,
    }),

    /*
     * ÉPOCAS Y FORMATOS — 8
     */
    achievement({
        id: "first-pre1970",
        title: "Primera excavación",
        description:
            "Termina un disco anterior a 1970.",
        category: "formats",
        rarity: "common",
        icon: "🏺",
        metric: "pre1970Albums",
        target: 1,
    }),
    achievement({
        id: "twenty-old-albums",
        title: "Arqueólogo musical",
        description:
            "Termina 20 discos anteriores a 1970.",
        category: "formats",
        rarity: "epic",
        icon: "🦴",
        metric: "pre1970Albums",
        target: 20,
    }),
    achievement({
        id: "ten-pre1960",
        title: "Antes de la invasión",
        description:
            "Termina 10 discos anteriores a 1960.",
        category: "formats",
        rarity: "epic",
        icon: "📻",
        metric: "pre1960Albums",
        target: 10,
    }),
    achievement({
        id: "five-pre1950",
        title: "Prehistoria sonora",
        description:
            "Termina 5 discos anteriores a 1950.",
        category: "formats",
        rarity: "legendary",
        icon: "🕯️",
        metric: "pre1950Albums",
        target: 5,
        secret: true,
    }),
    achievement({
        id: "ten-short-albums",
        title: "Sin relleno",
        description:
            "Termina 10 discos de 10 canciones o menos.",
        category: "formats",
        rarity: "rare",
        icon: "⚡",
        metric: "shortAlbums",
        target: 10,
    }),
    achievement({
        id: "ten-recent-albums",
        title: "Pulso del presente",
        description:
            "Termina 10 discos publicados en los últimos 3 años.",
        category: "formats",
        rarity: "epic",
        icon: "🆕",
        metric: "recentAlbums",
        target: 10,
    }),
    achievement({
        id: "ten-long-albums",
        title: "Maratón musical",
        description:
            "Termina 10 discos de al menos una hora.",
        category: "formats",
        rarity: "rare",
        icon: "🏃",
        metric: "longAlbums",
        target: 10,
    }),
    achievement({
        id: "five-current-year-albums",
        title: "Recién salido del estudio",
        description:
            "Termina 5 discos publicados durante el año actual.",
        category: "formats",
        rarity: "epic",
        icon: "🚨",
        metric: "currentYearAlbums",
        target: 5,
    }),

    /*
     * DESCUBRIMIENTO — 11
     */
    achievement({
        id: "first-discovery",
        title: "Curiosidad activada",
        description:
            "Genera tu primer descubrimiento.",
        category: "discovery",
        rarity: "common",
        icon: "✨",
        metric: "discoveryEvents",
        target: 1,
    }),
    achievement({
        id: "twenty-five-discoveries",
        title: "Radar musical",
        description:
            "Genera 25 descubrimientos.",
        category: "discovery",
        rarity: "common",
        icon: "📡",
        metric: "discoveryEvents",
        target: 25,
    }),
    achievement({
        id: "twenty-five-manual-albums",
        title: "Curador independiente",
        description:
            "Termina 25 discos añadidos manualmente.",
        category: "discovery",
        rarity: "rare",
        icon: "📝",
        metric: "completedManualAlbums",
        target: 25,
    }),
    achievement({
        id: "twenty-five-completed-discoveries",
        title: "Del radar a los auriculares",
        description:
            "Termina 25 discos encontrados en Descubrir.",
        category: "discovery",
        rarity: "epic",
        icon: "🛰️",
        metric: "completedDiscoveryAlbums",
        target: 25,
    }),
    achievement({
        id: "ten-genre-discoveries",
        title: "Con rumbo definido",
        description:
            "Genera 10 descubrimientos por género.",
        category: "discovery",
        rarity: "common",
        icon: "🧩",
        metric: "genreDiscoveryEvents",
        target: 10,
    }),
    achievement({
        id: "fifty-genre-discoveries",
        title: "Especialista",
        description:
            "Genera 50 descubrimientos por género.",
        category: "discovery",
        rarity: "rare",
        icon: "🎛️",
        metric: "genreDiscoveryEvents",
        target: 50,
    }),
    achievement({
        id: "twenty-five-time-machine",
        title: "Crononauta",
        description:
            "Genera 25 descubrimientos con la Máquina del tiempo.",
        category: "discovery",
        rarity: "rare",
        icon: "🕰️",
        metric: "timeMachineEvents",
        target: 25,
    }),
    achievement({
        id: "hundred-time-machine",
        title: "Paradoja musical",
        description:
            "Genera 100 descubrimientos con la Máquina del tiempo.",
        category: "discovery",
        rarity: "legendary",
        icon: "🌀",
        metric: "timeMachineEvents",
        target: 100,
        secret: true,
    }),
    achievement({
        id: "ten-mood-discoveries",
        title: "Estado de ánimo",
        description:
            "Realiza 10 descubrimientos por estado de ánimo.",
        category: "discovery",
        rarity: "rare",
        icon: "🌤️",
        metric: "moodDiscoveryCount",
        target: 10,
    }),
    achievement({
        id: "ten-recommendations-accepted",
        title: "Confío en Audite",
        description:
            "Acepta 10 recomendaciones.",
        category: "discovery",
        rarity: "common",
        icon: "🤝",
        metric: "recommendationsAccepted",
        target: 10,
    }),
    achievement({
        id: "ten-completed-recommendations",
        title: "Audite tenía razón",
        description:
            "Termina 10 discos recomendados por Audite.",
        category: "discovery",
        rarity: "epic",
        icon: "🤖",
        metric: "completedRecommendationAlbums",
        target: 10,
    }),

    /*
     * DECISIONES — 6
     */
    achievement({
        id: "first-abandoned",
        title: "No era para mí",
        description:
            "Deja un disco sin terminar.",
        category: "decisions",
        rarity: "common",
        icon: "⏹️",
        metric: "abandonedAlbums",
        target: 1,
    }),
    achievement({
        id: "ten-abandoned",
        title: "El tiempo también vale",
        description:
            "Deja 10 discos sin terminar.",
        category: "decisions",
        rarity: "rare",
        icon: "🚪",
        metric: "abandonedAlbums",
        target: 10,
    }),
    achievement({
        id: "fifty-rejected",
        title: "Selector exigente",
        description:
            "Rechaza 50 propuestas de Audite.",
        category: "decisions",
        rarity: "rare",
        icon: "🚫",
        metric: "rejectedAlbums",
        target: 50,
    }),
    achievement({
        id: "first-resumed",
        title: "Segunda oportunidad",
        description:
            "Termina un disco después de haberlo pausado.",
        category: "decisions",
        rarity: "rare",
        icon: "▶️",
        metric: "resumedAlbums",
        target: 1,
    }),
    achievement({
        id: "ten-resumed",
        title: "No juzgues tan rápido",
        description:
            "Termina 10 discos después de haberlos pausado.",
        category: "decisions",
        rarity: "epic",
        icon: "🔁",
        metric: "resumedAlbums",
        target: 10,
    }),
    achievement({
        id: "twenty-five-listen-again",
        title: "Volvería mañana",
        description:
            "Marca 25 discos que volverías a escuchar.",
        category: "decisions",
        rarity: "rare",
        icon: "🔂",
        metric: "wouldListenAgainAlbums",
        target: 25,
    }),

    /*
     * PROGRESIÓN — 4
     */
    achievement({
        id: "xp-1000",
        title: "Primeros pasos",
        description: "Alcanza 1.000 XP.",
        category: "progression",
        rarity: "common",
        icon: "⚡",
        metric: "totalXP",
        target: 1000,
    }),
    achievement({
        id: "xp-10000",
        title: "Energía acumulada",
        description: "Alcanza 10.000 XP.",
        category: "progression",
        rarity: "rare",
        icon: "🔋",
        metric: "totalXP",
        target: 10000,
    }),
    achievement({
        id: "xp-50000",
        title: "Leyenda de Audite",
        description: "Alcanza 50.000 XP.",
        category: "progression",
        rarity: "legendary",
        icon: "⚜️",
        metric: "totalXP",
        target: 50000,
        reward: {
            streakShields: 1,
            tripleChoiceTokens: 1,
            label:
                "1 comodín de racha y 1 selección triple",
        },
    }),
    achievement({
        id: "level-25",
        title: "Oyente veterano",
        description:
            "Alcanza el nivel musical 25.",
        category: "progression",
        rarity: "epic",
        icon: "🆙",
        metric: "musicalLevel",
        target: 25,
    }),

    /*
     * JUEGO DIARIO — 4
     */
    achievement({
        id: "first-quote",
        title: "¿Quién dijo eso?",
        description:
            "Responde tu primera cita musical.",
        category: "daily",
        rarity: "common",
        icon: "💬",
        metric: "quoteAnswers",
        target: 1,
    }),
    achievement({
        id: "ten-quotes",
        title: "Atento a las palabras",
        description:
            "Responde 10 citas musicales.",
        category: "daily",
        rarity: "common",
        icon: "🗣️",
        metric: "quoteAnswers",
        target: 10,
    }),
    achievement({
        id: "ten-correct-quotes",
        title: "Memoria musical",
        description:
            "Acierta 10 citas musicales.",
        category: "daily",
        rarity: "rare",
        icon: "🧠",
        metric: "quoteCorrect",
        target: 10,
    }),
    achievement({
        id: "fifty-correct-quotes",
        title: "Sabiduría musical",
        description:
            "Acierta 50 citas musicales.",
        category: "daily",
        rarity: "legendary",
        icon: "🔮",
        metric: "quoteCorrect",
        target: 50,
        reward: {
            tripleChoiceTokens: 1,
            label: "1 selección triple",
        },
    }),
];

export function getAchievementById(id) {
    return achievements.find(
        (achievementItem) =>
            achievementItem.id === id,
    );
}