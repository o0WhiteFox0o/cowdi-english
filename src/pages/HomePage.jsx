import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { LESSONS, LEVELS } from '../data/lessons';
import { PET_REGISTRY, getPetEvolution, getPetMood, SKILL_META, getSkillLevel } from '../data/pets';

export default function HomePage() {
  const { userData } = useUser();
  const { petData, getActivePetWithDecay } = usePet();
  const level = getUserLevel(userData.totalXP);
  const activePet = getActivePetWithDecay();
  const species = activePet ? PET_REGISTRY[activePet.speciesId] : null;
  const evo = activePet && species ? getPetEvolution(activePet.speciesId, activePet.totalXpEarned) : null;
  const mood = activePet ? getPetMood(activePet.needs) : 'happy';
  const nextLevel = LEVELS.find((l) => l.xpRequired > userData.totalXP);
  const progress = nextLevel
    ? ((userData.totalXP - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100
    : 100;

  const dailyLesson = LESSONS.find((l) => !userData.completedLessons.includes(l.id)) || LESSONS[0];

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="row align-items-center py-5 mb-4">
        <div className="col-lg-8">
          <h1 className="display-5 fw-bold mb-3">
            Học tiếng Anh cùng <span className="text-cowdi-primary">{species?.name || 'Cowdi'}</span>!
            {evo?.image ? (
              <img src={evo.image} alt="pet" style={{ height: '1.2em', verticalAlign: 'middle', marginLeft: 8, objectFit: 'contain' }} />
            ) : (
              <span> {evo?.emoji || '🐮'}</span>
            )}
          </h1>
          <p className="lead text-secondary mb-4">
            Chào mừng bạn đến với Cowdi English! Hãy bắt đầu hành trình học tiếng Anh thú vị cùng chú bò đáng yêu nhé!
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <Link to="/lessons" className="btn btn-cowdi-primary btn-lg">
              <i className="fas fa-play me-2"></i>Bắt đầu học
            </Link>
            <Link to="/practice" className="btn btn-outline-cowdi btn-lg">
              <i className="fas fa-pen me-2"></i>Luyện tập
            </Link>
          </div>
        </div>
        <div className="col-lg-4 text-center d-none d-lg-block">
          <Link to="/pet" className="text-decoration-none">
            {evo?.image ? (
              <img src={evo.image} alt={evo.name} style={{ maxWidth: 160, maxHeight: 200, objectFit: 'contain' }} />
            ) : (
              <div style={{ fontSize: '6rem', lineHeight: 1 }}>{evo?.emoji || '🐮'}</div>
            )}
            <div className="mt-2 fw-bold text-cowdi-primary">{activePet?.customName || 'Cowdi'}</div>
            <small className="text-muted">{evo?.name || ''}</small>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-5">
        {[
          { icon: '⭐', value: userData.totalXP,        label: 'Điểm XP' },
          { icon: '🔥', value: userData.streak,          label: 'Ngày streak' },
          { icon: '📚', value: userData.lessonsCompleted, label: 'Bài đã học' },
          { icon: '🃏', value: userData.wordsLearned,    label: 'Từ đã thuộc' },
          { icon: '🪙', value: petData.coins,            label: 'Coins' },
        ].map((s, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div className="card text-center shadow-sm h-100">
              <div className="card-body py-3">
                <div className="fs-3 mb-1">{s.icon}</div>
                <div className="fs-2 fw-bold text-cowdi-primary">{s.value}</div>
                <div className="text-muted small">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Level Progress */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="fas fa-trophy text-warning me-2"></i>Cấp độ của bạn
          </h5>
          <div className="d-flex align-items-center gap-3">
            <div className="level-badge-lg">Lv.{level.level}</div>
            <div className="flex-grow-1">
              <div className="fw-bold mb-1">{level.title}</div>
              <div className="progress" style={{ height: '12px' }}>
                <div
                  className="progress-bar progress-bar-cowdi"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <small className="text-muted mt-1 d-block">
                {userData.totalXP} / {nextLevel ? nextLevel.xpRequired : level.xpRequired} XP
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <h4 className="fw-bold mb-3"><i className="fas fa-star text-warning me-2"></i>Tính năng nổi bật</h4>
      <div className="row g-3 mb-5">
        {[
          { icon: '📖', title: 'Bài học tương tác',   desc: '8 bài học từ cơ bản đến nâng cao' },
          { icon: '🃏', title: 'Flashcard thông minh', desc: 'Học từ vựng với thẻ lật và phát âm' },
          { icon: '🎯', title: 'Quiz đa dạng',         desc: 'Từ vựng, ngữ pháp & nghe hiểu' },
          { icon: '🏆', title: 'Thành tích & XP',      desc: 'Theo dõi tiến trình và mở khóa huy hiệu' },
          { icon: '🐾', title: 'Nuôi Pet',            desc: 'Chăm sóc pet, tiến hóa và sưu tầm' },
        ].map((f, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div className="card text-center shadow-sm h-100 card-hover">
              <div className="card-body">
                <div className="fs-2 mb-2">{f.icon}</div>
                <h6 className="card-title fw-bold">{f.title}</h6>
                <p className="card-text text-muted small mb-0">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Challenge */}
      <div className="card bg-cowdi-gradient text-white shadow-lg">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap py-4">
          <div className="fs-2">🎯</div>
          <div className="flex-grow-1">
            <h5 className="card-title mb-1 text-white">Thử thách hôm nay</h5>
            <p className="mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Hoàn thành bài: {dailyLesson.title}
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <span>{userData.dailyTasks.lessonDone ? '✅' : '⬜'} Học 1 bài</span>
              <span>{userData.dailyTasks.vocabDone  ? '✅' : '⬜'} Ôn từ vựng</span>
            </div>
          </div>
          <Link to={`/lessons/${dailyLesson.id}`} className="btn btn-light fw-bold">
            Làm ngay!
          </Link>
        </div>
      </div>
    </div>
  );
}

function getUserLevel(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  return current;
}
