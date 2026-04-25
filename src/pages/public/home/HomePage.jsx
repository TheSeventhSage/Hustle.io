import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../features/auth/auth.store.js';

import HustleIOPremiumHero from './components/HustleIOPremiumHero.jsx'
import HustleIOPremiumSections from './components/HustleIOPremiumSections.jsx'



export default function HustleIO() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isRedirecting = useAuthStore((s) => s.isRedirecting);

    // Redirect authenticated users to feed immediately
    useEffect(() => {
        if (isAuthenticated && !isRedirecting) {
            navigate('/feed', { replace: true });
        }
    }, [isAuthenticated, isRedirecting, navigate]);

    // Show loading state during redirect to prevent flash
    if (isAuthenticated || isRedirecting) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#387D70] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-[#D4AF37] selection:text-[#0A1F16]">

            {/* --- NAVIGATION (UNDERSTATED AUTHORITY) --- */}
            <HustleIOPremiumHero />


            {/* --- DISCOVERY LAYER --- */}
            <HustleIOPremiumSections />
        </div>
    );
}