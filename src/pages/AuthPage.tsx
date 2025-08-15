
import { AuthPage as AuthComponent } from '@/components/auth/AuthPage';
import { useSearchParams } from 'react-router-dom';

export default function AuthPage() {
  // Default to login mode
  const [params,setParams] = useSearchParams();
  const login = params.get('mode') === 'login';
  return (
    <>
      <AuthComponent login={login === 'login'} />
    </>
  )
}
