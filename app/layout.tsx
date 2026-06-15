/**
 * LAYOUT PRINCIPAL: app/layout.tsx
 * DESCRIPCIÓN: Layout raíz de la aplicación que provee fuentes, estilos y el contexto de autenticación Clerk.
 * CARACTERÍSTICAS:
 *   - Configura las fuentes de Google Fonts (Archivo Black y JetBrains Mono) con variables de CSS.
 *   - Envuelve la aplicación entera con `ClerkProvider` para autenticación segura.
 *   - Inyecta el panel de simulación `SimulatorPanel` de forma global en todas las vistas de la app.
 */
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next";
import { Archivo_Black, JetBrains_Mono } from 'next/font/google';
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
        </ClerkProvider>
      </body>
    </html>
  );
}
