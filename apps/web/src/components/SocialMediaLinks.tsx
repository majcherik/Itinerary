import React from 'react';

const SocialMediaLinks: React.FC = () => {
    return (
        <div className="flex flex-col gap-2 group items-start">
            {/* Twitter Card */}
            <button
                style={{ backgroundColor: '#000000' }}
                className="relative w-[120px] h-auto flex flex-row justify-start items-center px-3 py-2 rounded-md cursor-pointer text-white transition-all duration-200 hover:scale-110 hover:z-10 group-hover:[&:not(:hover)]:blur-[5px] shadow-md hover:opacity-100"
            >
                <div className="flex flex-row justify-start items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="#fff" className="w-[18px] h-[18px]">
                        <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
                    </svg>
                    <p className="text-xs font-normal">Twitter</p>
                </div>
            </button>

            {/* Facebook Card */}
            <button
                style={{ backgroundColor: '#4267B2' }}
                className="relative w-[120px] h-auto flex flex-row justify-start items-center px-3 py-2 rounded-md cursor-pointer text-white transition-all duration-200 hover:scale-110 hover:z-10 group-hover:[&:not(:hover)]:blur-[5px] shadow-md hover:opacity-100"
            >
                <div className="flex flex-row justify-start items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                        <path d="m22 16.19c0 3.64-2.17 5.81-5.81 5.81h-1.19c-.55 0-1-.45-1-1v-5.77c0-.27.22-.5.49-.5l1.76-.03c.14-.01.26-.11.29-.25l.35-1.91c.03-.18-.11-.35-.3-.35l-2.13.03c-.28 0-.5-.22-.51-.49l-.04-2.45c0-.16.13-.29999.3-.29999l2.4-.04001c.17 0 .3-.12999.3-.29999l-.04-2.40002c0-.17-.13-.29999-.3-.29999l-2.7.04001c-1.66.03-2.98 1.38999-2.95 3.04999l.05 2.75c.01.28-.21.5-.49.51l-1.2.02c-.17 0-.29999.13-.29999.3l.03 1.9c0 .17.12999.3.29999.3l1.2-.02c.28 0 .5.22.51.49l.09 5.7c.01.56-.44 1.02-1 1.02h-2.3c-3.64 0-5.81-2.17-5.81-5.82v-8.37c0-3.64 2.17-5.81 5.81-5.81h8.38c3.64 0 5.81 2.17 5.81 5.81z" fill="#fff" />
                    </svg>
                    <p className="text-xs font-normal">Facebook</p>
                </div>
            </button>

            {/* Instagram Card */}
            <button
                style={{ backgroundColor: '#E1306C' }}
                className="relative w-[120px] h-auto flex flex-row justify-start items-center px-3 py-2 rounded-md cursor-pointer text-white transition-all duration-200 hover:scale-110 hover:z-10 group-hover:[&:not(:hover)]:blur-[5px] shadow-md hover:opacity-100"
            >
                <div className="flex flex-row justify-start items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="#fff" className="w-[18px] h-[18px]">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 0 0 1.384 2.126A5.868 5.868 0 0 0 4.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 0 0 2.126-1.384 5.86 5.86 0 0 0 1.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 0 0-1.384-2.126A5.847 5.847 0 0 0 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382 3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899 3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
                    </svg>
                    <p className="text-xs font-normal">Instagram</p>
                </div>
            </button>
        </div>
    );
};

export default SocialMediaLinks;
