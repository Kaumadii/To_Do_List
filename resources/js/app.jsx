import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import DeletedPage from "./pages/DeletedPage";
import CategoriesPage from "./pages/CategoriesPage";

function Root() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/tasks"
                            element={
                                <ProtectedRoute>
                                    <TasksPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/deleted"
                            element={
                                <ProtectedRoute>
                                    <DeletedPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                        path="/categories"
                        element={
                        <ProtectedRoute>
                            <CategoriesPage />
                        </ProtectedRoute>
                           }
                        />
 
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Routes>

                    {/* 🔔 Toasts for the whole app */}
                    <ToastContainer
                        position="top-right"
                        autoClose={2500}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        pauseOnHover
                        draggable
                        theme="light"
                    />
                </>
            </BrowserRouter>
        </AuthProvider>
    );
}

const container = document.getElementById("app");
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <Root />
        </React.StrictMode>
    );
}

