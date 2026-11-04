import { useEffect, useState, useSyncExternalStore } from 'react';
import Home from './screens/Home.jsx';
import Menu from './screens/Menu.jsx';
import Topic, { Learn } from './screens/Topic.jsx';
import Quiz from './screens/Quiz.jsx';
import Memory from './screens/Memory.jsx';
import DragPrep from './screens/DragPrep.jsx';
import Results from './screens/Results.jsx';
import Parent from './screens/Parent.jsx';
import { GAMES, buildSession, buildExam, buildWeakSession } from './lib/questions.js';
import { subscribe, getState, activeProfile, recordExam } from './lib/store.js';

function makeSession(name, params) {
  const key = Date.now();
  if (name === 'game') {
    const g = GAMES[params.topic].find((x) => x.id === params.game);
    return g.gen ? { key, questions: buildSession(g.gen, g.write ? 8 : 10), title: g.he } : null;
  }
  if (name === 'exam') return { key, questions: buildExam() };
  if (name === 'weak') return { key, questions: buildWeakSession(params.keys), title: 'תרגול נקודות חלשות' };
  return null;
}

export default function App() {
  useSyncExternalStore(subscribe, getState);
  const [route, setRoute] = useState(() => ({ name: activeProfile() ? 'menu' : 'home' }));

  const go = (name, params = {}) => {
    setRoute({ name, ...params, session: makeSession(name, params) });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    // Warm up the handwriting model in the background so the first writing task is instant.
    const id = setTimeout(() => import('./lib/recognizer.js').then((m) => m.loadModel()).catch(() => {}), 2500);
    return () => clearTimeout(id);
  }, []);


  if (!activeProfile() && !['home', 'parent'].includes(route.name)) return <Home go={go} />;

  const { session } = route;
  switch (route.name) {
    case 'home':
      return <Home go={go} />;
    case 'menu':
      return <Menu go={go} />;
    case 'topic':
      return <Topic topic={route.topic} go={go} />;
    case 'learn':
      return <Learn topic={route.topic} go={go} />;
    case 'parent':
      return <Parent onBack={() => go(activeProfile() ? 'menu' : 'home')} onPracticeWeak={(keys) => go('weak', { keys })} />;
    case 'game': {
      const g = GAMES[route.topic].find((x) => x.id === route.game);
      const back = () => go('topic', { topic: route.topic });
      if (g.memory) return <Memory key={route.game} topic={g.memory} onBack={back} />;
      if (g.drag) return <DragPrep onBack={back} />;
      if (!session) return null;
      return (
        <Quiz
          key={session.key}
          title={session.title}
          questions={session.questions}
          onBack={back}
          onFinish={(r) => go('result', { result: r, from: route })}
        />
      );
    }
    case 'weak':
    case 'exam': {
      if (!session) return null;
      const exam = route.name === 'exam';
      return (
        <Quiz
          key={session.key}
          title={session.title}
          questions={session.questions}
          exam={exam}
          onBack={() => go('menu')}
          onFinish={(r) => {
            if (exam) recordExam({ score: r.score, total: r.total, wrong: r.answers.filter((a) => !a.ok).map((a) => a.q.key) });
            go('result', { result: r, from: route });
          }}
        />
      );
    }
    case 'result': {
      const from = route.from;
      return (
        <Results
          result={route.result}
          exam={from.name === 'exam'}
          onAgain={() => go(from.name, from)}
          onBack={() => go(from.name === 'game' ? 'topic' : 'menu', { topic: from.topic })}
        />
      );
    }
    default:
      return <Menu go={go} />;
  }
}
