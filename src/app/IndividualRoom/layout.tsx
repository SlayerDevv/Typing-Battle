import React from 'react';
import Head from 'next/head';
import { ClerkProvider } from '@clerk/nextjs';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function Layout({ children, title = 'Typing Battle' }: LayoutProps) {
  return (
    <ClerkProvider>
      <div>
        <Head>
          <title>{title}</title>
          <meta name="description" content="Typing Battle - See your skills" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>{children}</main>
      </div>
    </ClerkProvider>
  );
}