import './globals.css';
import { AuthProvider } from '@/lib/auth';
import AppLayout from '@/components/AppLayout';

export const metadata = {
    title: 'Chakraview',
    description: 'Next-generation neural orchestration and agentic control',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <AppLayout>{children}</AppLayout>
                </AuthProvider>
            </body>
        </html>
    );
}
