/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { decode } from "jsonwebtoken";

interface UserPayload {
    role: string;
    exp: number;
    [key: string]: any;
}

const withAdminAuth = (WrappedComponent: React.ComponentType) => {
    const AdminGuard = (props: any) => {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        useEffect(() => {
            if (typeof window === 'undefined') return;

            const token = localStorage.getItem('accessToken') || "";

            if (!token) {
                router.replace("/login"); 
                return;
            }

            try {
                const decodedToken = decode(token) as UserPayload;
                if (!decodedToken || decodedToken.role === "user") {
                    router.replace("/notfound");
                    localStorage.removeItem('role');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('USER_INFO');
                    return;
                }
                localStorage.setItem('role', decodedToken.role);
                setIsAuthenticated(true);
            } catch (error) {
                router.replace("/login");
            }
        }, [router]);

        if (!isAuthenticated) return null;

        return <WrappedComponent {...props} />;
    };

    return AdminGuard;
};

export default withAdminAuth;