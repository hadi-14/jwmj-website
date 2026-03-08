import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

            <div className="prose prose-lg">
                <p className="mb-4">
                    This Privacy Policy describes how we collect, use, and protect your personal information when you use our website.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
                <p className="mb-4">
                    We may collect the following types of information:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Personal information you provide when registering for events or submitting forms</li>
                    <li>Contact information for communication purposes</li>
                    <li>Usage data through cookies and analytics</li>
                    <li>Information about your device and browser</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
                <p className="mb-4">
                    We use the collected information to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Process event registrations and form submissions</li>
                    <li>Communicate with you about our services</li>
                    <li>Improve our website and services</li>
                    <li>Ensure security and prevent fraud</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
                <p className="mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or required by law.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
                <p className="mb-4">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
                <p className="mb-4">
                    Our website uses cookies to enhance your browsing experience. You can control cookie settings through your browser preferences.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
                <p className="mb-4">
                    You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
                <p className="mb-4">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                <p className="mb-4">
                    If you have any questions about this Privacy Policy, please contact us through our contact page.
                </p>
            </div>
        </div>
    );
}