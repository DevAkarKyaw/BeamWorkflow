import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Custom Components
import { SigninPage } from './pages/SigninPage';
import { SignupPage } from './pages/SignupPage';
import { MainPage } from './pages/MainPage';
import { ProtectedRoute } from './components/others/ProtectedRoute';
// Context
import { useGlobal } from './contexts/GlobalContext';
import { useUser } from './contexts/UserContext';

function updateTheme(themeName) {
    const existing = document.getElementById('bootswatch-theme-style');
    if (existing) {
        existing.parentNode.removeChild(existing);
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'bootswatch-theme-style';
    link.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/${themeName}/bootstrap.min.css`;
    document.head.appendChild(link);
}

// A wrapper for public routes that redirects if the user is already logged in.
const PublicRoute = ({ children }) => {
    const { authStatus } = useUser()
    // Redirect away from public pages like signin/signup if authenticated
    if (authStatus === 'authenticated') {
        return <Navigate to="/main" replace />;
    }
    return children;
};

export const App = () => {
    const { themeName } = useGlobal()

    useEffect(() => {
        updateTheme(themeName);
    }, [themeName]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Navigate to="/signin" replace />} />
                <Route
                    path='/signin'
                    element={
                        <PublicRoute>
                            <SigninPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path='/signup'
                    element={
                        <PublicRoute>
                            <SignupPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path='/main'
                    element={
                        <ProtectedRoute>
                            <MainPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}