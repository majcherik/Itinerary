import React, { useState } from 'react';

interface Tab {
    id: string | number;
    label: string;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab?: string | number;
    onTabChange?: (id: string | number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab: controlledActiveTab, onTabChange }) => {
    const [internalActiveTab, setInternalActiveTab] = useState(tabs[0].id);

    const isControlled = controlledActiveTab !== undefined;
    const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

    const handleTabChange = (id: string | number) => {
        if (isControlled && onTabChange) {
            onTabChange(id);
        } else {
            setInternalActiveTab(id);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 border-b border-border-color overflow-x-auto pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-6 py-3 font-bold text-lg rounded-t-xl border-t-2 border-x-2 transition-all whitespace-nowrap relative top-[2px] ${activeTab === tab.id
                            ? 'bg-bg-card text-accent-primary border-border-color border-b-bg-card z-10'
                            : 'bg-bg-secondary text-text-secondary border-transparent hover:bg-bg-secondary/80 hover:text-text-primary'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="animate-fade-in">
                {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};

export default Tabs;
