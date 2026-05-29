/**
 * PÁGINA VISUAL: GET /sign-up
 * DESCRIPCIÓN: Pantalla de registro de nuevos usuarios en Clerk.
 * CARACTERÍSTICAS:
 *   - Renderiza el componente seguro de registro (`SignUp`) centrado en pantalla.
 */
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignUp />
    </div>
  )
}
