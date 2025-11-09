import { useState, useEffect } from 'react';
import { Zap, Flame, Target, BarChart3, Crown } from 'lucide-react';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';
import apiService from '../services/api';

// Simple Achievement Card Component
const AchievementCard = ({ achievement, isUnlocked = true, progressValue, progressMax }) => {
  const getIcon = (iconName) => {
    const icons = { Zap, Flame, Target, BarChart3, Crown };
    return icons[iconName] || Zap;
  };

  const IconComponent = getIcon(achievement.icon);
  const rarityToken = (achievement.rarity || '').toLowerCase();
  const rarityStyles = {
    legendary: { bg: 'color-mix(in oklab, gold 25%, transparent)', text: 'var(--text)', border: 'color-mix(in oklab, gold, transparent 50%)' },
    rare: { bg: 'color-mix(in oklab, var(--accent-600) 20%, transparent)', text: 'var(--text)', border: 'color-mix(in oklab, var(--accent-600), transparent 60%)' },
    uncommon: { bg: 'color-mix(in oklab, #34a0ff 20%, transparent)', text: 'var(--text)', border: 'color-mix(in oklab, #34a0ff, transparent 60%)' },
    common: { bg: 'color-mix(in oklab, var(--text) 12%, transparent)', text: 'var(--text)', border: 'color-mix(in oklab, var(--text), transparent 60%)' },
  };
  const r = rarityStyles[rarityToken] || rarityStyles.common;

  return (
    <div style={{
      position: 'relative',
      boxSizing: 'border-box',
      padding: '1.25rem',
      borderRadius: '12px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '280px',
      overflow: 'hidden',
      width: '100%',
      margin: 0,
      opacity: isUnlocked ? 1 : 0.9,
      transition: 'transform 0.18s ease',
      willChange: 'transform'
    }}>
      {rarityToken && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '4px 8px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          background: r.bg,
          color: r.text,
          border: `1px solid ${r.border}`,
          letterSpacing: 0.3
        }} aria-label={`rarity: ${rarityToken}`}>
          {rarityToken}
        </div>
      )}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          background: isUnlocked 
            ? 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))'
            : 'linear-gradient(135deg, color-mix(in oklab, var(--text), transparent 40%), color-mix(in oklab, var(--text), transparent 20%))',
          borderRadius: '50%',
          padding: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <IconComponent size={26} color="white" />
        </div>
      </div>
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ 
            color: isUnlocked ? 'var(--text)' : 'color-mix(in oklab, var(--text), transparent 40%)', 
            margin: '0 0 0.5rem 0',
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.2,
          }}>
            {achievement.name}
          </h3>
          <p style={{ 
            color: isUnlocked ? 'color-mix(in oklab, var(--text), transparent 15%)' : 'color-mix(in oklab, var(--text), transparent 45%)', 
            margin: '0 0 1rem 0',
            fontSize: '0.9rem',
            lineHeight: 1.35,
          }}>
            {achievement.description}
          </p>
        </div>
        <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!isUnlocked ? (
            <div style={{ width: '100%' }}>
              <ProgressBar value={typeof progressValue === 'number' ? progressValue : 0} max={typeof progressMax === 'number' ? progressMax : 7} label="Progress" />
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}>
              <Zap size={14} />
              Unlocked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// All possible achievements
const getAllAchievements = () => [
  {
    achievement_type: 'first_entry',
    name: 'First Entry',
    description: 'Log your first mood entry',
    icon: 'Zap',
    rarity: 'common'
  },
  {
    achievement_type: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    rarity: 'uncommon'
  },
  {
    achievement_type: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: 'Crown',
    rarity: 'rare'
  },
  {
    achievement_type: 'data_lover',
    name: 'Data Lover',
    description: 'View statistics 10 times',
    icon: 'BarChart3',
    rarity: 'uncommon'
  },
  {
    achievement_type: 'mood_master',
    name: 'Mood Master',
    description: 'Log 100 total entries',
    icon: 'Target',
    rarity: 'legendary'
  }
];

const AchievementsView = () => {
  // Web3 removed
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [data, prog] = await Promise.all([
        apiService.getUserAchievements(),
        apiService.getAchievementsProgress(),
      ]);
      setAchievements(data);
      setProgress(prog || {});
    } catch (err) {
      setError('Failed to load achievements');
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading achievements...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--accent-600)' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>

  {/* Web3 notice removed */}

      {/* Achievements Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: 0,
        margin: 0,
        alignItems: 'stretch',
        alignContent: 'flex-start',
        width: '100%'
      }}>
        {/* All possible achievements */}
        {getAllAchievements().map((achievement, index) => {
          const unlockedAchievement = achievements.find(a => a.achievement_type === achievement.achievement_type);
          const isUnlocked = !!unlockedAchievement;
          const p = progress[achievement.achievement_type] || null;
          const progressValue = isUnlocked ? undefined : (p ? p.current : 0);
          const progressMax = p ? p.max : 7;
          return (
            <div
              key={index}
              onClick={() => setActive(unlockedAchievement || achievement)}
              style={{
                cursor: 'pointer',
                flex: '1 1 300px',
                minWidth: 260,
                maxWidth: '100%',
                display: 'flex'
              }}
            >
              <AchievementCard 
                achievement={unlockedAchievement || achievement}
                isUnlocked={isUnlocked}
                progressValue={progressValue}
                progressMax={progressMax}
              />
            </div>
          );
        })}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name || 'Achievement'}>
        <p style={{ marginTop: 0 }}>{active?.description}</p>
        {!achievements.find(a => a.achievement_type === active?.achievement_type) && (() => {
          const p = progress[active?.achievement_type] || { current: 0, max: 7 };
          return <ProgressBar value={p.current || 0} max={p.max || 7} label="Progress to unlock" />;
        })()}
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          Tips: Log daily to maintain your streak. Viewing statistics contributes to "Data Lover".
        </div>
      </Modal>
    </div>
  );
};

export default AchievementsView;