import React, { useState, useEffect, useRef } from 'react';
import './WhoYouAreGame.css';
import { useNavigate } from 'react-router-dom';
import devops from '../../assets/devops.jpg';
import docs from '../../assets/docs.jpg';
import front from '../../assets/front.jpg';
import ninja from '../../assets/ninja.jpg';
import senior from '../../assets/senior.jpg';


// ============= TYPES =============
type ArchetypeType = 'senior' | 'frontend' | 'qa' | 'documentation' | 'devops';

interface Archetype {
  id: ArchetypeType;
  title: string;
  image: string;
  description: string;
  imageAlt: string;
}

interface Option {
  id: string;
  text: string;
  scores: Partial<Record<ArchetypeType, number>>;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

// ============= DATA =============
const questions: Question[] = [
  {
    id: 1,
    text: "Что ты сломаешь в первую очередь?",
    options: [
      { id: '1a', text: "Кофемашину (потому что без кофе жизни нет)", scores: { senior: 1 } },
      { id: '1b', text: "Сборку проекта (случайно запушила не туда)", scores: { qa: 1 } },
      { id: '1c', text: "Нервы коллеге (вечными вопросами \"а как это работает?\")", scores: { frontend: 1 } },
      { id: '1d', text: "Свой ноготь/каблук (ой, опять зацепилась)", scores: { documentation: 1 } },
    ],
  },
  {
    id: 2,
    text: "Твой метод дебаггинга (поиска ошибок)?",
    options: [
      { id: '2a', text: "print('я тут') или console.log — дедовский метод", scores: { senior: 1, devops: 1 } },
      { id: '2b', text: "Покликать всё подряд в интерфейсе, может, само починится", scores: { frontend: 1 } },
      { id: '2c', text: "Написать тесты, чтобы они точно указали на ошибку", scores: { qa: 2 } },
      { id: '2d', text: "Открыть документацию и мануалы", scores: { documentation: 2 } },
    ],
  },
  {
    id: 3,
    text: "Что у тебя на рабочем столе (виртуальном и физическом)?",
    options: [
      { id: '3a', text: "Терминал открыт, пара окон с кодом, больше ничего лишнего", scores: { senior: 1, devops: 1 } },
      { id: '3b', text: "Красивые обои, куча иконок, 15 вкладок браузера с дизайном", scores: { frontend: 2 } },
      { id: '3c', text: "Трекер задач, баг-трекинг система и список того, что сегодня упало", scores: { qa: 1 } },
      { id: '3d', text: "Идеально разложенные папки, гугл-док с заметками и стикеры", scores: { documentation: 1 } },
    ],
  },
  {
    id: 4,
    text: "Что ты говоришь, когда проект наконец-то запустился?",
    options: [
      { id: '4a', text: "«Ну, наконец-то, я устал... пошёл спать»", scores: { senior: 1 } },
      { id: '4b', text: "«Вау! Какая красота! Срочно скриншот в общий чат!»", scores: { frontend: 1 } },
      { id: '4c', text: "«Хм, а давайте теперь проверим, как оно падать будет?»", scores: { qa: 2 } },
      { id: '4d', text: "«Надо добавить это в документацию, чтобы все знали»", scores: { documentation: 1 } },
    ],
  },
  {
    id: 5,
    text: "Твой любимый напиток (символически)?",
    options: [
      { id: '5a', text: "Эспрессо. Один глоток — один коммит", scores: { senior: 1 } },
      { id: '5b', text: "Раф с карамелью и сиропом. Красиво же!", scores: { frontend: 1 } },
      { id: '5c', text: "Чай. Бесконечный чай, чтобы выслеживать баги", scores: { qa: 1 } },
      { id: '5d', text: "Вода. Полезно и гидратация мозга", scores: { documentation: 1, devops: 1 } },
    ],
  },
];

const archetypes: Archetype[] = [
  {
    id: 'senior',
    title: 'Сеньор-кофеист (Бэкенд-джедай)',
    image: senior,
    imageAlt: 'Котик, обнимающий кружку с сервером',
    description: 'Ты — опора всего бэкенда. Ты спокоен, как удаленный сервер, и надёжен, как утренний кофе. Пока фронтендеры спорят об отступах, ты уже написал 500 строк кода. Твой девиз: "Сначала кофе, потом код, потом мир во всём мире". Поздравляем!',
  },
  {
    id: 'frontend',
    title: 'Фронтенд-фея',
    image: front,
    imageAlt: 'Девушка с крыльями из CSS-тегов',
    description: 'Там, где ты появляешься, даже самая скучная страница начинает сиять и переливаться. Пользователи не знают, почему им нравится интерфейс, но они точно знают — он красив. Ты можешь починить вёрстку силой мысли и добавить анимацию одной левой. Сияй!',
  },
  {
    id: 'qa',
    title: 'Боевой тестировщик (QA-ниндзя)',
    image: ninja,
    imageAlt: 'Девушка в плаще с иконкой бага на груди',
    description: 'Разработчики боятся тебя, а баги плачут в углу, когда ты заходишь в офис. Ты видишь ошибки там, где их даже быть не может. Твой девиз: "Доверяй, но проверяй". Спасибо, что делаешь продукты лучше и не даёшь упасть продакшену!',
  },
  {
    id: 'documentation',
    title: 'Богиня документации',
    image: docs,
    imageAlt: 'Мудрая сова с блокнотом и ручкой',
    description: 'Пока остальные ищут "тот самый файлик" по всему диску, ты спокойно открываешь структуру и говоришь: "Вот же он, в папке docs". Ты — хранитель знаний и порядка. Без тебя проект бы давно превратился в кашу из кода и мемов. Ты наводишь порядок в хаосе!',
  },
  {
    id: 'devops',
    title: 'Девочка-админ (DevOps-леди)',
    image: devops,
    imageAlt: 'Девушка с серверами и автоматизацией',
    description: 'Ты любишь автоматизировать всё, включая поливку цветов. Docker, kubernetes, ci/cd — твои лучшие друзья. Ты знаешь, как поднять продакшен одной левой и починить любой сервер. Твой девиз: "Если это можно автоматизировать — это будет автоматизировано!"',
  },
];

// ============= PROGRESS BAR COMPONENT =============
const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <div className="progress-container">
      <div className="progress-text">
        Вопрос {current} из {total}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

// ============= START SCREEN COMPONENT =============
interface StartScreenProps {
  onStart: (name: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Фокус на поле ввода при загрузке
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleStart = () => {
    onStart(name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div className="start-screen">
      <h1 className="title">Кто ты из отдела? 🧙‍♀️</h1>
      <p className="subtitle">Магический гримуар разработчика</p>
      
      <div className="book-container">
        <div className="book-spine"></div>
        <div className="book-content">
          <p className="book-description">
            Открой тайную книгу заклинаний IT-отдела и узнай, 
            какой архетип разработчицы скрывается в твоей душе!
          </p>
          
          <div className="input-group">
            <label htmlFor="name">Твоё имя (необязательно):</label>
            <input
              ref={inputRef}
              type="text"
              id="name"
              placeholder="Например: Алиса"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          
          <button className="start-button" onClick={handleStart}>
            Начать тест ✨
          </button>
          <button type="button" className="tarot-back" onClick={() => navigate('/games')}>
            ← К списку игр
          </button>
        </div>
      </div>
    </div>
  );
};

// ============= QUESTION SCREEN COMPONENT =============
interface QuestionScreenProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  onAnswer: (questionId: number, optionId: string, scores: Partial<Record<ArchetypeType, number>>) => void;
  onNext: () => void;
  onFinish: () => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  onAnswer,
  onNext,
  onFinish
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const navigate = useNavigate();

  // Проверяем, был ли уже выбран ответ на этот вопрос
  useEffect(() => {
    const savedAnswer = answers[currentQuestion.id];
    if (savedAnswer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedOption(savedAnswer);
    } else {
      setSelectedOption(null);
    }

    // Прокрутка к вопросу
    if (questionRef.current) {
      questionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentQuestionIndex, answers, currentQuestion.id]);

  const handleOptionClick = (optionId: string) => {
    if (selectedOption) return;
    
    setSelectedOption(optionId);
    setIsAnimating(true);
    
    const option = currentQuestion.options.find(opt => opt.id === optionId);
    if (option) {
      onAnswer(currentQuestion.id, optionId, option.scores);
    }

    setTimeout(() => {
      if (isLastQuestion) {
        onFinish();
      } else {
        onNext();
      }
      setIsAnimating(false);
    }, 500);
  };

  const getResultText = () => {
    const total = currentQuestion.options.length;
    const answered = selectedOption ? 1 : 0;
    return `Выбрано ${answered} из ${total}`;
  };

  return (
    <div className="question-screen" ref={questionRef}>
      <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
      
      <div className={`question-container ${isAnimating ? 'fade-out' : 'fade-in'}`}>
        <h2 className="question-text">{currentQuestion.text}</h2>
        
        <div className="options-grid">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              className={`option-button ${selectedOption === option.id ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.id)}
              disabled={!!selectedOption}
            >
              <span className="option-text">{option.text}</span>
              {selectedOption === option.id && (
                <span className="check-mark">✓</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="answer-status">
          {selectedOption ? getResultText() : 'Выбери свой путь...'}
        </div>
        <button type="button" className="tarot-back" onClick={() => navigate('/games')}>
          ← К списку игр
        </button>
      </div>
    </div>
  );
};

// ============= RESULT SCREEN COMPONENT =============
interface ResultScreenProps {
  scores: Record<ArchetypeType, number>;
  userName: string;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ scores, userName, onRestart }) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const getResultArchetype = (): Archetype => {
    let maxScore = -1;
    let resultArchetype: ArchetypeType = 'senior';
    
    Object.entries(scores).forEach(([key, value]) => {
      if (value > maxScore) {
        maxScore = value;
        resultArchetype = key as ArchetypeType;
      }
    });
    
    return archetypes.find(a => a.id === resultArchetype)!;
  };
  
  const result = getResultArchetype();
  const displayName = userName.trim() ? userName : 'Путник';

  useEffect(() => {
    // Прокрутка к результату
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="result-screen" ref={resultRef}>
      <div className="result-card">
        <h1 className="result-title">Твой архетип:</h1>
        
        <div className="result-image-container">
          <img 
            src={result.image} 
            alt={result.imageAlt}
            className="result-image"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/300x200?text=IT+Magic';
            }}
          />
        </div>
        
        <h2 className="result-archetype">{result.title}</h2>
        
        <div className="result-description">
          <p className="result-greeting">{displayName}, </p>
          <p>{result.description}</p>
        </div>
        
        <div className="result-stats">
          <h3>Твои очки:</h3>
          <ul className="stats-list">
            {archetypes.map(arch => (
              <li key={arch.id} className="stat-item">
                <span className="stat-name">{arch.title}:</span>
                <span className="stat-value">{scores[arch.id]}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <button className="restart-button" onClick={onRestart}>
          Пройти ещё раз 🔮
        </button>
        <button type="button" className="tarot-back" onClick={() => navigate('/games')}>
          ← К списку игр
        </button>
      </div>
    </div>
  );
};

// ============= MAIN APP COMPONENT =============
const WhoYouAreGame: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [scores, setScores] = useState<Record<ArchetypeType, number>>({
    senior: 0,
    frontend: 0,
    qa: 0,
    documentation: 0,
    devops: 0,
  });
  const [status, setStatus] = useState<'idle' | 'started' | 'finished'>('idle');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleStart = (name: string) => {
    setUserName(name);
    setStatus('started');
    setCurrentQuestionIndex(0);
    setScores({
      senior: 0,
      frontend: 0,
      qa: 0,
      documentation: 0,
      devops: 0,
    });
    setAnswers({});
  };

  const handleAnswer = (
    questionId: number, 
    optionId: string, 
    optionScores: Partial<Record<ArchetypeType, number>>
  ) => {
    // Добавляем очки
    const newScores = { ...scores };
    Object.entries(optionScores).forEach(([archetype, points]) => {
      if (points) {
        newScores[archetype as ArchetypeType] += points;
      }
    });
    setScores(newScores);
    
    // Сохраняем ответ
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleNext = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleFinish = () => {
    setStatus('finished');
  };

  const handleRestart = () => {
    setStatus('idle');
    setUserName('');
    setCurrentQuestionIndex(0);
    setScores({
      senior: 0,
      frontend: 0,
      qa: 0,
      documentation: 0,
      devops: 0,
    });
    setAnswers({});
  };

  return (
    <div className="app">
      <div className="magic-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      
      <main className="main-content">
        {status === 'idle' && (
          <StartScreen onStart={handleStart} />
        )}
        
        {status === 'started' && (
          <QuestionScreen
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onFinish={handleFinish}
          />
        )}
        
        {status === 'finished' && (
          <ResultScreen
            scores={scores}
            userName={userName}
            onRestart={handleRestart}
          />
        )}
      </main>
      
      <footer className="footer">
        <p>✨ IT-магия в каждом ответе ✨</p>
      </footer>
    </div>
  );
};

export default WhoYouAreGame;