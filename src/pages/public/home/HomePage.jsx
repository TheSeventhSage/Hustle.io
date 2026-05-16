import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../features/auth/auth.store.js';
import BrandPreloader from '../../../shared/components/BrandPreloader.jsx';

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
        return <BrandPreloader />;
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
