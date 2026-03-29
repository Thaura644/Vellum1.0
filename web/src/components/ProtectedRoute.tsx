import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token } = useAuthStore();
    const location = useLocation();

    if (!token) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
