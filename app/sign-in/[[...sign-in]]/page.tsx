/**
 * PÁGINA VISUAL: GET /sign-in
 * DESCRIPCIÓN: Pantalla de inicio de sesión de Clerk.
 * CARACTERÍSTICAS:
 *   - Renderiza el componente seguro de inicio de sesión (`SignIn`) centrado en pantalla.
 */
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignIn />
    </div>
  )
}
