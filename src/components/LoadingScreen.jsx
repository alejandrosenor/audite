import "./LoadingScreen.css";

function LoadingScreen() {
    return (
        <main className="loading-screen">
            <div className="loading-screen__logo">A</div>

            <div className="loading-screen__record">
                <div className="loading-screen__record-center" />
            </div>

            <p>Preparando tu próxima escucha...</p>
        </main>
    );
}

export default LoadingScreen;