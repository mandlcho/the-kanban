import { useSession } from './hooks/useSession';
import Auth from './components/Auth';
import KanbanApp from './components/KanbanApp';
import './App.css';

function App() {
  const { session } = useSession();

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? <Auth /> : <KanbanApp key={session.user.id} session={session} />}
    </div>
  );
}

export default App;

