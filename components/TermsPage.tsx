import React from 'react';

const TermsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="bg-gray-800/70 backdrop-blur-md border border-white/10 rounded-lg p-8">
                <h1 className="text-4xl font-extrabold text-white text-center mb-8">Terms and Conditions</h1>
                
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-4">
                    <p>Last updated: July 25, 2024</p>

                    <p>Please read these terms and conditions carefully before using Our Service.</p>

                    <h2 className="text-2xl font-bold text-white">1. Interpretation and Definitions</h2>
                    <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

                    <h2 className="text-2xl font-bold text-white">2. Acknowledgment</h2>
                    <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
                    <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>

                    <h2 className="text-2xl font-bold text-white">3. User Content</h2>
                    <p>Our Service allows You to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that You post to the Service, including its legality, reliability, and appropriateness.</p>
                    <p>By posting Content to the Service, You grant Us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of Your rights to any Content You submit, post or display on or through the Service and You are responsible for protecting those rights.</p>
                     <p>You represent and warrant that: (i) the Content is Yours (You own it) or You have the right to use it and grant Us the rights and license as provided in these Terms, and (ii) the posting of Your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</p>

                    <h2 className="text-2xl font-bold text-white">4. Intellectual Property</h2>
                    <p>The Service and its original content (excluding Content provided by You or other users), features and functionality are and will remain the exclusive property of the Company and its licensors. The Service is protected by copyright, trademark, and other laws of both the country and foreign countries.</p>
                    
                    <h2 className="text-2xl font-bold text-white">5. Changes to These Terms and Conditions</h2>
                    <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>

                    <h2 className="text-2xl font-bold text-white">6. Contact Us</h2>
                    <p>If you have any questions about these Terms and Conditions, You can contact us by email: contact@storyverse.ai</p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
