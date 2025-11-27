import React from 'react';
import { useDocumentTitle } from '../hooks/use-document-title';

const TermsOfService = () => {
    useDocumentTitle('Terms of Service | TripPlanner');
    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
            <p className="text-text-secondary">
                This page is currently under construction.
                Detailed Terms of Service will be available here soon.
            </p>
        </div>
    );
};

export default TermsOfService;
