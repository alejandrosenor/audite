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

export const achievements = [
    {
        id: "first-album",
        title: "Primera aguja",
        description: "Termina tu primer disco.",
        rarity: "common",
        icon: "💿",
        metric: "completedAlbums",
        target: 1,
    },
    {
        id: "first-review",
        title: "Opinión formada",
        description: "Valora tu primer álbum.",
        rarity: "common",
        icon: "⭐",
        metric: "ratedAlbums",
        target: 1,
    },
    {
        id: "first-favorites",
        title: "Buen oído",
        description:
            "Guarda tus primeras canciones top.",
        rarity: "common",
        icon: "🎵",
        metric: "favoriteTracks",
        target: 1,
    },
    {
        id: "first-abandoned",
        title: "No era para mí",
        description:
            "Deja un disco sin terminar.",
        rarity: "common",
        icon: "⏹️",
        metric: "abandonedAlbums",
        target: 1,
    },
    {
        id: "three-day-streak",
        title: "Una semana empieza por un día",
        description:
            "Alcanza una racha de 3 días.",
        rarity: "common",
        icon: "🔥",
        metric: "bestStreak",
        target: 3,
    },
    {
        id: "three-genres",
        title: "Explorador novato",
        description:
            "Escucha discos de 3 géneros diferentes.",
        rarity: "common",
        icon: "🧭",
        metric: "uniqueGenres",
        target: 3,
    },

    {
        id: "seven-day-streak",
        title: "Semana perfecta",
        description:
            "Mantén una racha de 7 días.",
        rarity: "rare",
        icon: "📅",
        metric: "bestStreak",
        target: 7,
    },
    {
        id: "twenty-five-albums",
        title: "Coleccionista",
        description:
            "Termina 25 discos.",
        rarity: "rare",
        icon: "🗄️",
        metric: "completedAlbums",
        target: 25,
    },
    {
        id: "five-decades",
        title: "Viajero temporal",
        description:
            "Escucha discos de 5 décadas distintas.",
        rarity: "rare",
        icon: "⏳",
        metric: "uniqueDecades",
        target: 5,
    },
    {
        id: "ten-genres",
        title: "Eclecticismo",
        description:
            "Escucha discos de 10 géneros distintos.",
        rarity: "rare",
        icon: "🌈",
        metric: "uniqueGenres",
        target: 10,
    },
    {
        id: "ten-reviews",
        title: "Crítico musical",
        description:
            "Escribe 10 reseñas personales.",
        rarity: "rare",
        icon: "✍️",
        metric: "writtenReviews",
        target: 10,
    },
    {
        id: "fifty-favorites",
        title: "Cara A, cara B",
        description:
            "Guarda 50 canciones top.",
        rarity: "rare",
        icon: "🎶",
        metric: "favoriteTracks",
        target: 50,
    },

    {
        id: "thirty-day-streak",
        title: "Mes de oro",
        description:
            "Mantén una racha de 30 días.",
        rarity: "epic",
        icon: "🌕",
        metric: "bestStreak",
        target: 30,
    },
    {
        id: "hundred-albums",
        title: "Discoteca personal",
        description:
            "Termina 100 discos.",
        rarity: "epic",
        icon: "🏛️",
        metric: "completedAlbums",
        target: 100,
    },
    {
        id: "thirty-genres",
        title: "Sin fronteras",
        description:
            "Escucha 30 géneros distintos.",
        rarity: "epic",
        icon: "🌍",
        metric: "uniqueGenres",
        target: 30,
    },
    {
        id: "twenty-old-albums",
        title: "Arqueólogo musical",
        description:
            "Termina 20 discos anteriores a 1970.",
        rarity: "epic",
        icon: "🏺",
        metric: "pre1970Albums",
        target: 20,
    },
    {
        id: "twenty-high-genres",
        title: "Corazón abierto",
        description:
            "Puntúa con 8 o más discos de 20 géneros diferentes.",
        rarity: "epic",
        icon: "💜",
        metric: "highRatedGenres",
        target: 20,
    },

    {
        id: "hundred-day-streak",
        title: "Cien días de música",
        description:
            "Mantén una racha de 100 días.",
        rarity: "legendary",
        icon: "🔥",
        metric: "bestStreak",
        target: 100,
        reward: {
            streakShields: 1,
            label: "1 comodín de racha",
        },
    },
    {
        id: "three-hundred-sixty-five-albums",
        title: "El año del oyente",
        description:
            "Termina 365 discos.",
        rarity: "legendary",
        icon: "🗓️",
        metric: "completedAlbums",
        target: 365,
        reward: {
            streakShields: 2,
            label: "2 comodines de racha",
        },
    },
    {
        id: "seventy-five-genres",
        title: "Enciclopedia musical",
        description:
            "Escucha 75 géneros diferentes.",
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
    },
    {
        id: "thousand-albums",
        title: "Mil discos después",
        description:
            "Termina 1.000 discos.",
        rarity: "legendary",
        icon: "👑",
        metric: "completedAlbums",
        target: 1000,
        reward: {
            streakShields: 3,
            frame: "thousand-albums",
            label:
                "3 comodines y marco legendario",
        },
    },
];

export function getAchievementById(id) {
    return achievements.find(
        (achievement) => achievement.id === id,
    );
}