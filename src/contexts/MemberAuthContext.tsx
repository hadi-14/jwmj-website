'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ==================== MEMBER AUTH CONTEXT & PROVIDER ====================

// Define Member interface
interface Member {
    name: string;
    email: string;
    role: string;
    [key: string]: unknown;
}

interface MemberAuthContextType {
    member: Member | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const MemberAuthContext = createContext<MemberAuthContextType | null>(null);

export const useMemberAuth = () => {
    const context = useContext(MemberAuthContext);
    if (!context) {
        throw new Error('useMemberAuth must be used within MemberAuthProvider');
    }
    return context;
};

export function MemberAuthProvider({ children }: { children: React.ReactNode }) {
    const [member, setMember] = useState<Member | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/session', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                // Check if user is a member
                if (data.user && data.user.role === 'MEMBER') {
                    setMember(data.user);
                } else {
                    setMember(null);
                }
            } else {
                setMember(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setMember(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role: 'MEMBER' }),
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            setMember(data.user);
            router.push('/member');
        } catch (error: unknown) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setMember(null);
            router.push('/member/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MemberAuthContext.Provider
            value={{
                member,
                login,
                logout,
                isLoading,
                isAuthenticated: !!member,
            }}
        >
            {children}
        </MemberAuthContext.Provider>
    );
}
