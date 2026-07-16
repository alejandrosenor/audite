export function getGenreLevel(
    genreXP = 0,
) {
    const safeXP = Math.max(
        0,
        Number(genreXP) || 0,
    );

    /*
     * Cada nivel requiere más experiencia:
     *
     * Nivel 1: 0
     * Nivel 2: 300
     * Nivel 3: 750
     * Nivel 4: 1.350
     * Nivel 5: 2.100
     */
    let level = 1;
    let requiredXP = 0;

    while (true) {
        const nextRequirement =
            requiredXP +
            150 +
            level * 150;

        if (safeXP < nextRequirement) {
            break;
        }

        requiredXP =
            nextRequirement;

        level += 1;
    }

    return level;
}

export function getGenreLevelProgress(
    genreXP = 0,
) {
    const safeXP = Math.max(
        0,
        Number(genreXP) || 0,
    );

    let level = 1;
    let currentLevelStart = 0;
    let nextLevelStart = 300;

    while (
        safeXP >= nextLevelStart
    ) {
        currentLevelStart =
            nextLevelStart;

        level += 1;

        nextLevelStart +=
            150 +
            level * 150;
    }

    const xpInsideLevel =
        safeXP - currentLevelStart;

    const xpForNextLevel =
        nextLevelStart -
        currentLevelStart;

    return {
        level,
        totalXP: safeXP,
        xpInsideLevel,
        xpForNextLevel,
        xpRemaining:
            nextLevelStart - safeXP,

        percentage:
            xpForNextLevel > 0
                ? Math.min(
                    100,
                    (
                        xpInsideLevel /
                        xpForNextLevel
                    ) * 100,
                )
                : 100,
    };
}

export function getGenreRank(level) {
    if (level >= 20) {
        return "Maestro";
    }

    if (level >= 15) {
        return "Experto";
    }

    if (level >= 10) {
        return "Especialista";
    }

    if (level >= 6) {
        return "Entusiasta";
    }

    if (level >= 3) {
        return "Aficionado";
    }

    return "Curioso";
}

export function getGenreIcon(
    genre = "",
) {
    const value =
        genre.toLowerCase();

    if (
        value.includes("rock") ||
        value.includes("grunge") ||
        value.includes("punk")
    ) {
        return "🎸";
    }

    if (
        value.includes("jazz")
    ) {
        return "🎷";
    }

    if (
        value.includes("pop")
    ) {
        return "🎤";
    }

    if (
        value.includes("metal")
    ) {
        return "🤘";
    }

    if (
        value.includes("folk") ||
        value.includes("country") ||
        value.includes("americana")
    ) {
        return "🪕";
    }

    if (
        value.includes("electronic") ||
        value.includes("house") ||
        value.includes("techno") ||
        value.includes("ambient")
    ) {
        return "🎛️";
    }

    if (
        value.includes("soul") ||
        value.includes("r&b") ||
        value.includes("funk")
    ) {
        return "🫀";
    }

    if (
        value.includes("flamenco")
    ) {
        return "💃";
    }

    if (
        value.includes("classical") ||
        value.includes("baroque") ||
        value.includes("orchestra")
    ) {
        return "🎻";
    }

    if (
        value.includes("hip hop") ||
        value.includes("rap")
    ) {
        return "🎧";
    }

    return "🎵";
}

export function formatGenreName(
    genre = "",
) {
    return genre
        .split(" ")
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1),
        )
        .join(" ");
}