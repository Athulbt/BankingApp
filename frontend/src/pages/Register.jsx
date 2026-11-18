import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Alert } from '../components/ui';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.errors?.map((x) => x.msg).join('. ') ||
        data?.message ||
        'We couldn’t create your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Open your account"
      subtitle="It takes about a minute. Your checking account is ready as soon as you finish."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <div>
          <label htmlFor="name" className="form-label">Full name</label>
          <input id="name" type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} className="input-field" required />
        </div>
        <div>
          <label htmlFor="email" className="form-label">Email address</label>
          <input id="email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="you@example.com" required />
        </div>
        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input id="password" type="password" name="password" autoComplete="new-password" minLength={6} value={formData.password} onChange={handleChange} className="input-field" required />
          <p className="form-hint">At least 6 characters.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="form-label">Phone</label>
            <input id="phone" type="tel" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="form-label">Date of birth</label>
            <input id="dateOfBirth" type="date" name="dateOfBirth" autoComplete="bday" value={formData.dateOfBirth} onChange={handleChange} className="input-field" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating your account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
