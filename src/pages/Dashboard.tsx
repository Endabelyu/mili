import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || user?.email}</p>
      <button onClick={logout}>Logout</button>
      <p style={{ color: '#666', marginTop: 24 }}>
        This is a stub dashboard — copy your components from the monorepo <code>app/</code> folder here.
      </p>
    </div>
  );
}
