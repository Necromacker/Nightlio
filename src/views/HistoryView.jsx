import { Camera } from 'lucide-react';
import MoodPicker from '../components/mood/MoodPicker';
import HistoryList from '../components/history/HistoryList';

const HistoryView = ({ pastEntries, loading, error, onMoodSelect, onDelete, onEdit, onCameraClick, renderOnlyHeader = false }) => {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeString = currentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <MoodPicker onMoodSelect={onMoodSelect} />
          {onCameraClick && (
            <button
              onClick={onCameraClick}
              style={{
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Camera size={18} />
              Detect Mood with Camera
            </button>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '1.25rem', lineHeight: '1.2' }}>Today</h2>
          <div style={{ color: 'var(--text)', opacity: 0.9, fontSize: '0.8rem', marginTop: '0.125rem', lineHeight: '1.2' }}>
            {dateString}
          </div>
          <div style={{ color: 'var(--text)', opacity: 0.7, fontSize: '0.75rem', marginTop: '0.0625rem', lineHeight: '1.2' }}>
            {timeString}
          </div>
        </div>
      </div>
  {renderOnlyHeader ? null : (
      <HistoryList 
        entries={pastEntries} 
        loading={loading} 
        error={error} 
        onDelete={onDelete}
        onEdit={onEdit}
      />
  )}
    </>
  );
};

export default HistoryView;