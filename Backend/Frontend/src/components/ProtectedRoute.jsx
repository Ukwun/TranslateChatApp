import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
	const { authUser } = useAuthStore();

	if (!authUser) {
		// User is not authenticated, redirect to login page
		return <Navigate to='/login' />;
	}

	// User is authenticated, render the child component
	return children;
};

export default ProtectedRoute;