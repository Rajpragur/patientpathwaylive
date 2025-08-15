
import { AuthPage as AuthComponent } from '@/components/auth/AuthPage';
import { useSearchParams } from 'react-router-dom';

export default function AuthPage() {
  const [params] = useSearchParams();
  return (
    <>
      <AuthComponent />
    </>
  )
}
