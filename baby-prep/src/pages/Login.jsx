import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { signInWithGoogle, authError } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);

    try {
      await signInWithGoogle();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <p className="login-eyebrow">MADDIE & NICK</p>

        <h1>Before Baby</h1>

        <p className="login-description">
          A little space for us to plan, research, dream, and get ready for
          whatever comes next.
        </p>

        <button
          className="google-button"
          onClick={handleGoogleSignIn}
          disabled={signingIn}
        >
          <span className="google-icon">G</span>
          {signingIn ? 'Signing in...' : 'Continue with Google'}
        </button>

        {authError && (
          <p className="login-error">
            {authError}
          </p>
        )}
      </div>
    </main>
  );
}

export default Login;