export const dailyGenres = [
    {
        id: "shoegaze",
        name: "Shoegaze",
        icon: "🌫️",
        category: "Rock alternativo",
        accent: "#8f7cff",
        description:
            "Guitarras cubiertas de distorsión y reverb, voces etéreas y una sensación de estar escuchando música dentro de un sueño.",
        invitation:
            "Perfecto para desaparecer del mundo durante cuarenta minutos.",
        accessibility: {
            level: "medium",
            label: "Requiere un par de escuchas",
            icon: "🟡",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Distorsión", value: 5 },
            { label: "Melodía", value: 4 },
            { label: "Introspección", value: 5 },
        ],
        moods: ["Soñador", "Nostálgico", "Envolvente"],
        instruments: [
            "Guitarras con reverb",
            "Pedales de efectos",
            "Voces suaves",
            "Batería densa",
        ],
        artists: [
            "Slowdive",
            "My Bloody Valentine",
            "Ride",
            "Lush",
        ],
        starterAlbum: {
            title: "Souvlaki",
            artist: "Slowdive",
            spotifyUrl:
                "https://open.spotify.com/search/Souvlaki%20Slowdive",
        },
        fact:
            "El nombre surgió porque algunos músicos tocaban mirando constantemente hacia sus pedales de efectos.",
        discoverGenre: "shoegaze",
    },
    {
        id: "soul",
        name: "Soul",
        icon: "🫀",
        category: "Música afroamericana",
        accent: "#e58658",
        description:
            "Voces cargadas de emoción, raíces del gospel y ritmos que convierten sentimientos íntimos en canciones enormes.",
        invitation:
            "Ponlo cuando necesites una voz que parezca entender exactamente lo que sientes.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Emoción", value: 5 },
            { label: "Ritmo", value: 4 },
            { label: "Voz", value: 5 },
            { label: "Calidez", value: 5 },
        ],
        moods: ["Apasionado", "Cálido", "Humano"],
        instruments: [
            "Voz protagonista",
            "Órgano",
            "Metales",
            "Bajo rítmico",
        ],
        artists: [
            "Aretha Franklin",
            "Otis Redding",
            "Marvin Gaye",
            "Sam Cooke",
        ],
        starterAlbum: {
            title: "I Never Loved a Man the Way I Love You",
            artist: "Aretha Franklin",
            spotifyUrl:
                "https://open.spotify.com/search/I%20Never%20Loved%20a%20Man%20Aretha%20Franklin",
        },
        fact:
            "El soul nació al combinar la intensidad espiritual del gospel con las estructuras del rhythm and blues.",
        discoverGenre: "soul",
    },
    {
        id: "post-punk",
        name: "Post-punk",
        icon: "⚫",
        category: "Rock alternativo",
        accent: "#8092ab",
        description:
            "La energía del punk convertida en algo más oscuro, inquieto y experimental, con bajos protagonistas y guitarras angulares.",
        invitation:
            "Ideal para caminar de noche sintiéndote dentro de una película.",
        accessibility: {
            level: "medium",
            label: "Accesible con personalidad",
            icon: "🟡",
        },
        traits: [
            { label: "Oscuridad", value: 4 },
            { label: "Ritmo", value: 4 },
            { label: "Experimentación", value: 4 },
            { label: "Energía", value: 4 },
        ],
        moods: ["Nocturno", "Tenso", "Elegante"],
        instruments: [
            "Bajo protagonista",
            "Guitarra angular",
            "Sintetizadores",
            "Batería seca",
        ],
        artists: [
            "Joy Division",
            "The Cure",
            "Siouxsie and the Banshees",
            "Gang of Four",
        ],
        starterAlbum: {
            title: "Unknown Pleasures",
            artist: "Joy Division",
            spotifyUrl:
                "https://open.spotify.com/search/Unknown%20Pleasures%20Joy%20Division",
        },
        fact:
            "Más que un sonido cerrado, el post-punk fue una actitud: usar la libertad del punk para experimentar.",
        discoverGenre: "post-punk",
    },
    {
        id: "bossa-nova",
        name: "Bossa nova",
        icon: "🌊",
        category: "Música brasileña",
        accent: "#65b99b",
        description:
            "Samba convertida en susurro: guitarras delicadas, armonías de jazz y una calma luminosa que parece venir del mar.",
        invitation:
            "Escúchala al atardecer, con una ventana abierta y ninguna prisa.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Calma", value: 5 },
            { label: "Armonía", value: 5 },
            { label: "Ritmo", value: 3 },
            { label: "Elegancia", value: 5 },
        ],
        moods: ["Sereno", "Luminoso", "Íntimo"],
        instruments: [
            "Guitarra nylon",
            "Voz suave",
            "Percusión ligera",
            "Piano",
        ],
        artists: [
            "João Gilberto",
            "Antônio Carlos Jobim",
            "Astrud Gilberto",
            "Nara Leão",
        ],
        starterAlbum: {
            title: "Getz/Gilberto",
            artist: "Stan Getz & João Gilberto",
            spotifyUrl:
                "https://open.spotify.com/search/Getz%20Gilberto",
        },
        fact:
            "La palabra bossa se utilizaba en Brasil para describir una manera especial o diferente de hacer algo.",
        discoverGenre: "bossa nova",
    },
    {
        id: "trip-hop",
        name: "Trip hop",
        icon: "🌃",
        category: "Electrónica",
        accent: "#7d6b91",
        description:
            "Bases lentas de hip hop, electrónica oscura, soul y atmósferas cinematográficas nacidas para la madrugada.",
        invitation:
            "Perfecto para conducir de noche o quedarte pensando mientras la ciudad duerme.",
        accessibility: {
            level: "easy",
            label: "Accesible y atmosférico",
            icon: "🟢",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Ritmo", value: 3 },
            { label: "Oscuridad", value: 4 },
            { label: "Textura", value: 5 },
        ],
        moods: ["Nocturno", "Hipnótico", "Melancólico"],
        instruments: [
            "Samples",
            "Breakbeats lentos",
            "Sintetizadores",
            "Voces soul",
        ],
        artists: [
            "Massive Attack",
            "Portishead",
            "Tricky",
            "Morcheeba",
        ],
        starterAlbum: {
            title: "Dummy",
            artist: "Portishead",
            spotifyUrl:
                "https://open.spotify.com/search/Dummy%20Portishead",
        },
        fact:
            "El término se asocia especialmente a la escena de Bristol de comienzos de los años noventa.",
        discoverGenre: "trip hop",
    },
    {
        id: "americana",
        name: "Americana",
        icon: "🏜️",
        category: "Country y folk",
        accent: "#b98052",
        description:
            "Una mezcla de country, folk, blues y rock de raíces que suena a madera, carretera y historias vividas.",
        invitation:
            "Para viajes largos, paisajes abiertos y canciones que parecen recuerdos.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Narrativa", value: 5 },
            { label: "Calidez", value: 5 },
            { label: "Acústico", value: 4 },
            { label: "Melodía", value: 4 },
        ],
        moods: ["Terrenal", "Nostálgico", "Honesto"],
        instruments: [
            "Guitarra acústica",
            "Pedal steel",
            "Mandolina",
            "Armónica",
        ],
        artists: [
            "Jason Isbell",
            "Emmylou Harris",
            "Wilco",
            "Lucinda Williams",
        ],
        starterAlbum: {
            title: "Southeastern",
            artist: "Jason Isbell",
            spotifyUrl:
                "https://open.spotify.com/search/Southeastern%20Jason%20Isbell",
        },
        fact:
            "Americana no describe una única tradición, sino el punto de encuentro de varias músicas de raíces estadounidenses.",
        discoverGenre: "americana",
    },
    {
        id: "jazz-fusion",
        name: "Jazz fusion",
        icon: "⚡",
        category: "Jazz",
        accent: "#d56565",
        description:
            "Improvisación de jazz conectada a la electricidad del rock, el funk y los sintetizadores.",
        invitation:
            "Para cuando quieras músicos tocando al límite de lo humanamente posible.",
        accessibility: {
            level: "hard",
            label: "Género para valientes",
            icon: "🔴",
        },
        traits: [
            { label: "Virtuosismo", value: 5 },
            { label: "Complejidad", value: 5 },
            { label: "Energía", value: 5 },
            { label: "Improvisación", value: 5 },
        ],
        moods: ["Eléctrico", "Intenso", "Imprevisible"],
        instruments: [
            "Piano eléctrico",
            "Sintetizadores",
            "Bajo eléctrico",
            "Metales",
        ],
        artists: [
            "Miles Davis",
            "Weather Report",
            "Mahavishnu Orchestra",
            "Return to Forever",
        ],
        starterAlbum: {
            title: "Heavy Weather",
            artist: "Weather Report",
            spotifyUrl:
                "https://open.spotify.com/search/Heavy%20Weather%20Weather%20Report",
        },
        fact:
            "A finales de los sesenta muchos músicos de jazz comenzaron a usar instrumentos eléctricos y ritmos del rock.",
        discoverGenre: "jazz fusion",
    },
    {
        id: "dream-pop",
        name: "Dream pop",
        icon: "☁️",
        category: "Pop alternativo",
        accent: "#95a5df",
        description:
            "Pop nebuloso y emocional, lleno de ecos, melodías flotantes y voces que se mezclan con la instrumentación.",
        invitation:
            "Para mirar por la ventana y convertir cualquier momento corriente en una escena de cine.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Suavidad", value: 5 },
            { label: "Ritmo", value: 2 },
        ],
        moods: ["Etéreo", "Romántico", "Nostálgico"],
        instruments: [
            "Sintetizadores",
            "Guitarras con chorus",
            "Voces etéreas",
            "Cajas de ritmos",
        ],
        artists: [
            "Cocteau Twins",
            "Beach House",
            "Mazzy Star",
            "Cigarettes After Sex",
        ],
        starterAlbum: {
            title: "Heaven or Las Vegas",
            artist: "Cocteau Twins",
            spotifyUrl:
                "https://open.spotify.com/search/Heaven%20or%20Las%20Vegas",
        },
        fact:
            "En muchos discos de dream pop, la voz importa tanto por su textura como por las palabras que canta.",
        discoverGenre: "dream pop",
    },
];

function getMadridDateKey() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Madrid",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

function createHash(value) {
    return value
        .split("")
        .reduce(
            (total, character, index) =>
                total +
                character.charCodeAt(0) * (index + 1),
            0,
        );
}

export function getGenreOfTheDay() {
    if (!dailyGenres.length) {
        return null;
    }

    const dateKey = getMadridDateKey();
    const index =
        createHash(`audite-${dateKey}`) %
        dailyGenres.length;

    return {
        ...dailyGenres[index],
        dateKey,
    };
}