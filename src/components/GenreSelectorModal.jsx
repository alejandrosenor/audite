import { useMemo, useState } from "react";
import {
    allGenres,
    genreCategories,
} from "../services/genres";
import "./GenreSelectorModal.css";

function normalizeText(value) {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();
}

function GenreSelectorModal({
    isOpen,
    selectedGenre,
    onSelect,
    onClose,
}) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] =
        useState("popular");

    const filteredGenres = useMemo(() => {
        const normalizedSearch = normalizeText(search);

        if (normalizedSearch) {
            return allGenres.filter((genre) =>
                normalizeText(genre).includes(
                    normalizedSearch,
                ),
            );
        }

        return (
            genreCategories.find(
                (category) =>
                    category.id === activeCategory,
            )?.genres ?? []
        );
    }, [search, activeCategory]);

    function handleClose() {
        setSearch("");
        setActiveCategory("popular");
        onClose();
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="genre-modal-backdrop"
            onMouseDown={handleClose}
        >
            <section
                className="genre-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="genre-modal-title"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <header className="genre-modal__header">
                    <div>
                        <p>AFINA TU DESCUBRIMIENTO</p>
                        <h2 id="genre-modal-title">
                            Elige un género
                        </h2>
                        <span>
                            Generaremos un álbum aleatorio dentro
                            del estilo que selecciones.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Cerrar selector"
                    >
                        ×
                    </button>
                </header>

                <div className="genre-modal__controls">
                    <label className="genre-modal__search">
                        <span>⌕</span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Buscar rock, jazz, soul..."
                            autoFocus
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Limpiar búsqueda"
                            >
                                ×
                            </button>
                        )}
                    </label>

                    {!search && (
                        <div className="genre-categories">
                            {genreCategories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={
                                        activeCategory === category.id
                                            ? "genre-category genre-category--active"
                                            : "genre-category"
                                    }
                                    onClick={() =>
                                        setActiveCategory(category.id)
                                    }
                                >
                                    <span>{category.icon}</span>
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="genre-modal__content">
                    <div className="genre-modal__result-header">
                        <strong>
                            {search
                                ? "Resultados"
                                : genreCategories.find(
                                    (category) =>
                                        category.id ===
                                        activeCategory,
                                )?.label}
                        </strong>

                        <span>{filteredGenres.length}</span>
                    </div>

                    {filteredGenres.length > 0 ? (
                        <div className="genre-grid">
                            {filteredGenres.map((genre) => (
                                <button
                                    key={genre}
                                    type="button"
                                    className={
                                        selectedGenre === genre
                                            ? "genre-option genre-option--selected"
                                            : "genre-option"
                                    }
                                    onClick={() => onSelect(genre)}
                                >
                                    <span>
                                        {selectedGenre === genre
                                            ? "✓"
                                            : "♪"}
                                    </span>

                                    <strong>{genre}</strong>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="genre-modal__empty">
                            <span>🎧</span>
                            <h3>No encontramos ese género</h3>
                            <p>
                                Prueba con otro nombre o busca una
                                categoría más amplia.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="genre-modal__footer">
                    <button
                        type="button"
                        className="genre-modal__random"
                        onClick={() => onSelect("")}
                    >
                        Cualquier género
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default GenreSelectorModal;