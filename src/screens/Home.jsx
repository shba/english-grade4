import { useState } from 'react';
import { addProfile, getState, setActive, profileData } from '../lib/store.js';
import { TEST_INFO } from '../data/content.js';

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🦄', '🐯', '🐨', '🐙', '🚀', '⚽', '🌸', '🦖'];

export default function Home({ go }) {
  const { profiles } = getState();
  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const create = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProfile(name.trim(), avatar);
    go('menu');
  };

  return (
    <div className="screen home">
      <div className="hero">
        <div className="logo" aria-hidden="true">🇬🇧✏️</div>
        <h1>אנגלית לכיתה ד׳</h1>
        <p className="sub">
          {TEST_INFO.title} · {TEST_INFO.dates}
        </p>
      </div>

      {!adding && (
        <>
          <h2>מי מתרגל היום?</h2>
          <div className="profiles">
            {profiles.map((p) => (
              <button
                key={p.id}
                className="profile"
                onClick={() => {
                  setActive(p.id);
                  go('menu');
                }}
              >
                <span className="avatar">{p.avatar}</span>
                <span className="pname">{p.name}</span>
                <span className="pstars">⭐ {profileData(p.id).stars}</span>
              </button>
            ))}
            <button className="profile add" onClick={() => setAdding(true)}>
              <span className="avatar">➕</span>
              <span className="pname">פרופיל חדש</span>
            </button>
          </div>
        </>
      )}

      {adding && (
        <form className="card new-profile" onSubmit={create}>
          <h2>פרופיל חדש</h2>
          <label>
            איך קוראים לך?
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם" maxLength={16} autoFocus />
          </label>
          <div className="avatars">
            {AVATARS.map((a) => (
              <button type="button" key={a} className={a === avatar ? 'on' : ''} onClick={() => setAvatar(a)} aria-label={a}>
                {a}
              </button>
            ))}
          </div>
          <div className="row">
            <button className="primary" type="submit" disabled={!name.trim()}>
              יאללה, מתחילים!
            </button>
            {profiles.length > 0 && (
              <button type="button" onClick={() => setAdding(false)}>
                ביטול
              </button>
            )}
          </div>
        </form>
      )}

      <button className="parent-link" onClick={() => go('parent')}>
        👨‍👩‍👧 מסך הורים
      </button>
    </div>
  );
}
