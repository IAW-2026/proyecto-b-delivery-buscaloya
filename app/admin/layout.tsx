import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;

  // VERIFICACIÓN DE SEGURIDAD ABSOLUTA (NIVEL SERVIDOR):
  // No existen correos electrónicos hardcodeados en el código fuente.
  // La autorización y el control de acceso dependen exclusivamente del metadato protegido "role"
  // gestionado y firmado criptográficamente de forma externa en los servidores de Clerk.
  if (role !== 'admin') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}


