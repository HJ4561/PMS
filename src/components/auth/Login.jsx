import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Zap, ArrowRight, Shield, Users, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.u_name.split(' ')[0]}!`);
      navigate(user.role === 'supervisor' ? '/supervisor' : '/lead');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    if (role === 'supervisor') { setEmail('supervisor@pms.com'); setPassword('supervisor123'); }
    else { setEmail('lead1@pms.com'); setPassword('lead123'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(ellipse, rgba(108,99,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(ellipse, rgba(45,212,191,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        {/* Grid pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', position: 'relative', zIndex: 1 }}>
        <div className="animate-fade-in" style={{ maxWidth: 480 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-glow)' }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>AEEL-PMS</span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-1px' }}>
            Welcome<br />
            <span className="gradient-text">back.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 40 }}>
            Sign in to your workspace and get back to building amazing things.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label>Email address</label>
              <input
                className="input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 8, justifyContent: 'center', padding: '14px 24px', fontSize: 16, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 32 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>Quick access for demo</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => quickLogin('supervisor')}
                style={{ justifyContent: 'center', flexDirection: 'column', gap: 4, padding: '12px', height: 'auto' }}
              >
                <Shield size={16} style={{ color: 'var(--accent-secondary)' }} />
                <span style={{ fontSize: 13 }}>Supervisor</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>supervisor@pms.com</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => quickLogin('lead')}
                style={{ justifyContent: 'center', flexDirection: 'column', gap: 4, padding: '12px', height: 'auto' }}
              >
                <Users size={16} style={{ color: 'var(--accent-teal)' }} />
                <span style={{ fontSize: 13 }}>Team Lead</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>lead1@pms.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 480, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', position: 'relative', zIndex: 1 }}>
        <div className="animate-slide-right stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Everything you need to manage projects</h2>

          {[
            { icon: BarChart3, color: 'var(--accent-primary)', title: 'Real-time Insights', desc: 'Live dashboards with project health, team performance, and milestone tracking.' },
            { icon: Users, color: 'var(--accent-teal)', title: 'Team Management', desc: 'Assign roles, track member history, workload, and performance metrics.' },
            { icon: Shield, color: 'var(--accent-amber)', title: 'Role-based Access', desc: 'Supervisors oversee all, while leads manage their own scoped projects.' }
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="animate-fade-in" style={{ display: 'flex', gap: 16, padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 44, height: 44, background: `${color}20`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-display)' }}>{title}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}