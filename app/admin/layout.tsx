import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  // Si no está logueado o su correo no empieza con "admin" (ej. admin+clerktest@iaw.com)
  // lo redirecciona de forma segura a la consola del Radar táctico (/dashboard)
  if (!email || !email.toLowerCase().startsWith('admin')) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
