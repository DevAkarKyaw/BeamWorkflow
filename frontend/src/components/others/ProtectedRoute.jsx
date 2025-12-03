import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { Spinner, Container } from 'react-bootstrap';

export const ProtectedRoute = ({ children }) => {
    const { authStatus } = useUser();

    if (authStatus === 'pending') {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (authStatus === 'unauthenticated') {
        return <Navigate to="/signin" replace />;
    }

    return children;
};
