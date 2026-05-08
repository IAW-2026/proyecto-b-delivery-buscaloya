import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next";
import { Archivo_Black, JetBrains_Mono } from 'next/font/google';
import { SimulatorPanel } from '@/components/SimulatorPanel';
import "./globals.css";

const archivoBlack = Archivo_Black({ 
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-archivo-black'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: "Delivery App - Etapa 2",
  description: "Módulo de logística y entregas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${archivoBlack.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col bg-black text-white`}>
        <ClerkProvider>
          {children}
          <SimulatorPanel />
        </ClerkProvider>
      </body>
    </html>
  );
}
