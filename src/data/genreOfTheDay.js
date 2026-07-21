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
    {
        id: "classic-rock",
        name: "Classic Rock",
        icon: "🎸",
        category: "Rock",
        accent: "#c86c3b",
        description:
            "El sonido que definió el rock durante las décadas de los sesenta y setenta: guitarras memorables, grandes riffs y canciones que siguen llenando estadios décadas después.",
        invitation:
            "Si quieres entender por qué el rock conquistó el mundo, empieza aquí.",
        accessibility: {
            level: "easy",
            label: "Perfecto para empezar",
            icon: "🟢",
        },
        traits: [
            { label: "Riffs", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Energía", value: 4 },
            { label: "Legado", value: 5 },
        ],
        moods: [
            "Épico",
            "Enérgico",
            "Atemporal",
        ],
        instruments: [
            "Guitarra eléctrica",
            "Bajo",
            "Batería",
            "Voz potente",
        ],
        artists: [
            "Led Zeppelin",
            "The Rolling Stones",
            "The Who",
            "Creedence Clearwater Revival",
        ],
        starterAlbum: {
            title: "Led Zeppelin IV",
            artist: "Led Zeppelin",
            spotifyUrl:
                "https://open.spotify.com/search/Led%20Zeppelin%20IV",
        },
        fact:
            "Muchas de las canciones más famosas de la historia pertenecen al llamado classic rock y siguen sonando en radios de todo el mundo.",
        discoverGenre: "classic rock",
    },

    {
        id: "progressive-rock",
        name: "Progressive Rock",
        icon: "🌀",
        category: "Rock",
        accent: "#7366d8",
        description:
            "Canciones largas, cambios de ritmo, virtuosismo y una ambición artística que llevó al rock mucho más allá del formato tradicional.",
        invitation:
            "Ideal cuando te apetece escuchar un álbum como si fuera una película.",
        accessibility: {
            level: "hard",
            label: "Requiere atención",
            icon: "🔴",
        },
        traits: [
            { label: "Complejidad", value: 5 },
            { label: "Virtuosismo", value: 5 },
            { label: "Creatividad", value: 5 },
            { label: "Melodía", value: 4 },
        ],
        moods: [
            "Hipnótico",
            "Épico",
            "Explorador",
        ],
        instruments: [
            "Sintetizadores",
            "Guitarras",
            "Bajo",
            "Batería técnica",
        ],
        artists: [
            "Pink Floyd",
            "Yes",
            "Genesis",
            "King Crimson",
        ],
        starterAlbum: {
            title: "The Dark Side of the Moon",
            artist: "Pink Floyd",
            spotifyUrl:
                "https://open.spotify.com/search/The%20Dark%20Side%20of%20the%20Moon",
        },
        fact:
            "Muchas bandas de rock progresivo construían álbumes conceptuales donde todas las canciones formaban una única obra.",
        discoverGenre: "progressive rock",
    },

    {
        id: "arena-rock",
        name: "Arena Rock",
        icon: "🏟️",
        category: "Rock",
        accent: "#d65454",
        description:
            "Himnos enormes, estribillos irresistibles y guitarras pensadas para que miles de personas las canten al unísono.",
        invitation:
            "Sube el volumen. Este género nació para los estadios.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Estribillos", value: 5 },
            { label: "Energía", value: 5 },
            { label: "Guitarras", value: 4 },
            { label: "Épica", value: 5 },
        ],
        moods: [
            "Triunfal",
            "Eufórico",
            "Potente",
        ],
        instruments: [
            "Guitarras eléctricas",
            "Batería",
            "Coros",
            "Teclados",
        ],
        artists: [
            "Bon Jovi",
            "Journey",
            "Foreigner",
            "Boston",
        ],
        starterAlbum: {
            title: "Escape",
            artist: "Journey",
            spotifyUrl:
                "https://open.spotify.com/search/Escape%20Journey",
        },
        fact:
            "Muchos himnos deportivos actuales nacieron como canciones de arena rock.",
        discoverGenre: "arena rock",
    },
    {
        id: "blues-rock",
        name: "Blues Rock",
        icon: "🎼",
        category: "Rock",
        accent: "#5d86c5",
        description:
            "La fuerza del rock unida al sentimiento del blues. Guitarras expresivas, solos intensos y una enorme carga emocional.",
        invitation:
            "Si te gustan los grandes solos de guitarra, este género te atrapará desde el primer minuto.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Guitarra", value: 5 },
            { label: "Emoción", value: 5 },
            { label: "Improvisación", value: 4 },
            { label: "Energía", value: 4 },
        ],
        moods: ["Apasionado", "Intenso", "Auténtico"],
        instruments: [
            "Guitarra eléctrica",
            "Armónica",
            "Bajo",
            "Batería",
        ],
        artists: [
            "Stevie Ray Vaughan",
            "Gary Moore",
            "Joe Bonamassa",
            "The Black Keys",
        ],
        starterAlbum: {
            title: "Texas Flood",
            artist: "Stevie Ray Vaughan",
            spotifyUrl:
                "https://open.spotify.com/search/Texas%20Flood%20Stevie%20Ray%20Vaughan",
        },
        fact:
            "Muchos guitarristas legendarios comenzaron tocando blues antes de acercarse al rock.",
        discoverGenre: "blues rock",
    },

    {
        id: "glam-rock",
        name: "Glam Rock",
        icon: "✨",
        category: "Rock",
        accent: "#d86dc7",
        description:
            "Rock teatral, extravagante y lleno de personalidad. Tan importante era la imagen como las canciones.",
        invitation:
            "Déjate llevar por el espectáculo. Aquí la música también se viste para brillar.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Carisma", value: 5 },
            { label: "Melodía", value: 4 },
            { label: "Energía", value: 4 },
            { label: "Espectáculo", value: 5 },
        ],
        moods: ["Divertido", "Extravagante", "Brillante"],
        instruments: [
            "Guitarras",
            "Piano",
            "Coros",
            "Batería",
        ],
        artists: [
            "David Bowie",
            "T. Rex",
            "Sweet",
            "Roxy Music",
        ],
        starterAlbum: {
            title: "The Rise and Fall of Ziggy Stardust",
            artist: "David Bowie",
            spotifyUrl:
                "https://open.spotify.com/search/Ziggy%20Stardust%20David%20Bowie",
        },
        fact:
            "El glam rock revolucionó la estética del rock durante los años setenta con maquillaje, brillo y personajes inolvidables.",
        discoverGenre: "glam rock",
    },

    {
        id: "hard-rock",
        name: "Hard Rock",
        icon: "⚡",
        category: "Rock",
        accent: "#cf4d3b",
        description:
            "Riffs contundentes, baterías poderosas y voces llenas de fuerza. El punto de encuentro entre el rock clásico y el heavy metal.",
        invitation:
            "Perfecto cuando necesitas energía y guitarras a todo volumen.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Potencia", value: 5 },
            { label: "Riffs", value: 5 },
            { label: "Velocidad", value: 3 },
            { label: "Melodía", value: 4 },
        ],
        moods: ["Potente", "Rebelde", "Explosivo"],
        instruments: [
            "Guitarras eléctricas",
            "Batería",
            "Bajo",
            "Voz rasgada",
        ],
        artists: [
            "AC/DC",
            "Aerosmith",
            "Deep Purple",
            "Whitesnake",
        ],
        starterAlbum: {
            title: "Back in Black",
            artist: "AC/DC",
            spotifyUrl:
                "https://open.spotify.com/search/Back%20in%20Black%20ACDC",
        },
        fact:
            "Back in Black es uno de los discos más vendidos de toda la historia de la música.",
        discoverGenre: "hard rock",
    },

    {
        id: "power-pop",
        name: "Power Pop",
        icon: "🍭",
        category: "Pop Rock",
        accent: "#ffb347",
        description:
            "Canciones cortas, guitarras brillantes y estribillos irresistibles que se quedan en la cabeza durante días.",
        invitation:
            "Si disfrutas de los grandes himnos pop con guitarras, aquí te sentirás como en casa.",
        accessibility: {
            level: "easy",
            label: "Perfecto para empezar",
            icon: "🟢",
        },
        traits: [
            { label: "Melodía", value: 5 },
            { label: "Estribillos", value: 5 },
            { label: "Energía", value: 4 },
            { label: "Optimismo", value: 5 },
        ],
        moods: ["Feliz", "Luminoso", "Enérgico"],
        instruments: [
            "Guitarras",
            "Coros",
            "Bajo",
            "Batería",
        ],
        artists: [
            "Big Star",
            "Cheap Trick",
            "The Cars",
            "Fountains of Wayne",
        ],
        starterAlbum: {
            title: "#1 Record",
            artist: "Big Star",
            spotifyUrl:
                "https://open.spotify.com/search/Big%20Star%20Number%201%20Record",
        },
        fact:
            "Aunque nunca fue un género masivo, ha influido en innumerables bandas de pop y rock.",
        discoverGenre: "power pop",
    },
    {
        id: "synth-pop",
        name: "Synth Pop",
        icon: "🎹",
        category: "Pop electrónico",
        accent: "#6f8cff",
        description:
            "Melodías pegadizas construidas sobre sintetizadores brillantes, cajas de ritmos y una estética futurista nacida en los años ochenta.",
        invitation:
            "Si alguna vez has tarareado un éxito de los ochenta, seguramente ya has disfrutado del synth pop.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Melodía", value: 5 },
            { label: "Sintetizadores", value: 5 },
            { label: "Ritmo", value: 4 },
            { label: "Nostalgia", value: 5 },
        ],
        moods: [
            "Luminoso",
            "Nostálgico",
            "Bailable",
        ],
        instruments: [
            "Sintetizadores",
            "Cajas de ritmos",
            "Teclados",
            "Bajo eléctrico",
        ],
        artists: [
            "Depeche Mode",
            "Pet Shop Boys",
            "A-ha",
            "New Order",
        ],
        starterAlbum: {
            title: "Violator",
            artist: "Depeche Mode",
            spotifyUrl:
                "https://open.spotify.com/search/Violator%20Depeche%20Mode",
        },
        fact:
            "El synth pop ayudó a convertir el sintetizador en uno de los instrumentos más importantes de la música moderna.",
        discoverGenre: "synth pop",
    },

    {
        id: "indie-folk",
        name: "Indie Folk",
        icon: "🌲",
        category: "Folk alternativo",
        accent: "#8c9d55",
        description:
            "Canciones íntimas donde las guitarras acústicas, las armonías vocales y las letras personales son las verdaderas protagonistas.",
        invitation:
            "Perfecto para una tarde tranquila o un viaje por carretera al atardecer.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Acústico", value: 5 },
            { label: "Calidez", value: 5 },
            { label: "Emoción", value: 4 },
            { label: "Narrativa", value: 5 },
        ],
        moods: [
            "Íntimo",
            "Natural",
            "Melancólico",
        ],
        instruments: [
            "Guitarra acústica",
            "Banjo",
            "Mandolina",
            "Voces armonizadas",
        ],
        artists: [
            "Fleet Foxes",
            "Bon Iver",
            "The Paper Kites",
            "The Lumineers",
        ],
        starterAlbum: {
            title: "Fleet Foxes",
            artist: "Fleet Foxes",
            spotifyUrl:
                "https://open.spotify.com/search/Fleet%20Foxes%20Fleet%20Foxes",
        },
        fact:
            "El indie folk vivió un enorme auge durante los años 2000 gracias a la mezcla de tradición y sensibilidad moderna.",
        discoverGenre: "indie folk",
    },

    {
        id: "funk",
        name: "Funk",
        icon: "🕺",
        category: "Soul y Funk",
        accent: "#d38b1f",
        description:
            "Bajos irresistibles, guitarras rítmicas y un groove capaz de hacer mover los pies incluso a quien dice que no sabe bailar.",
        invitation:
            "Si el ritmo manda sobre todo lo demás, estás escuchando funk.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Groove", value: 5 },
            { label: "Ritmo", value: 5 },
            { label: "Bajo", value: 5 },
            { label: "Energía", value: 4 },
        ],
        moods: [
            "Festivo",
            "Bailable",
            "Positivo",
        ],
        instruments: [
            "Bajo eléctrico",
            "Guitarra rítmica",
            "Metales",
            "Batería",
        ],
        artists: [
            "James Brown",
            "Parliament",
            "Prince",
            "Sly & The Family Stone",
        ],
        starterAlbum: {
            title: "Sex Machine",
            artist: "James Brown",
            spotifyUrl:
                "https://open.spotify.com/search/Sex%20Machine%20James%20Brown",
        },
        fact:
            "En el funk el bajo suele convertirse en el instrumento más importante de toda la banda.",
        discoverGenre: "funk",
    },

    {
        id: "cool-jazz",
        name: "Cool Jazz",
        icon: "🎷",
        category: "Jazz",
        accent: "#6ea7c7",
        description:
            "La cara más relajada del jazz: melodías elegantes, improvisaciones contenidas y un sonido refinado que invita a escuchar con calma.",
        invitation:
            "Ideal para una noche tranquila, un libro o una conversación sin prisas.",
        accessibility: {
            level: "medium",
            label: "Muy agradable para iniciarse",
            icon: "🟡",
        },
        traits: [
            { label: "Elegancia", value: 5 },
            { label: "Improvisación", value: 4 },
            { label: "Calma", value: 5 },
            { label: "Armonía", value: 5 },
        ],
        moods: [
            "Relajado",
            "Sofisticado",
            "Nocturno",
        ],
        instruments: [
            "Saxofón",
            "Trompeta",
            "Contrabajo",
            "Piano",
        ],
        artists: [
            "Miles Davis",
            "Chet Baker",
            "Dave Brubeck",
            "Gerry Mulligan",
        ],
        starterAlbum: {
            title: "Kind of Blue",
            artist: "Miles Davis",
            spotifyUrl:
                "https://open.spotify.com/search/Kind%20of%20Blue%20Miles%20Davis",
        },
        fact:
            "Aunque 'Kind of Blue' también abrió la puerta al jazz modal, es uno de los discos más recomendados para descubrir el jazz.",
        discoverGenre: "cool jazz",
    },
    {
        id: "bebop",
        name: "Bebop",
        icon: "🎺",
        category: "Jazz",
        accent: "#c96f4b",
        description:
            "Jazz rápido, complejo y lleno de improvisaciones vertiginosas, creado para escuchar con atención más que para bailar.",
        invitation:
            "Ideal para descubrir hasta dónde puede llegar una conversación entre músicos.",
        accessibility: {
            level: "hard",
            label: "Requiere atención",
            icon: "🔴",
        },
        traits: [
            { label: "Improvisación", value: 5 },
            { label: "Velocidad", value: 5 },
            { label: "Complejidad", value: 5 },
            { label: "Virtuosismo", value: 5 },
        ],
        moods: ["Inquieto", "Intelectual", "Eléctrico"],
        instruments: [
            "Saxofón",
            "Trompeta",
            "Contrabajo",
            "Batería",
        ],
        artists: [
            "Charlie Parker",
            "Dizzy Gillespie",
            "Thelonious Monk",
            "Bud Powell",
        ],
        starterAlbum: {
            title: "Bird and Diz",
            artist: "Charlie Parker & Dizzy Gillespie",
            spotifyUrl:
                "https://open.spotify.com/search/Bird%20and%20Diz%20Charlie%20Parker",
        },
        fact:
            "El bebop surgió en los años cuarenta como una alternativa más libre y exigente frente al jazz de las grandes orquestas.",
        discoverGenre: "bebop",
    },

    {
        id: "vocal-jazz",
        name: "Vocal Jazz",
        icon: "🎙️",
        category: "Jazz",
        accent: "#b66d7e",
        description:
            "La elegancia del jazz llevada a la voz, con interpretaciones íntimas, fraseos flexibles y melodías que parecen contarse al oído.",
        invitation:
            "Perfecto para una cena tranquila, una noche de lluvia o una copa sin prisas.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Voz", value: 5 },
            { label: "Elegancia", value: 5 },
            { label: "Emoción", value: 4 },
            { label: "Improvisación", value: 4 },
        ],
        moods: ["Íntimo", "Romántico", "Nocturno"],
        instruments: [
            "Voz protagonista",
            "Piano",
            "Contrabajo",
            "Batería con escobillas",
        ],
        artists: [
            "Ella Fitzgerald",
            "Billie Holiday",
            "Sarah Vaughan",
            "Nina Simone",
        ],
        starterAlbum: {
            title: "Ella and Louis",
            artist: "Ella Fitzgerald & Louis Armstrong",
            spotifyUrl:
                "https://open.spotify.com/search/Ella%20and%20Louis",
        },
        fact:
            "El scat permite improvisar con la voz utilizando sílabas sin significado como si fuera un instrumento.",
        discoverGenre: "vocal jazz",
    },

    {
        id: "ambient",
        name: "Ambient",
        icon: "🌌",
        category: "Electrónica",
        accent: "#6f91a8",
        description:
            "Música construida con texturas, espacios y sonidos lentos que busca crear una atmósfera más que exigir toda tu atención.",
        invitation:
            "Déjala sonar mientras lees, piensas o simplemente observas cómo pasa el tiempo.",
        accessibility: {
            level: "medium",
            label: "Requiere entrar en su ambiente",
            icon: "🟡",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Calma", value: 5 },
            { label: "Ritmo", value: 1 },
            { label: "Textura", value: 5 },
        ],
        moods: ["Meditativo", "Flotante", "Sereno"],
        instruments: [
            "Sintetizadores",
            "Drones",
            "Grabaciones de campo",
            "Piano procesado",
        ],
        artists: [
            "Brian Eno",
            "Stars of the Lid",
            "Tim Hecker",
            "William Basinski",
        ],
        starterAlbum: {
            title: "Ambient 1: Music for Airports",
            artist: "Brian Eno",
            spotifyUrl:
                "https://open.spotify.com/search/Ambient%201%20Music%20for%20Airports",
        },
        fact:
            "Brian Eno describió la música ambient como un sonido capaz de ser tan ignorable como interesante.",
        discoverGenre: "ambient",
    },

    {
        id: "bluegrass",
        name: "Bluegrass",
        icon: "🪕",
        category: "Country y folk",
        accent: "#9a814d",
        description:
            "Música acústica veloz y virtuosa, llena de banjos, mandolinas, violines y armonías vocales nacidas en los Apalaches.",
        invitation:
            "Perfecto para sentir la energía de una banda tocando alrededor de una misma hoguera.",
        accessibility: {
            level: "medium",
            label: "Accesible y muy particular",
            icon: "🟡",
        },
        traits: [
            { label: "Virtuosismo", value: 5 },
            { label: "Velocidad", value: 5 },
            { label: "Acústico", value: 5 },
            { label: "Tradición", value: 5 },
        ],
        moods: ["Rústico", "Animado", "Terrenal"],
        instruments: [
            "Banjo",
            "Mandolina",
            "Violín",
            "Contrabajo",
        ],
        artists: [
            "Bill Monroe",
            "Flatt & Scruggs",
            "Alison Krauss",
            "Billy Strings",
        ],
        starterAlbum: {
            title: "Will the Circle Be Unbroken",
            artist: "Nitty Gritty Dirt Band",
            spotifyUrl:
                "https://open.spotify.com/search/Will%20the%20Circle%20Be%20Unbroken",
        },
        fact:
            "El nombre procede de la banda de Bill Monroe, The Blue Grass Boys, considerada fundamental para el nacimiento del género.",
        discoverGenre: "bluegrass",
    },

    {
        id: "sunshine-pop",
        name: "Sunshine Pop",
        icon: "☀️",
        category: "Pop",
        accent: "#efb94f",
        description:
            "Pop luminoso de armonías vocales, arreglos delicados y melodías que parecen hechas para una tarde de verano.",
        invitation:
            "Ponlo cuando necesites añadir un poco de sol a un día corriente.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Melodía", value: 5 },
            { label: "Luminosidad", value: 5 },
            { label: "Armonías", value: 5 },
            { label: "Suavidad", value: 4 },
        ],
        moods: ["Feliz", "Soleado", "Nostálgico"],
        instruments: [
            "Guitarras limpias",
            "Coros",
            "Cuerdas",
            "Piano",
        ],
        artists: [
            "The Mamas & the Papas",
            "The Association",
            "The Free Design",
            "Sagittarius",
        ],
        starterAlbum: {
            title: "Present Tense",
            artist: "Sagittarius",
            spotifyUrl:
                "https://open.spotify.com/search/Present%20Tense%20Sagittarius",
        },
        fact:
            "El sunshine pop floreció en California durante los años sesenta y convirtió los arreglos vocales en su mayor seña de identidad.",
        discoverGenre: "sunshine pop",
    },

    {
        id: "chamber-pop",
        name: "Chamber Pop",
        icon: "🎻",
        category: "Pop alternativo",
        accent: "#9b7b9e",
        description:
            "Pop sofisticado enriquecido con cuerdas, vientos y arreglos propios de la música de cámara.",
        invitation:
            "Para cuando quieras canciones accesibles vestidas con una elegancia extraordinaria.",
        accessibility: {
            level: "medium",
            label: "Accesible y detallista",
            icon: "🟡",
        },
        traits: [
            { label: "Arreglos", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Elegancia", value: 5 },
            { label: "Complejidad", value: 4 },
        ],
        moods: ["Elegante", "Romántico", "Cinematográfico"],
        instruments: [
            "Violines",
            "Violonchelo",
            "Piano",
            "Instrumentos de viento",
        ],
        artists: [
            "The Divine Comedy",
            "Belle and Sebastian",
            "Rufus Wainwright",
            "Sufjan Stevens",
        ],
        starterAlbum: {
            title: "Illinois",
            artist: "Sufjan Stevens",
            spotifyUrl:
                "https://open.spotify.com/search/Illinois%20Sufjan%20Stevens",
        },
        fact:
            "El chamber pop recuperó la ambición orquestal del pop de los sesenta dentro de escenas independientes posteriores.",
        discoverGenre: "chamber pop",
    },

    {
        id: "motown",
        name: "Motown",
        icon: "🥁",
        category: "Soul y R&B",
        accent: "#d76855",
        description:
            "Soul elegante, bailable y lleno de melodías inolvidables, creado para llevar la música afroamericana a públicos masivos.",
        invitation:
            "Perfecto para descubrir canciones clásicas que todavía suenan frescas y contagiosas.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Melodía", value: 5 },
            { label: "Ritmo", value: 5 },
            { label: "Voz", value: 5 },
            { label: "Elegancia", value: 4 },
        ],
        moods: ["Festivo", "Romántico", "Luminoso"],
        instruments: [
            "Pandereta",
            "Bajo melódico",
            "Metales",
            "Cuerdas",
        ],
        artists: [
            "The Supremes",
            "Stevie Wonder",
            "The Temptations",
            "Marvin Gaye",
        ],
        starterAlbum: {
            title: "Going to a Go-Go",
            artist: "Smokey Robinson & The Miracles",
            spotifyUrl:
                "https://open.spotify.com/search/Going%20to%20a%20Go-Go%20Smokey%20Robinson",
        },
        fact:
            "La discográfica Motown desarrolló un sonido reconocible apoyado por músicos de estudio conocidos como The Funk Brothers.",
        discoverGenre: "motown",
    },

    {
        id: "roots-reggae",
        name: "Roots Reggae",
        icon: "🌿",
        category: "Reggae",
        accent: "#63a45e",
        description:
            "Reggae espiritual y consciente, sostenido por bajos profundos, ritmos pausados y letras sobre identidad, resistencia y justicia.",
        invitation:
            "Escúchalo con calma y deja que el bajo marque el camino.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Groove", value: 5 },
            { label: "Mensaje", value: 5 },
            { label: "Bajo", value: 5 },
            { label: "Espiritualidad", value: 4 },
        ],
        moods: ["Consciente", "Sereno", "Esperanzador"],
        instruments: [
            "Bajo eléctrico",
            "Guitarra a contratiempo",
            "Órgano",
            "Percusión",
        ],
        artists: [
            "Bob Marley & The Wailers",
            "Burning Spear",
            "Culture",
            "The Abyssinians",
        ],
        starterAlbum: {
            title: "Marcus Garvey",
            artist: "Burning Spear",
            spotifyUrl:
                "https://open.spotify.com/search/Marcus%20Garvey%20Burning%20Spear",
        },
        fact:
            "El roots reggae está profundamente conectado con la cultura rastafari y con mensajes sociales y espirituales.",
        discoverGenre: "roots reggae",
    },
    {
        id: "psychedelic-rock",
        name: "Psychedelic Rock",
        icon: "🌀",
        category: "Rock",
        accent: "#9b5de5",
        description:
            "Un viaje sonoro lleno de efectos, improvisaciones y melodías que buscan expandir la imaginación más que seguir estructuras convencionales.",
        invitation:
            "Ponte unos auriculares, apaga las prisas y déjate llevar por el viaje.",
        accessibility: {
            level: "medium",
            label: "Accesible con mente abierta",
            icon: "🟡",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Experimentación", value: 5 },
            { label: "Improvisación", value: 4 },
            { label: "Creatividad", value: 5 },
        ],
        moods: [
            "Hipnótico",
            "Colorido",
            "Onírico",
        ],
        instruments: [
            "Guitarras con efectos",
            "Órgano Hammond",
            "Sitar",
            "Sintetizadores",
        ],
        artists: [
            "Pink Floyd",
            "The Doors",
            "Jefferson Airplane",
            "The Jimi Hendrix Experience",
        ],
        starterAlbum: {
            title: "The Piper at the Gates of Dawn",
            artist: "Pink Floyd",
            spotifyUrl:
                "https://open.spotify.com/search/The%20Piper%20at%20the%20Gates%20of%20Dawn",
        },
        fact:
            "Muchos efectos de guitarra populares hoy nacieron durante la explosión psicodélica de finales de los años sesenta.",
        discoverGenre: "psychedelic rock",
    },

    {
        id: "heartland-rock",
        name: "Heartland Rock",
        icon: "🛣️",
        category: "Rock",
        accent: "#a56743",
        description:
            "Rock directo y honesto que habla de la vida cotidiana, el trabajo, los pequeños pueblos y los grandes viajes por carretera.",
        invitation:
            "Ideal para conducir con las ventanillas bajadas mientras cae el sol.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Narrativa", value: 5 },
            { label: "Melodía", value: 4 },
            { label: "Honestidad", value: 5 },
            { label: "Energía", value: 3 },
        ],
        moods: [
            "Esperanzador",
            "Nostálgico",
            "Libre",
        ],
        instruments: [
            "Guitarras eléctricas",
            "Piano",
            "Saxofón",
            "Batería",
        ],
        artists: [
            "Bruce Springsteen",
            "Tom Petty",
            "John Mellencamp",
            "Bob Seger",
        ],
        starterAlbum: {
            title: "Born to Run",
            artist: "Bruce Springsteen",
            spotifyUrl:
                "https://open.spotify.com/search/Born%20to%20Run%20Bruce%20Springsteen",
        },
        fact:
            "El heartland rock se convirtió en la banda sonora de la clase trabajadora estadounidense durante los años setenta y ochenta.",
        discoverGenre: "heartland rock",
    },

    {
        id: "southern-rock",
        name: "Southern Rock",
        icon: "🤠",
        category: "Rock",
        accent: "#b77435",
        description:
            "Rock sureño impregnado de blues, country y largas guitarras solistas con un sonido cálido y poderoso.",
        invitation:
            "Perfecto para una ruta interminable por carreteras secundarias.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Guitarras", value: 5 },
            { label: "Blues", value: 4 },
            { label: "Energía", value: 4 },
            { label: "Improvisación", value: 4 },
        ],
        moods: [
            "Libre",
            "Potente",
            "Rústico",
        ],
        instruments: [
            "Guitarras dobles",
            "Órgano",
            "Bajo",
            "Batería",
        ],
        artists: [
            "Lynyrd Skynyrd",
            "The Allman Brothers Band",
            "ZZ Top",
            "Blackberry Smoke",
        ],
        starterAlbum: {
            title: "At Fillmore East",
            artist: "The Allman Brothers Band",
            spotifyUrl:
                "https://open.spotify.com/search/At%20Fillmore%20East",
        },
        fact:
            "El famoso riff de 'Sweet Home Alabama' es uno de los más reconocibles de toda la historia del rock.",
        discoverGenre: "southern rock",
    },

    {
        id: "art-pop",
        name: "Art Pop",
        icon: "🎨",
        category: "Pop",
        accent: "#cc72d4",
        description:
            "Pop que busca ir un paso más allá, mezclando melodías accesibles con ideas artísticas, experimentación y una fuerte identidad visual.",
        invitation:
            "Si te gusta el pop pero también las sorpresas, este género es para ti.",
        accessibility: {
            level: "medium",
            label: "Accesible con creatividad",
            icon: "🟡",
        },
        traits: [
            { label: "Creatividad", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Experimentación", value: 4 },
            { label: "Personalidad", value: 5 },
        ],
        moods: [
            "Elegante",
            "Original",
            "Expresivo",
        ],
        instruments: [
            "Sintetizadores",
            "Piano",
            "Guitarras",
            "Programaciones",
        ],
        artists: [
            "Kate Bush",
            "Peter Gabriel",
            "Björk",
            "St. Vincent",
        ],
        starterAlbum: {
            title: "Hounds of Love",
            artist: "Kate Bush",
            spotifyUrl:
                "https://open.spotify.com/search/Hounds%20of%20Love%20Kate%20Bush",
        },
        fact:
            "Muchos artistas de art pop consideran tanto el sonido como la puesta en escena parte inseparable de la obra.",
        discoverGenre: "art pop",
    },
    {
        id: "sophisti-pop",
        name: "Sophisti-Pop",
        icon: "🥂",
        category: "Pop",
        accent: "#9d7fb7",
        description:
            "Pop elegante y sofisticado donde los arreglos cuidados, las armonías de jazz y las producciones refinadas son los protagonistas.",
        invitation:
            "Ideal para una noche tranquila con una copa de vino y las luces bajas.",
        accessibility: {
            level: "easy",
            label: "Muy agradable de descubrir",
            icon: "🟢",
        },
        traits: [
            { label: "Elegancia", value: 5 },
            { label: "Producción", value: 5 },
            { label: "Melodía", value: 4 },
            { label: "Suavidad", value: 5 },
        ],
        moods: [
            "Relajado",
            "Romántico",
            "Refinado",
        ],
        instruments: [
            "Piano",
            "Sintetizadores",
            "Saxofón",
            "Bajo eléctrico",
        ],
        artists: [
            "Sade",
            "Prefab Sprout",
            "The Blue Nile",
            "Everything But The Girl",
        ],
        starterAlbum: {
            title: "Diamond Life",
            artist: "Sade",
            spotifyUrl:
                "https://open.spotify.com/search/Diamond%20Life%20Sade",
        },
        fact:
            "El sophisti-pop alcanzó su mayor popularidad durante la segunda mitad de los años ochenta.",
        discoverGenre: "sophisti-pop",
    },

    {
        id: "neo-soul",
        name: "Neo Soul",
        icon: "🧡",
        category: "Soul",
        accent: "#bb6b50",
        description:
            "Una reinterpretación moderna del soul clásico mezclada con R&B, jazz, hip hop y un enorme cuidado por la expresión vocal.",
        invitation:
            "Déjate envolver por voces cálidas y producciones que respiran elegancia.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Voz", value: 5 },
            { label: "Groove", value: 4 },
            { label: "Emoción", value: 5 },
            { label: "Calidez", value: 5 },
        ],
        moods: [
            "Sensual",
            "Íntimo",
            "Relajado",
        ],
        instruments: [
            "Piano Rhodes",
            "Bajo",
            "Batería",
            "Coros",
        ],
        artists: [
            "Erykah Badu",
            "D'Angelo",
            "Jill Scott",
            "Leon Bridges",
        ],
        starterAlbum: {
            title: "Voodoo",
            artist: "D'Angelo",
            spotifyUrl:
                "https://open.spotify.com/search/Voodoo%20D'Angelo",
        },
        fact:
            "Muchos consideran 'Voodoo' uno de los discos más influyentes del soul moderno.",
        discoverGenre: "neo soul",
    },

    {
        id: "gospel",
        name: "Gospel",
        icon: "⛪",
        category: "Soul",
        accent: "#d8a93f",
        description:
            "Música nacida en las iglesias afroamericanas donde la emoción, la esperanza y la fuerza coral ocupan el centro de cada canción.",
        invitation:
            "Incluso sin compartir su mensaje, es difícil no emocionarse con la energía de un gran coro góspel.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Coros", value: 5 },
            { label: "Emoción", value: 5 },
            { label: "Voz", value: 5 },
            { label: "Espiritualidad", value: 5 },
        ],
        moods: [
            "Esperanzador",
            "Inspirador",
            "Luminoso",
        ],
        instruments: [
            "Piano",
            "Órgano",
            "Palmas",
            "Coro",
        ],
        artists: [
            "Mahalia Jackson",
            "Kirk Franklin",
            "The Staple Singers",
            "Aretha Franklin",
        ],
        starterAlbum: {
            title: "Amazing Grace",
            artist: "Aretha Franklin",
            spotifyUrl:
                "https://open.spotify.com/search/Amazing%20Grace%20Aretha%20Franklin",
        },
        fact:
            "Muchos de los mejores cantantes de soul y R&B comenzaron cantando góspel en la iglesia.",
        discoverGenre: "gospel",
    },

    {
        id: "downtempo",
        name: "Downtempo",
        icon: "🌙",
        category: "Electrónica",
        accent: "#5d7fb7",
        description:
            "Electrónica pausada que prioriza la atmósfera y el groove sobre la intensidad, perfecta para relajarse sin dejar de moverse.",
        invitation:
            "Ideal para trabajar, conducir de noche o simplemente desconectar.",
        accessibility: {
            level: "easy",
            label: "Muy agradable",
            icon: "🟢",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Relajación", value: 5 },
            { label: "Groove", value: 4 },
            { label: "Producción", value: 5 },
        ],
        moods: [
            "Nocturno",
            "Sereno",
            "Hipnótico",
        ],
        instruments: [
            "Sintetizadores",
            "Samples",
            "Drum machine",
            "Piano",
        ],
        artists: [
            "Bonobo",
            "Zero 7",
            "Thievery Corporation",
            "Air",
        ],
        starterAlbum: {
            title: "Moon Safari",
            artist: "Air",
            spotifyUrl:
                "https://open.spotify.com/search/Moon%20Safari%20Air",
        },
        fact:
            "El downtempo fue uno de los sonidos más representativos de los lounges y cafés europeos durante los años noventa.",
        discoverGenre: "downtempo",
    },
    {
        id: "britpop",
        name: "Britpop",
        icon: "🇬🇧",
        category: "Rock alternativo",
        accent: "#d84f4f",
        description:
            "Movimiento británico de los años noventa caracterizado por guitarras brillantes, grandes estribillos y letras sobre la vida cotidiana en el Reino Unido.",
        invitation:
            "Si te gustan las melodías irresistibles y el rock con sabor británico, este es tu sitio.",
        accessibility: {
            level: "easy",
            label: "Perfecto para empezar",
            icon: "🟢",
        },
        traits: [
            { label: "Melodía", value: 5 },
            { label: "Estribillos", value: 5 },
            { label: "Guitarras", value: 4 },
            { label: "Actitud", value: 4 },
        ],
        moods: [
            "Optimista",
            "Desenfadado",
            "Nostálgico",
        ],
        instruments: [
            "Guitarras eléctricas",
            "Bajo",
            "Batería",
            "Piano",
        ],
        artists: [
            "Oasis",
            "Blur",
            "Pulp",
            "Suede",
        ],
        starterAlbum: {
            title: "(What's the Story) Morning Glory?",
            artist: "Oasis",
            spotifyUrl:
                "https://open.spotify.com/search/What's%20the%20Story%20Morning%20Glory",
        },
        fact:
            "La rivalidad entre Oasis y Blur llegó incluso a ocupar portadas de periódicos británicos.",
        discoverGenre: "britpop",
    },

    {
        id: "yacht-rock",
        name: "Yacht Rock",
        icon: "🛥️",
        category: "Soft Rock",
        accent: "#68b8d8",
        description:
            "Rock suave con influencias de soul y jazz, conocido por sus producciones impecables y un sonido cálido y relajado.",
        invitation:
            "Cierra los ojos e imagina un atardecer navegando con una brisa cálida.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Suavidad", value: 5 },
            { label: "Producción", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Groove", value: 4 },
        ],
        moods: [
            "Relajado",
            "Veraniego",
            "Elegante",
        ],
        instruments: [
            "Piano eléctrico",
            "Guitarras limpias",
            "Saxofón",
            "Coros",
        ],
        artists: [
            "Steely Dan",
            "Toto",
            "Christopher Cross",
            "Michael McDonald",
        ],
        starterAlbum: {
            title: "Aja",
            artist: "Steely Dan",
            spotifyUrl:
                "https://open.spotify.com/search/Aja%20Steely%20Dan",
        },
        fact:
            "El nombre 'Yacht Rock' nació décadas después gracias a una serie de humor publicada en Internet.",
        discoverGenre: "yacht rock",
    },

    {
        id: "baroque-pop",
        name: "Baroque Pop",
        icon: "🏛️",
        category: "Pop",
        accent: "#b68b57",
        description:
            "Pop enriquecido con cuerdas, clavicémbalos y arreglos inspirados en la música clásica, dando lugar a canciones elegantes y atemporales.",
        invitation:
            "Escúchalo cuando quieras un pop que suene tan refinado como emocionante.",
        accessibility: {
            level: "medium",
            label: "Muy recomendable",
            icon: "🟡",
        },
        traits: [
            { label: "Arreglos", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Elegancia", value: 5 },
            { label: "Orquestación", value: 5 },
        ],
        moods: [
            "Majestuoso",
            "Romántico",
            "Cinematográfico",
        ],
        instruments: [
            "Cuerdas",
            "Clavicémbalo",
            "Piano",
            "Vientos",
        ],
        artists: [
            "The Beach Boys",
            "The Left Banke",
            "Love",
            "Scott Walker",
        ],
        starterAlbum: {
            title: "Pet Sounds",
            artist: "The Beach Boys",
            spotifyUrl:
                "https://open.spotify.com/search/Pet%20Sounds",
        },
        fact:
            "Pet Sounds es considerado uno de los discos más influyentes de toda la historia del pop.",
        discoverGenre: "baroque pop",
    },

    {
        id: "bedroom-pop",
        name: "Bedroom Pop",
        icon: "🛏️",
        category: "Pop alternativo",
        accent: "#b084d8",
        description:
            "Canciones creadas muchas veces desde un dormitorio con pocos medios, donde la creatividad importa mucho más que un gran estudio de grabación.",
        invitation:
            "Descubre cómo una habitación puede convertirse en un estudio lleno de ideas.",
        accessibility: {
            level: "easy",
            label: "Muy actual",
            icon: "🟢",
        },
        traits: [
            { label: "Intimidad", value: 5 },
            { label: "Creatividad", value: 5 },
            { label: "Lo-fi", value: 4 },
            { label: "Melodía", value: 4 },
        ],
        moods: [
            "Íntimo",
            "Soñador",
            "Juvenil",
        ],
        instruments: [
            "Sintetizadores",
            "Guitarras",
            "Ordenador",
            "Caja de ritmos",
        ],
        artists: [
            "Clairo",
            "beabadoobee",
            "Rex Orange County",
            "Cuco",
        ],
        starterAlbum: {
            title: "Immunity",
            artist: "Clairo",
            spotifyUrl:
                "https://open.spotify.com/search/Immunity%20Clairo",
        },
        fact:
            "Muchos artistas de bedroom pop comenzaron grabando sus canciones únicamente con un portátil y un micrófono.",
        discoverGenre: "bedroom pop",
    },
    {
        id: "city-pop",
        name: "City Pop",
        icon: "🌆",
        category: "Pop",
        accent: "#5ca7d8",
        description:
            "Pop japonés sofisticado de finales de los setenta y los ochenta, con influencias de funk, jazz, AOR y disco. Suena como conducir de noche por Tokio bajo luces de neón.",
        invitation:
            "Si buscas un pop elegante y lleno de nostalgia, este género te conquistará.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Melodía", value: 5 },
            { label: "Groove", value: 4 },
            { label: "Producción", value: 5 },
            { label: "Nostalgia", value: 5 },
        ],
        moods: [
            "Nocturno",
            "Veraniego",
            "Relajado",
        ],
        instruments: [
            "Sintetizadores",
            "Bajo",
            "Saxofón",
            "Guitarras limpias",
        ],
        artists: [
            "Mariya Takeuchi",
            "Tatsuro Yamashita",
            "Anri",
            "Taeko Ohnuki",
        ],
        starterAlbum: {
            title: "For You",
            artist: "Tatsuro Yamashita",
            spotifyUrl:
                "https://open.spotify.com/search/For%20You%20Tatsuro%20Yamashita",
        },
        fact:
            "Décadas después de su nacimiento, internet convirtió el city pop en un fenómeno mundial.",
        discoverGenre: "city pop",
    },

    {
        id: "jangle-pop",
        name: "Jangle Pop",
        icon: "✨",
        category: "Pop Rock",
        accent: "#78b96d",
        description:
            "Pop basado en guitarras limpias y brillantes que producen ese característico sonido cristalino conocido como 'jangle'.",
        invitation:
            "Perfecto para quienes disfrutan de melodías optimistas y guitarras luminosas.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Guitarras", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Ligereza", value: 4 },
            { label: "Armonías", value: 4 },
        ],
        moods: [
            "Luminoso",
            "Optimista",
            "Primaveral",
        ],
        instruments: [
            "Guitarras de 12 cuerdas",
            "Bajo",
            "Batería",
            "Coros",
        ],
        artists: [
            "The Smiths",
            "R.E.M.",
            "The Byrds",
            "The La's",
        ],
        starterAlbum: {
            title: "Murmur",
            artist: "R.E.M.",
            spotifyUrl:
                "https://open.spotify.com/search/Murmur%20REM",
        },
        fact:
            "El sonido 'jangle' nació en gran parte gracias a las guitarras Rickenbacker de doce cuerdas.",
        discoverGenre: "jangle pop",
    },

    {
        id: "krautrock",
        name: "Krautrock",
        icon: "🚂",
        category: "Rock experimental",
        accent: "#8d8fb8",
        description:
            "Movimiento alemán que rompió con las estructuras tradicionales del rock mediante ritmos repetitivos, electrónica e improvisación.",
        invitation:
            "Ideal para descubrir uno de los géneros que más ha influido en la música moderna.",
        accessibility: {
            level: "hard",
            label: "Muy experimental",
            icon: "🔴",
        },
        traits: [
            { label: "Experimentación", value: 5 },
            { label: "Hipnosis", value: 5 },
            { label: "Repetición", value: 5 },
            { label: "Creatividad", value: 5 },
        ],
        moods: [
            "Hipnótico",
            "Espacial",
            "Minimalista",
        ],
        instruments: [
            "Sintetizadores",
            "Guitarras",
            "Batería",
            "Órgano",
        ],
        artists: [
            "Can",
            "Neu!",
            "Faust",
            "Kraftwerk",
        ],
        starterAlbum: {
            title: "Future Days",
            artist: "Can",
            spotifyUrl:
                "https://open.spotify.com/search/Future%20Days%20Can",
        },
        fact:
            "Bandas como Radiohead, David Bowie o LCD Soundsystem han reconocido la enorme influencia del krautrock.",
        discoverGenre: "krautrock",
    },

    {
        id: "slowcore",
        name: "Slowcore",
        icon: "🌧️",
        category: "Rock alternativo",
        accent: "#7f8da4",
        description:
            "Canciones lentas, minimalistas y profundamente emocionales donde cada silencio tiene tanta importancia como cada nota.",
        invitation:
            "Escúchalo sin prisas. El slowcore recompensa a quien sabe detenerse.",
        accessibility: {
            level: "medium",
            label: "Requiere paciencia",
            icon: "🟡",
        },
        traits: [
            { label: "Calma", value: 5 },
            { label: "Minimalismo", value: 5 },
            { label: "Emoción", value: 5 },
            { label: "Intimidad", value: 5 },
        ],
        moods: [
            "Melancólico",
            "Reflexivo",
            "Íntimo",
        ],
        instruments: [
            "Guitarra eléctrica",
            "Bajo",
            "Batería suave",
            "Voz susurrada",
        ],
        artists: [
            "Low",
            "Red House Painters",
            "Codeine",
            "Duster",
        ],
        starterAlbum: {
            title: "Things We Lost in the Fire",
            artist: "Low",
            spotifyUrl:
                "https://open.spotify.com/search/Things%20We%20Lost%20in%20the%20Fire",
        },
        fact:
            "El silencio y los espacios vacíos forman parte de la composición tanto como los propios instrumentos.",
        discoverGenre: "slowcore",
    },
    {
        id: "space-rock",
        name: "Space Rock",
        icon: "🚀",
        category: "Rock",
        accent: "#5c6fd8",
        description:
            "Rock atmosférico y expansivo que utiliza largos desarrollos, efectos de guitarra y sintetizadores para crear paisajes sonoros espaciales.",
        invitation:
            "Ponte unos auriculares y deja que la música te lleve mucho más allá de la Tierra.",
        accessibility: {
            level: "medium",
            label: "Muy inmersivo",
            icon: "🟡",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Viaje", value: 5 },
            { label: "Improvisación", value: 4 },
            { label: "Psicodelia", value: 4 },
        ],
        moods: [
            "Espacial",
            "Hipnótico",
            "Contemplativo",
        ],
        instruments: [
            "Guitarras con delay",
            "Sintetizadores",
            "Bajo",
            "Batería",
        ],
        artists: [
            "Hawkwind",
            "Pink Floyd",
            "Spiritualized",
            "Failure",
        ],
        starterAlbum: {
            title: "Space Ritual",
            artist: "Hawkwind",
            spotifyUrl:
                "https://open.spotify.com/search/Space%20Ritual%20Hawkwind",
        },
        fact:
            "El space rock fue uno de los géneros que más influyó en el rock progresivo y el post-rock posteriores.",
        discoverGenre: "space rock",
    },

    {
        id: "acid-jazz",
        name: "Acid Jazz",
        icon: "🎷",
        category: "Jazz",
        accent: "#b5833f",
        description:
            "Una mezcla irresistible de jazz, funk, soul y hip hop que convirtió el groove en su principal protagonista.",
        invitation:
            "Si te gusta mover la cabeza al ritmo del bajo, este género es una apuesta segura.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Groove", value: 5 },
            { label: "Jazz", value: 4 },
            { label: "Funk", value: 5 },
            { label: "Ritmo", value: 5 },
        ],
        moods: [
            "Elegante",
            "Festivo",
            "Relajado",
        ],
        instruments: [
            "Metales",
            "Bajo",
            "Rhodes",
            "Percusión",
        ],
        artists: [
            "Jamiroquai",
            "Incognito",
            "The Brand New Heavies",
            "Galliano",
        ],
        starterAlbum: {
            title: "Emergency on Planet Earth",
            artist: "Jamiroquai",
            spotifyUrl:
                "https://open.spotify.com/search/Emergency%20on%20Planet%20Earth",
        },
        fact:
            "A pesar del nombre, el acid jazz apenas tiene relación con el acid house.",
        discoverGenre: "acid jazz",
    },

    {
        id: "afrobeat",
        name: "Afrobeat",
        icon: "🌍",
        category: "World",
        accent: "#5ca35c",
        description:
            "Explosiva combinación de ritmos africanos, funk, jazz y soul, caracterizada por largos desarrollos instrumentales y un ritmo contagioso.",
        invitation:
            "Déjate llevar por el ritmo. Es prácticamente imposible quedarse quieto.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Percusión", value: 5 },
            { label: "Groove", value: 5 },
            { label: "Metales", value: 5 },
            { label: "Energía", value: 5 },
        ],
        moods: [
            "Vibrante",
            "Festivo",
            "Vital",
        ],
        instruments: [
            "Percusión",
            "Metales",
            "Bajo",
            "Guitarras",
        ],
        artists: [
            "Fela Kuti",
            "Tony Allen",
            "Seun Kuti",
            "Antibalas",
        ],
        starterAlbum: {
            title: "Expensive Shit",
            artist: "Fela Kuti",
            spotifyUrl:
                "https://open.spotify.com/search/Expensive%20Shit%20Fela%20Kuti",
        },
        fact:
            "Fela Kuti utilizó el afrobeat como herramienta para denunciar la corrupción y las injusticias políticas en Nigeria.",
        discoverGenre: "afrobeat",
    },

    {
        id: "drum-and-bass",
        name: "Drum & Bass",
        icon: "⚡",
        category: "Electrónica",
        accent: "#5867d8",
        description:
            "Electrónica de alta velocidad construida sobre bajos profundos y patrones de batería frenéticos que mantienen la energía al máximo.",
        invitation:
            "Sube el volumen y prepárate para uno de los géneros más intensos de la música electrónica.",
        accessibility: {
            level: "medium",
            label: "Intenso pero adictivo",
            icon: "🟡",
        },
        traits: [
            { label: "Velocidad", value: 5 },
            { label: "Energía", value: 5 },
            { label: "Bajo", value: 5 },
            { label: "Ritmo", value: 5 },
        ],
        moods: [
            "Eléctrico",
            "Adrenalínico",
            "Nocturno",
        ],
        instruments: [
            "Samplers",
            "Sintetizadores",
            "Drum machine",
            "Bajo electrónico",
        ],
        artists: [
            "Goldie",
            "LTJ Bukem",
            "Pendulum",
            "High Contrast",
        ],
        starterAlbum: {
            title: "Timeless",
            artist: "Goldie",
            spotifyUrl:
                "https://open.spotify.com/search/Timeless%20Goldie",
        },
        fact:
            "La mayoría de temas de drum & bass se mueven entre 160 y 180 pulsaciones por minuto.",
        discoverGenre: "drum and bass",
    },
    {
        id: "surf-rock",
        name: "Surf Rock",
        icon: "🌊",
        category: "Rock",
        accent: "#3f9fbf",
        description:
            "Rock instrumental nacido junto a la cultura del surf, reconocible por sus guitarras con reverberación, ritmos veloces y melodías que parecen moverse como olas.",
        invitation:
            "Perfecto para imaginar una carretera junto al mar, sol, arena y una tabla en el techo del coche.",
        accessibility: {
            level: "easy",
            label: "Directo y muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Guitarras", value: 5 },
            { label: "Energía", value: 4 },
            { label: "Reverberación", value: 5 },
            { label: "Ritmo", value: 4 },
        ],
        moods: [
            "Veraniego",
            "Dinámico",
            "Despreocupado",
        ],
        instruments: [
            "Guitarra eléctrica",
            "Bajo",
            "Batería",
            "Saxofón",
        ],
        artists: [
            "Dick Dale",
            "The Ventures",
            "The Surfaris",
            "The Shadows",
        ],
        starterAlbum: {
            title: "Surfer's Choice",
            artist: "Dick Dale and His Del-Tones",
            spotifyUrl:
                "https://open.spotify.com/search/Surfer's%20Choice%20Dick%20Dale",
        },
        fact:
            "La reverberación de muelles fue esencial para crear el sonido acuático y expansivo del surf rock.",
        discoverGenre: "surf rock",
    },

    {
        id: "folk-rock",
        name: "Folk Rock",
        icon: "🌾",
        category: "Folk",
        accent: "#a27a45",
        description:
            "La unión entre la narrativa y las melodías del folk con la energía, las guitarras y la estructura del rock.",
        invitation:
            "Una puerta perfecta para quien disfruta de buenas historias, armonías vocales y guitarras con personalidad.",
        accessibility: {
            level: "easy",
            label: "Perfecto para empezar",
            icon: "🟢",
        },
        traits: [
            { label: "Narrativa", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Armonías", value: 4 },
            { label: "Guitarras", value: 4 },
        ],
        moods: [
            "Nostálgico",
            "Natural",
            "Reflexivo",
        ],
        instruments: [
            "Guitarra acústica",
            "Guitarra eléctrica",
            "Armónica",
            "Coros",
        ],
        artists: [
            "The Byrds",
            "Bob Dylan",
            "Crosby, Stills, Nash & Young",
            "Fairport Convention",
        ],
        starterAlbum: {
            title: "Mr. Tambourine Man",
            artist: "The Byrds",
            spotifyUrl:
                "https://open.spotify.com/search/Mr%20Tambourine%20Man%20The%20Byrds",
        },
        fact:
            "La electrificación de Bob Dylan en 1965 fue uno de los momentos decisivos para la expansión del folk rock.",
        discoverGenre: "folk rock",
    },

    {
        id: "outlaw-country",
        name: "Outlaw Country",
        icon: "🦂",
        category: "Country",
        accent: "#9a5b32",
        description:
            "Country áspero, rebelde y alejado de las producciones pulidas de Nashville, protagonizado por artistas que defendían su libertad creativa.",
        invitation:
            "Para escuchar conduciendo por una carretera polvorienta sin mirar demasiado el reloj.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Actitud", value: 5 },
            { label: "Narrativa", value: 5 },
            { label: "Rusticidad", value: 5 },
            { label: "Honestidad", value: 5 },
        ],
        moods: [
            "Rebelde",
            "Polvoriento",
            "Melancólico",
        ],
        instruments: [
            "Guitarra acústica",
            "Pedal steel",
            "Armónica",
            "Bajo",
        ],
        artists: [
            "Willie Nelson",
            "Waylon Jennings",
            "Johnny Cash",
            "Kris Kristofferson",
        ],
        starterAlbum: {
            title: "Red Headed Stranger",
            artist: "Willie Nelson",
            spotifyUrl:
                "https://open.spotify.com/search/Red%20Headed%20Stranger%20Willie%20Nelson",
        },
        fact:
            "El movimiento outlaw nació como reacción al control creativo que ejercían los grandes estudios de Nashville.",
        discoverGenre: "outlaw country",
    },

    {
        id: "jazz-rap",
        name: "Jazz Rap",
        icon: "🎤",
        category: "Hip Hop",
        accent: "#96734d",
        description:
            "Hip hop construido con samples, armonías e instrumentación de jazz, donde las rimas inteligentes conviven con ritmos suaves y sofisticados.",
        invitation:
            "Ideal para descubrir un hip hop cálido, musical y lleno de detalles.",
        accessibility: {
            level: "easy",
            label: "Muy recomendable",
            icon: "🟢",
        },
        traits: [
            { label: "Lírica", value: 5 },
            { label: "Groove", value: 5 },
            { label: "Samples", value: 5 },
            { label: "Musicalidad", value: 5 },
        ],
        moods: [
            "Relajado",
            "Urbano",
            "Reflexivo",
        ],
        instruments: [
            "Samples de jazz",
            "Batería programada",
            "Contrabajo",
            "Metales",
        ],
        artists: [
            "A Tribe Called Quest",
            "De La Soul",
            "Digable Planets",
            "Guru",
        ],
        starterAlbum: {
            title: "The Low End Theory",
            artist: "A Tribe Called Quest",
            spotifyUrl:
                "https://open.spotify.com/search/The%20Low%20End%20Theory",
        },
        fact:
            "El jazz rap ayudó a demostrar que el hip hop podía ser experimental, sofisticado y profundamente musical.",
        discoverGenre: "jazz rap",
    },

    {
        id: "gothic-rock",
        name: "Gothic Rock",
        icon: "🦇",
        category: "Rock alternativo",
        accent: "#574d68",
        description:
            "Rock oscuro y atmosférico surgido del post-punk, marcado por bajos profundos, guitarras envolventes y una estética teatral y melancólica.",
        invitation:
            "Perfecto para una noche de lluvia, luces bajas y una buena dosis de dramatismo.",
        accessibility: {
            level: "medium",
            label: "Oscuro pero accesible",
            icon: "🟡",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Oscuridad", value: 5 },
            { label: "Bajo", value: 5 },
            { label: "Dramatismo", value: 5 },
        ],
        moods: [
            "Nocturno",
            "Melancólico",
            "Misterioso",
        ],
        instruments: [
            "Bajo eléctrico",
            "Guitarras con chorus",
            "Batería",
            "Sintetizadores",
        ],
        artists: [
            "The Cure",
            "Bauhaus",
            "Siouxsie and the Banshees",
            "The Sisters of Mercy",
        ],
        starterAlbum: {
            title: "Disintegration",
            artist: "The Cure",
            spotifyUrl:
                "https://open.spotify.com/search/Disintegration%20The%20Cure",
        },
        fact:
            "El gothic rock nació dentro de la escena post-punk británica antes de desarrollar una identidad propia.",
        discoverGenre: "gothic rock",
    },

    {
        id: "tropicalia",
        name: "Tropicália",
        icon: "🌺",
        category: "Música brasileña",
        accent: "#d67842",
        description:
            "Movimiento brasileño que mezcló samba, bossa nova, psicodelia, rock y música experimental con una fuerte intención artística y política.",
        invitation:
            "Una explosión de color, ritmo y libertad creativa que suena diferente a casi todo.",
        accessibility: {
            level: "medium",
            label: "Colorido y sorprendente",
            icon: "🟡",
        },
        traits: [
            { label: "Creatividad", value: 5 },
            { label: "Ritmo", value: 5 },
            { label: "Psicodelia", value: 4 },
            { label: "Experimentación", value: 5 },
        ],
        moods: [
            "Colorido",
            "Vibrante",
            "Surrealista",
        ],
        instruments: [
            "Guitarra",
            "Percusión brasileña",
            "Cuerdas",
            "Órgano",
        ],
        artists: [
            "Caetano Veloso",
            "Gilberto Gil",
            "Gal Costa",
            "Os Mutantes",
        ],
        starterAlbum: {
            title: "Tropicália ou Panis et Circencis",
            artist: "Varios artistas",
            spotifyUrl:
                "https://open.spotify.com/search/Tropicalia%20ou%20Panis%20et%20Circencis",
        },
        fact:
            "La Tropicália desafió tanto las convenciones musicales como la situación política del Brasil de finales de los sesenta.",
        discoverGenre: "tropicalia",
    },
    {
        id: "new-romantic",
        name: "New Romantic",
        icon: "✨",
        category: "Pop",
        accent: "#b05cc7",
        description:
            "Movimiento británico de finales de los setenta y principios de los ochenta que unió sintetizadores, moda extravagante y melodías sofisticadas.",
        invitation:
            "Si te gusta el pop elegante de los 80 con mucho sintetizador, aquí estás en casa.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Sintetizadores", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Elegancia", value: 5 },
            { label: "Estilo", value: 5 },
        ],
        moods: [
            "Elegante",
            "Nocturno",
            "Romántico",
        ],
        instruments: [
            "Sintetizadores",
            "Caja de ritmos",
            "Bajo",
            "Guitarras limpias",
        ],
        artists: [
            "Duran Duran",
            "Spandau Ballet",
            "Visage",
            "Ultravox",
        ],
        starterAlbum: {
            title: "Rio",
            artist: "Duran Duran",
            spotifyUrl:
                "https://open.spotify.com/search/Rio%20Duran%20Duran",
        },
        fact:
            "El club londinense Blitz fue el epicentro del movimiento New Romantic.",
        discoverGenre: "new romantic",
    },

    {
        id: "idm",
        name: "IDM",
        icon: "🤖",
        category: "Electrónica",
        accent: "#6b63d8",
        description:
            "Electronic music centrada en la experimentación, las texturas y los ritmos complejos más que en la pista de baile.",
        invitation:
            "Escúchalo con auriculares. Siempre hay pequeños detalles escondidos.",
        accessibility: {
            level: "hard",
            label: "Muy experimental",
            icon: "🔴",
        },
        traits: [
            { label: "Complejidad", value: 5 },
            { label: "Creatividad", value: 5 },
            { label: "Texturas", value: 5 },
            { label: "Experimentación", value: 5 },
        ],
        moods: [
            "Abstracto",
            "Hipnótico",
            "Futurista",
        ],
        instruments: [
            "Sintetizadores",
            "Samplers",
            "Drum machines",
            "Secuenciadores",
        ],
        artists: [
            "Aphex Twin",
            "Autechre",
            "Boards of Canada",
            "Squarepusher",
        ],
        starterAlbum: {
            title: "Selected Ambient Works 85–92",
            artist: "Aphex Twin",
            spotifyUrl:
                "https://open.spotify.com/search/Selected%20Ambient%20Works%2085-92",
        },
        fact:
            "Aunque significa 'Intelligent Dance Music', muchos artistas del género nunca se sintieron cómodos con ese nombre.",
        discoverGenre: "idm",
    },

    {
        id: "singer-songwriter",
        name: "Singer-Songwriter",
        icon: "✍️",
        category: "Folk",
        accent: "#a67c52",
        description:
            "Canciones donde el artista interpreta sus propias composiciones, poniendo el foco en las letras, la emoción y la interpretación.",
        invitation:
            "Cuando quieras escuchar historias sinceras contadas en primera persona, este género nunca falla.",
        accessibility: {
            level: "easy",
            label: "Perfecto para empezar",
            icon: "🟢",
        },
        traits: [
            { label: "Letras", value: 5 },
            { label: "Emoción", value: 5 },
            { label: "Intimidad", value: 5 },
            { label: "Melodía", value: 4 },
        ],
        moods: [
            "Íntimo",
            "Reflexivo",
            "Honesto",
        ],
        instruments: [
            "Guitarra acústica",
            "Piano",
            "Armónica",
            "Cuerdas",
        ],
        artists: [
            "James Taylor",
            "Carole King",
            "Joni Mitchell",
            "Cat Stevens",
        ],
        starterAlbum: {
            title: "Blue",
            artist: "Joni Mitchell",
            spotifyUrl:
                "https://open.spotify.com/search/Blue%20Joni%20Mitchell",
        },
        fact:
            "Los años setenta fueron la edad de oro del movimiento singer-songwriter.",
        discoverGenre: "singer-songwriter",
    },

    {
        id: "dream-folk",
        name: "Dream Folk",
        icon: "🌙",
        category: "Folk",
        accent: "#7a91b8",
        description:
            "Una fusión entre el folk acústico y las atmósferas etéreas del dream pop, donde predominan la delicadeza y la sensación de ensueño.",
        invitation:
            "Ideal para una noche tranquila o una caminata entre árboles al atardecer.",
        accessibility: {
            level: "easy",
            label: "Muy agradable",
            icon: "🟢",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Calma", value: 5 },
            { label: "Acústico", value: 4 },
            { label: "Belleza", value: 5 },
        ],
        moods: [
            "Onírico",
            "Sereno",
            "Natural",
        ],
        instruments: [
            "Guitarra acústica",
            "Piano",
            "Cuerdas",
            "Coros",
        ],
        artists: [
            "Bon Iver",
            "Fleet Foxes",
            "S. Carey",
            "Daughter",
        ],
        starterAlbum: {
            title: "For Emma, Forever Ago",
            artist: "Bon Iver",
            spotifyUrl:
                "https://open.spotify.com/search/For%20Emma%20Forever%20Ago",
        },
        fact:
            "Muchos discos de dream folk fueron grabados en cabañas, casas rurales o estudios rodeados de naturaleza para reforzar su atmósfera.",
        discoverGenre: "dream folk",
    },
    {
        id: "madchester",
        name: "Madchester",
        icon: "🕺",
        category: "Rock alternativo",
        accent: "#e58d4f",
        description:
            "Escena nacida en Manchester que mezcló indie rock, psicodelia, funk y música dance, convirtiendo los conciertos en auténticas fiestas.",
        invitation:
            "Si te gusta bailar sin dejar las guitarras de lado, este movimiento es imprescindible.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Groove", value: 5 },
            { label: "Guitarras", value: 4 },
            { label: "Baile", value: 5 },
            { label: "Psicodelia", value: 4 },
        ],
        moods: [
            "Festivo",
            "Eufórico",
            "Desenfadado",
        ],
        instruments: [
            "Guitarras",
            "Bajo",
            "Batería",
            "Teclados",
        ],
        artists: [
            "The Stone Roses",
            "Happy Mondays",
            "Inspiral Carpets",
            "808 State",
        ],
        starterAlbum: {
            title: "The Stone Roses",
            artist: "The Stone Roses",
            spotifyUrl:
                "https://open.spotify.com/search/The%20Stone%20Roses",
        },
        fact:
            "El club The Haçienda fue el corazón del movimiento Madchester.",
        discoverGenre: "madchester",
    },

    {
        id: "shibuya-kei",
        name: "Shibuya-kei",
        icon: "🗼",
        category: "Pop",
        accent: "#ff8aa1",
        description:
            "Estilo japonés que mezcla pop, jazz, bossa nova, electrónica y música francesa con una enorme imaginación y gusto por el detalle.",
        invitation:
            "Cada canción parece un collage sonoro lleno de pequeñas sorpresas.",
        accessibility: {
            level: "medium",
            label: "Original y muy divertido",
            icon: "🟡",
        },
        traits: [
            { label: "Creatividad", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Eclecticismo", value: 5 },
            { label: "Color", value: 5 },
        ],
        moods: [
            "Juguetón",
            "Luminoso",
            "Creativo",
        ],
        instruments: [
            "Sintetizadores",
            "Metales",
            "Guitarras",
            "Samples",
        ],
        artists: [
            "Pizzicato Five",
            "Cornelius",
            "Flipper's Guitar",
            "Fantastic Plastic Machine",
        ],
        starterAlbum: {
            title: "Happy End of the World",
            artist: "Pizzicato Five",
            spotifyUrl:
                "https://open.spotify.com/search/Happy%20End%20of%20the%20World%20Pizzicato%20Five",
        },
        fact:
            "Su nombre proviene del barrio de Shibuya, uno de los epicentros culturales de Tokio.",
        discoverGenre: "shibuya-kei",
    },

    {
        id: "lofi-hip-hop",
        name: "Lo-fi Hip Hop",
        icon: "📼",
        category: "Hip Hop",
        accent: "#8c7a68",
        description:
            "Instrumentales relajadas con sonido cálido, pequeñas imperfecciones y ambientes nostálgicos pensados para estudiar, leer o desconectar.",
        invitation:
            "Ponlo de fondo y deja que todo vaya un poco más despacio.",
        accessibility: {
            level: "easy",
            label: "Perfecto para cualquiera",
            icon: "🟢",
        },
        traits: [
            { label: "Relajación", value: 5 },
            { label: "Atmósfera", value: 5 },
            { label: "Groove", value: 4 },
            { label: "Minimalismo", value: 4 },
        ],
        moods: [
            "Tranquilo",
            "Nostálgico",
            "Acogedor",
        ],
        instruments: [
            "Samples",
            "Piano",
            "Vinilo",
            "Caja de ritmos",
        ],
        artists: [
            "Nujabes",
            "J Dilla",
            "Idealism",
            "eevee",
        ],
        starterAlbum: {
            title: "Modal Soul",
            artist: "Nujabes",
            spotifyUrl:
                "https://open.spotify.com/search/Modal%20Soul%20Nujabes",
        },
        fact:
            "El sonido del crepitar de un vinilo se utiliza muchas veces de forma intencionada para aumentar la sensación de calidez.",
        discoverGenre: "lo-fi hip hop",
    },

    {
        id: "dream-pop",
        name: "Dream Pop",
        icon: "☁️",
        category: "Pop alternativo",
        accent: "#9a90d8",
        description:
            "Un universo de voces etéreas, guitarras envolventes y sintetizadores que crean una sensación de estar soñando despierto.",
        invitation:
            "No hace falta entender cada detalle: simplemente déjate llevar por la atmósfera.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Belleza", value: 5 },
            { label: "Suavidad", value: 5 },
            { label: "Texturas", value: 5 },
        ],
        moods: [
            "Onírico",
            "Melancólico",
            "Sereno",
        ],
        instruments: [
            "Guitarras con chorus",
            "Sintetizadores",
            "Bajo",
            "Coros",
        ],
        artists: [
            "Cocteau Twins",
            "Beach House",
            "Slowdive",
            "Alvvays",
        ],
        starterAlbum: {
            title: "Heaven or Las Vegas",
            artist: "Cocteau Twins",
            spotifyUrl:
                "https://open.spotify.com/search/Heaven%20or%20Las%20Vegas",
        },
        fact:
            "Aunque comparte raíces con el shoegaze, el dream pop suele poner mucho más énfasis en las melodías y las voces que en el muro de guitarras.",
        discoverGenre: "dream pop",
    },
    {
        id: "post-rock",
        name: "Post-Rock",
        icon: "🌌",
        category: "Rock",
        accent: "#6274b8",
        description:
            "Un género que utiliza los instrumentos tradicionales del rock para crear paisajes sonoros cinematográficos, donde la atmósfera importa más que la estructura de una canción convencional.",
        invitation:
            "Olvídate de los estribillos. Aquí cada tema es un viaje que va creciendo poco a poco.",
        accessibility: {
            level: "medium",
            label: "Requiere paciencia",
            icon: "🟡",
        },
        traits: [
            { label: "Atmósfera", value: 5 },
            { label: "Crescendo", value: 5 },
            { label: "Instrumental", value: 4 },
            { label: "Emoción", value: 5 },
        ],
        moods: [
            "Contemplativo",
            "Épico",
            "Melancólico",
        ],
        instruments: [
            "Guitarras con delay",
            "Bajo",
            "Batería",
            "Piano",
        ],
        artists: [
            "Godspeed You! Black Emperor",
            "Explosions in the Sky",
            "Mogwai",
            "This Will Destroy You",
        ],
        starterAlbum: {
            title: "The Earth Is Not a Cold Dead Place",
            artist: "Explosions in the Sky",
            spotifyUrl:
                "https://open.spotify.com/search/The%20Earth%20Is%20Not%20a%20Cold%20Dead%20Place",
        },
        fact:
            "Muchas bandas sonoras modernas han tomado inspiración directa del post-rock.",
        discoverGenre: "post-rock",
    },

    {
        id: "power-pop",
        name: "Power Pop",
        icon: "⚡",
        category: "Pop Rock",
        accent: "#ffb347",
        description:
            "Canciones cortas, guitarreras y con estribillos irresistibles que mezclan la energía del rock con el gancho del mejor pop.",
        invitation:
            "Si alguna vez has tarareado un estribillo durante todo el día, probablemente te guste el power pop.",
        accessibility: {
            level: "easy",
            label: "Muy accesible",
            icon: "🟢",
        },
        traits: [
            { label: "Estribillos", value: 5 },
            { label: "Melodía", value: 5 },
            { label: "Energía", value: 4 },
            { label: "Duración", value: 4 },
        ],
        moods: [
            "Optimista",
            "Enérgico",
            "Luminoso",
        ],
        instruments: [
            "Guitarras eléctricas",
            "Bajo",
            "Batería",
            "Coros",
        ],
        artists: [
            "Big Star",
            "Cheap Trick",
            "The Knack",
            "Fountains of Wayne",
        ],
        starterAlbum: {
            title: "#1 Record",
            artist: "Big Star",
            spotifyUrl:
                "https://open.spotify.com/search/Big%20Star%20Number%201%20Record",
        },
        fact:
            "Aunque nunca fue un fenómeno masivo, el power pop ha influido en cientos de bandas de rock alternativo.",
        discoverGenre: "power pop",
    },

    {
        id: "indietronica",
        name: "Indietronica",
        icon: "🎛️",
        category: "Electrónica",
        accent: "#5b89d8",
        description:
            "La unión entre la sensibilidad del indie y las texturas electrónicas, donde sintetizadores y guitarras conviven con total naturalidad.",
        invitation:
            "Ideal si te gustan tanto las bandas como los sintetizadores.",
        accessibility: {
            level: "easy",
            label: "Muy recomendable",
            icon: "🟢",
        },
        traits: [
            { label: "Sintetizadores", value: 5 },
            { label: "Melodía", value: 4 },
            { label: "Texturas", value: 5 },
            { label: "Creatividad", value: 4 },
        ],
        moods: [
            "Moderno",
            "Nocturno",
            "Optimista",
        ],
        instruments: [
            "Sintetizadores",
            "Guitarras",
            "Samplers",
            "Caja de ritmos",
        ],
        artists: [
            "Hot Chip",
            "The Postal Service",
            "Passion Pit",
            "Metronomy",
        ],
        starterAlbum: {
            title: "Give Up",
            artist: "The Postal Service",
            spotifyUrl:
                "https://open.spotify.com/search/Give%20Up%20The%20Postal%20Service",
        },
        fact:
            "El álbum 'Give Up' fue grabado intercambiando archivos por correo postal, de ahí el nombre de la banda.",
        discoverGenre: "indietronica",
    },

    {
        id: "contemporary-folk",
        name: "Contemporary Folk",
        icon: "🍃",
        category: "Folk",
        accent: "#7da46b",
        description:
            "La evolución moderna del folk tradicional, con composiciones íntimas, producción actual y letras muy personales.",
        invitation:
            "Perfecto para tardes tranquilas, una guitarra acústica y una taza de café.",
        accessibility: {
            level: "easy",
            label: "Perfecto para descubrir",
            icon: "🟢",
        },
        traits: [
            { label: "Intimidad", value: 5 },
            { label: "Letras", value: 5 },
            { label: "Acústico", value: 4 },
            { label: "Calidez", value: 5 },
        ],
        moods: [
            "Acogedor",
            "Natural",
            "Reflexivo",
        ],
        instruments: [
            "Guitarra acústica",
            "Piano",
            "Banjo",
            "Violín",
        ],
        artists: [
            "The Lumineers",
            "Ben Howard",
            "Passenger",
            "Of Monsters and Men",
        ],
        starterAlbum: {
            title: "Every Kingdom",
            artist: "Ben Howard",
            spotifyUrl:
                "https://open.spotify.com/search/Every%20Kingdom%20Ben%20Howard",
        },
        fact:
            "El folk contemporáneo recuperó el protagonismo internacional durante la década de 2010 gracias al éxito de artistas independientes.",
        discoverGenre: "contemporary folk",
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