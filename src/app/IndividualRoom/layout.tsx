import React from 'react';
import Head from 'next/head';
import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
  } from '@clerk/nextjs'
type LayoutProps = {
    children: React.ReactNode;
    title?: string;
};

const Layout: React.FC<LayoutProps> = ({ children, title = 'Typing Battle' }) => {
    return (
        <ClerkProvider>
        <div >
            <Head>
                <title>{title}</title>
                <meta name="description" content="Typing Battle - See your skills" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main >
                {children}
            </main>
            
        </div>
        </ClerkProvider>
    );
};

export default Layout;