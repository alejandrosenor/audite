export const XP_REWARDS = {
    albumCompleted: 250,
    albumReviewed: 40,
    favoriteTracks: 25,
    newGenre: 100,

    achievement: {
        common: 50,
        rare: 150,
        epic: 300,
        legendary: 1000,
    },

    dailyChallenge: 250,
    weeklyChallenge: 1200,
};

export function getXPRequiredForLevel(level) {
    if (level <= 1) {
        return 0;
    }

    /*
     * Nivel 2: 500 XP
     * Nivel 3: 1.100 XP
     * Nivel 4: 1.800 XP
     * Nivel 5: 2.600 XP
     */
    const previousLevel = level - 1;

    return (
        500 * previousLevel +
        50 * previousLevel * (previousLevel - 1)
    );
}

export function getLevelFromXP(totalXP = 0) {
    const safeXP = Math.max(
        0,
        Number(totalXP) || 0,
    );

    let level = 1;

    while (
        safeXP >=
        getXPRequiredForLevel(level + 1)
    ) {
        level += 1;
    }

    return level;
}

export function getLevelProgress(totalXP = 0) {
    const safeXP = Math.max(
        0,
        Number(totalXP) || 0,
    );

    const level = getLevelFromXP(safeXP);

    const currentLevelXP =
        getXPRequiredForLevel(level);

    const nextLevelXP =
        getXPRequiredForLevel(level + 1);

    const xpInsideLevel =
        safeXP - currentLevelXP;

    const xpNeededForLevel =
        nextLevelXP - currentLevelXP;

    const percentage =
        xpNeededForLevel > 0
            ? Math.min(
                100,
                Math.max(
                    0,
                    (xpInsideLevel /
                        xpNeededForLevel) *
                    100,
                ),
            )
            : 100;

    return {
        level,
        totalXP: safeXP,
        currentLevelXP,
        nextLevelXP,
        xpInsideLevel,
        xpNeededForLevel,
        xpRemaining:
            nextLevelXP - safeXP,
        percentage,
    };
}

export function getMusicalTitle(level) {
    if (level >= 100) {
        return "Leyenda musical";
    }

    if (level >= 75) {
        return "Crítico musical";
    }

    if (level >= 50) {
        return "Melómano";
    }

    if (level >= 30) {
        return "Coleccionista";
    }

    if (level >= 20) {
        return "Explorador sonoro";
    }

    if (level >= 10) {
        return "Buscador de joyas";
    }

    if (level >= 5) {
        return "Oyente curioso";
    }

    return "Aprendiz musical";
}