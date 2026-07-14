import { NavLink } from "react-router-dom";

function LibraryTabs() {
    function getClassName({ isActive }) {
        return [
            "library-tabs__item",
            isActive
                ? "library-tabs__item--active"
                : "",
        ]
            .filter(Boolean)
            .join(" ");
    }

    return (
        <nav
            className="library-tabs"
            aria-label="Secciones de la biblioteca"
        >
            <NavLink
                to="/library"
                end
                className={getClassName}
            >
                <span>💿</span>
                Discos
            </NavLink>

            <NavLink
                to="/songs"
                className={getClassName}
            >
                <span>♪</span>
                Canciones top
            </NavLink>

            <NavLink
                to="/ranking"
                className={getClassName}
            >
                <span>♛</span>
                Ranking
            </NavLink>
        </nav>
    );
}

export default LibraryTabs;