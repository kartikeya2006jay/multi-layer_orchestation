import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
    title: 'AI Agent Command Center',
    description: 'Launch, monitor, and control multiple AI agents with human oversight',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="app-layout">
                    <Sidebar />
                    <main className="main-content">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
