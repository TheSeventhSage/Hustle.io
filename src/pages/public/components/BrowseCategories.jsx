import {
    LaptopMinimal,
    UserRoundCog,
    PenTool,
    UsersRound,
    Search,
    Paintbrush,
    SquarePen,
    ArrowDownLeft,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/BrowseCategories.css';
import { useMarketplaceCategories } from '../api/services.hooks.js';

const FALLBACK_CATEGORIES = [
    {
        id: 1,
        title: 'Team Leader',
        icon: 'wordpress',
        backgroundImage: '/images/team-leader.jpg',
    },
    {
        id: 2,
        title: 'Software Developer',
        icon: LaptopMinimal,
        backgroundImage: '/images/software-developer.jpg',
    },
    {
        id: 3,
        title: 'Software Tester',
        icon: UserRoundCog,
        backgroundImage: '/images/software-tester.jpg',
    },
    {
        id: 4,
        title: 'Graphic Designer',
        icon: PenTool,
        backgroundImage: '/images/graphic-designer.jpg',
    },
    {
        id: 5,
        title: 'Software Tester',
        icon: UsersRound,
        backgroundImage: '/images/software-tester-2.jpg',
    },
    {
        id: 6,
        title: 'Team Leader',
        icon: Search,
        backgroundImage: '/images/team-leader-2.jpg',
    },
    {
        id: 7,
        title: 'UX Designer',
        icon: Paintbrush,
        backgroundImage: '/images/ux-designer.jpg',
    },
    {
        id: 8,
        title: 'Digital Marketer',
        icon: SquarePen,
        backgroundImage: '/images/digital-marketer.jpg',
    },
];

const BrowseCategories = () => {
    const navigate = useNavigate();
    const { data: categoriesData = [] } = useMarketplaceCategories({ retry: false });

    const categories = useMemo(() => {
        const source = Array.isArray(categoriesData) && categoriesData.length
            ? categoriesData.map((item, index) => {
                const fallback = FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length];

                return {
                    id: item?.id ?? `${item?.name ?? item?.title ?? 'category'}-${index}`,
                    title: item?.name ?? item?.title ?? fallback.title,
                    icon: fallback.icon,
                    backgroundImage: fallback.backgroundImage,
                };
            })
            : FALLBACK_CATEGORIES;

        return source;
    }, [categoriesData]);

    const renderIcon = (IconComponent) => {
        if (IconComponent === 'wordpress') {
            return (
                <div className="w-[52px] h-[52px] border-[3px] border-white rounded-full flex items-center justify-center bg-transparent md:w-12 md:h-12">
                    <span className="text-white text-[30px] font-black leading-none md:text-[28px]">W</span>
                </div>
            );
        }
        return <IconComponent size={52} strokeWidth={2} className="text-white w-[52px] h-[52px] stroke-2 md:w-12 md:h-12" />;
    };

    return (
        <section className="w-full h-fit bg-[var(--color-green-dark)] py-[38px] px-[34px] pb-12 flex sm:items-center sm:justify-center xl:py-8 xl:px-10 xl:pb-10 lg:py-7 lg:px-8 lg:pb-9 md:py-6 md:px-5 md:pb-8 md:min-h-0">
            <div className="w-full max-w-[1480px] mx-auto">
                <h2 className="text-[60px] font-black text-center leading-[1.05] tracking-tight mb-2 xl:text-[52px] lg:text-[44px] md:text-[38px] max-md:text-[32px]">
                    <span className="text-white">Popular Service</span>{' '}
                    <span className="text-[var(--color-secondary)]">Categories</span>
                </h2>

                <p className="text-[16px] leading-[1.25] text-white text-center max-w-[620px] mx-auto mb-[45px] xl:text-[21px] lg:text-[19px] lg:max-w-[540px] md:text-lg md:max-w-[480px] md:mb-9">
                    Browse trusted professionals across different service categories and find the right expertise for your needs.
                </p>

                <div className="browse-categories-row flex w-full gap-4 overflow-x-auto overflow-y-hidden pb-4 snap-x snap-mandatory">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="category-card relative h-[280px] w-[260px] shrink-0 snap-start bg-primary-200 border border-[rgba(255,255,255,0.12)] rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1 xl:h-[260px] xl:w-[240px] lg:h-[245px] lg:w-[220px] md:h-[235px] md:w-[210px] max-sm:h-[250px] max-sm:w-[78vw]"
                            style={{
                                '--hover-bg-image': `url(${category.backgroundImage})`,
                            }}
                            onClick={() => navigate(`/services?category=${encodeURIComponent(category.title)}`)}
                        >
                            <div className="card-overlay absolute inset-0 bg-[rgba(9,35,17,0.72)] z-[1] opacity-0 transition-opacity duration-300 pointer-events-none"></div>

                            <div className="relative z-[2] flex flex-col items-center justify-center text-center p-5 gap-6 md:mb-8">
                                <div className="flex items-center justify-center">
                                    {renderIcon(category.icon)}
                                </div>

                                <h3 className="text-[19px] font-extrabold text-white m-0 leading-[1.2] lg:text-lg md:text-[17px]">{category.title}</h3>
                            </div>

                            <div className="decorative-circle absolute -top-2.5 -right-2 w-[82px] h-[82px] bg-primary-200 rounded-full shadow-[-2px_2px_4px_rgba(0,0,0,0.15)] z-0 opacity-100 transition-opacity duration-300 lg:w-[72px] lg:h-[72px] md:w-16 md:h-16 md:-top-2 md:-right-1.5"></div>
                            <div className="hover-arrow-button absolute -top-3 -right-2.5 w-[78px] h-[78px] bg-primary rounded-full flex items-center justify-center shadow-[0_0_0_6px_rgba(111,154,109,0.4)] z-[3] cursor-pointer opacity-0 transition-all duration-300 pointer-events-none hover:scale-105 lg:w-[68px] lg:h-[68px] md:w-[60px] md:h-[60px] md:-top-2.5 md:-right-2">
                                <ArrowDownLeft size={28} strokeWidth={2.5} className="text-white md:w-6 md:h-6" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrowseCategories;
