import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { 
  Award, BookOpen, GraduationCap, TrendingUp, Plus, Trash2, ArrowUpDown, Sparkles, AlertTriangle, Target, Check, Copy, Edit3, Calendar, Sliders
} from 'lucide-react';

const SUBJECT_UNITS_MASTER = {
  '英語(リーディング)': ['共通テスト第1問(情報検索)', '共通テスト第2問(説明文・表)', '共通テスト第3問(ブログ・文章)', '共通テスト第4問(文章・論理)', '共通テスト第5問(物語・伝記)', '共通テスト第6問(論説文)', '自由英作文', '和文英訳', '長文読解(記述)', '英文要約', '英文解釈・和訳'],
  '英語(リスニング)': ['第1問(短文対話)', '第2問(イラスト・表)', '第3問(対話文)', '第4問(図表・モノローグ)', '第5問(講義・スピーチ)', '第6問(長文対話)'],
  '数学I・A': ['数と式・集合と論理', '2次関数', '図形と計量(三角比)', 'データの分析', '場合の数と確率', '図形の性質', '整数の性質'],
  '数学II・B・C': ['方程式・式と証明', '図形と方程式', '三角関数', '指数・対数関数', '微分法・積分法(2B)', 'ベクトル', '数列', '複素数平面', '式と曲線', '確率分布・統計推測'],
  '国語': ['現代文(論理的な文章)', '現代文(文学的な文章)', '現代文(実用的な文章)', '古文', '漢文', '記述問題(二次)'],
  '物理': ['力学(運動とエネルギー)', '力学(円運動・単振動)', '熱力学', '波動', '電磁気(電場・回路)', '電磁気(磁場・電磁誘導)', '原子'],
  '物理基礎': ['運動とエネルギー', '熱', '波', '電気とエネルギー'],
  '化学': ['理論化学(物質の構成・状態)', '理論化学(化学反応・平衡)', '無機化学(非金属・金属)', '有機化学(脂肪族・芳香族)', '高分子化合物'],
  '化学基礎': ['物質の構成粒子', '物質と化学結合', '物質量と化学反応式', '酸と塩基', '酸化還元'],
  '生物': ['細胞と分子', '代謝', '遺伝情報と発現', '生殖と発生', '体内環境と維持', '動物の反応と行動', '植物の反応と調節', '生態と環境', '生物の進化と系統'],
  '生物基礎': ['生物の特徴', '遺伝子とその働き', '体内環境の維持', '植生と生態系'],
  '地学': ['地球の形状・内部構造', '固体地球の変動', '大気と海洋の運動', '宇宙の構成と進化'],
  '地学基礎': ['地球の姿と構造', '活動する地球', '大気と海洋', '宇宙の構造'],
  '日本史': ['原始・古代', '中世', '近世', '近現代(政治・外交)', '近現代(経済・社会)', '文化史'],
  '世界史': ['オリエント・地中海', 'アジア史', 'ヨーロッパ史', 'アメリカ・現代史', '文化史・制度史'],
  '地理': ['系統地理(自然・気候)', '系統地理(産業・人口)', '地誌', '図表・地形図読解'],
  '情報I': ['情報社会の課題', 'コミュニケーションと情報デザイン', 'コンピュータとプログラミング', '情報通信ネットワークとデータ活用']
};

const INITIAL_MOCK_KYOTSU = [];

const INITIAL_MOCK_NIJI = [];

export default function App() {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'kyotsu', 'niji', 'prompts', 'target'
  
  const [kyotsuRecords, setKyotsuRecords] = useState(() => {
    const saved = localStorage.getItem('kyotsuRecords');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_KYOTSU;
  });

  const [nijiRecords, setNijiRecords] = useState(() => {
    const saved = localStorage.getItem('nijiRecords');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_NIJI;
  });

  const [targetConfig, setTargetConfig] = useState(() => {
    const saved = localStorage.getItem('targetConfig');
    return saved ? JSON.parse(saved) : {
      universityName: '',
      kyotsuWeight: '',
      nijiWeight: '',
      kyotsuTarget: '',
      nijiTarget: '',
      borderNote: '',
      currentSeason: '秋（9月〜11月・二次演習期）'
    };
  });

  useEffect(() => {
    localStorage.setItem('kyotsuRecords', JSON.stringify(kyotsuRecords));
  }, [kyotsuRecords]);

  useEffect(() => {
    localStorage.setItem('nijiRecords', JSON.stringify(nijiRecords));
  }, [nijiRecords]);

  useEffect(() => {
    localStorage.setItem('targetConfig', JSON.stringify(targetConfig));
  }, [targetConfig]);

  const [kyotsuSortBy, setKyotsuSortBy] = useState('dateDesc');
  const [nijiSortBy, setNijiSortBy] = useState('dateDesc');

  const [chartViewMode, setChartViewMode] = useState('examTotal'); // 'examTotal' or 'subjectRate'
  
  // Growth & Trend Analysis States
  const [growthExamType, setGrowthExamType] = useState('kyotsu'); // 'kyotsu' or 'niji'
  const [growthMetric, setGrowthMetric] = useState('total'); // 'total', 'subject', 'unit'
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('数学I・A');

  const [kyotsuJsonText, setKyotsuJsonText] = useState('');
  const [nijiJsonText, setNijiJsonText] = useState('');
  const [importMessage, setImportMessage] = useState({ type: '', text: '' });
  const [promptSubject, setPromptSubject] = useState('数学I・A');
  const [copiedStatus, setCopiedStatus] = useState('');

  const [editingKyotsuRecord, setEditingKyotsuRecord] = useState(null);
  const [editingNijiRecord, setEditingNijiRecord] = useState(null);
  const [showMarkEntryModal, setShowMarkEntryModal] = useState(false);
  const [showNijiAddModal, setShowNijiAddModal] = useState(false);

  const [markForm, setMarkForm] = useState({
    year: new Date().getFullYear(),
    examName: '',
    date: new Date().toISOString().split('T')[0],
    subject: '数学I・A',
    questions: [
      { qNo: '問1', userMark: '', correctMark: '3', unit: '2次関数', score: 10 },
      { qNo: '問2', userMark: '', correctMark: '2', unit: '2次関数', score: 10 },
      { qNo: '問3', userMark: '', correctMark: '4', unit: '図形と計量(三角比)', score: 15 }
    ]
  });

  const [newNijiForm, setNewNijiForm] = useState({
    year: new Date().getFullYear(),
    examName: '',
    date: new Date().toISOString().split('T')[0],
    subject: '数学II・B・C',
    notes: '',
    unitDetails: [
      { unit: '微分法・積分法(2B)', score: 20, maxScore: 30 },
      { unit: 'ベクトル', score: 15, maxScore: 30 }
    ]
  });

  const calculateUnitDetailsFromAnswers = (answers) => {
    const unitMap = {};
    answers.forEach(a => {
      const isCorr = a.userMark !== '' && String(a.userMark).trim() === String(a.correctMark).trim();
      const earned = isCorr ? Number(a.score) : 0;
      const maxS = Number(a.score) || 0;
      if (!unitMap[a.unit]) {
        unitMap[a.unit] = { score: 0, maxScore: 0 };
      }
      unitMap[a.unit].score += earned;
      unitMap[a.unit].maxScore += maxS;
    });
    return Object.keys(unitMap).map(u => ({
      unit: u,
      score: unitMap[u].score,
      maxScore: unitMap[u].maxScore
    }));
  };

  const handleImportKyotsuJson = () => {
    try {
      if (!kyotsuJsonText.trim()) return;
      let clean = kyotsuJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!parsed.subject || (!parsed.questions && !parsed.unitDetails)) {
        throw new Error('subject または questions/unitDetails が不足しています');
      }

      const master = SUBJECT_UNITS_MASTER[parsed.subject] || [];
      
      let answers = [];
      if (parsed.questions && Array.isArray(parsed.questions)) {
        answers = parsed.questions.map((q, idx) => {
          const matched = master.find(m => m.toLowerCase().includes(q.unit?.toLowerCase() || '') || (q.unit && q.unit.toLowerCase().includes(m.toLowerCase())));
          return {
            questionNo: q.questionNo || `問${idx + 1}`,
            userMark: q.userMark !== undefined ? String(q.userMark) : '',
            correctMark: String(q.correctMark || ''),
            isCorrect: q.userMark !== undefined && String(q.userMark).trim() === String(q.correctMark).trim(),
            unit: matched || q.unit || '総合問題',
            score: Number(q.score) || 0
          };
        });
      }

      let unitDetails = [];
      if (parsed.unitDetails && Array.isArray(parsed.unitDetails)) {
        unitDetails = parsed.unitDetails.map(u => {
          const matched = master.find(m => m.toLowerCase().includes(u.unit.toLowerCase()) || u.unit.toLowerCase().includes(m.toLowerCase()));
          return {
            unit: matched || u.unit,
            score: Number(u.score) || 0,
            maxScore: Number(u.maxScore) || 0
          };
        });
      } else if (answers.length > 0) {
        unitDetails = calculateUnitDetailsFromAnswers(answers);
      }

      const calculatedMaxScore = answers.length > 0 
        ? answers.reduce((s, a) => s + a.score, 0)
        : unitDetails.reduce((s, u) => s + u.maxScore, 0);

      const calculatedScore = answers.length > 0 
        ? answers.reduce((s, a) => s + (a.isCorrect ? a.score : 0), 0)
        : unitDetails.reduce((s, u) => s + u.score, 0);

      const record = {
        id: 'k-' + Date.now(),
        year: parsed.year || new Date().getFullYear(),
        examName: parsed.examName || `${parsed.subject} 共通テスト`,
        date: parsed.date || new Date().toISOString().split('T')[0],
        subject: parsed.subject,
        score: parsed.score !== undefined ? Number(parsed.score) : calculatedScore,
        maxScore: parsed.maxScore !== undefined ? Number(parsed.maxScore) : (calculatedMaxScore || 100),
        answers,
        unitDetails
      };

      setKyotsuRecords(prev => [record, ...prev]);
      setKyotsuJsonText('');
      setImportMessage({ type: 'success', text: `試験「${record.examName} (${record.subject})」の枠組みを取り込みました！マーク数字を入力してアプリ内で自己採点してください。` });
      setTimeout(() => setImportMessage({ type: '', text: '' }), 5000);

      setEditingKyotsuRecord(record);
    } catch (e) {
      setImportMessage({ type: 'error', text: `解析エラー: ${e.message}` });
    }
  };

  const handleSaveKyotsuUserMarks = () => {
    if (!editingKyotsuRecord) return;

    let totalScore = 0;
    const updatedAnswers = editingKyotsuRecord.answers.map(a => {
      const isCorr = a.userMark !== '' && String(a.userMark).trim() === String(a.correctMark).trim();
      if (isCorr) {
        totalScore += Number(a.score);
      }
      return { ...a, isCorrect: isCorr };
    });

    const updatedUnitDetails = calculateUnitDetailsFromAnswers(updatedAnswers);

    const updatedRecord = {
      ...editingKyotsuRecord,
      score: totalScore,
      answers: updatedAnswers,
      unitDetails: updatedUnitDetails
    };

    setKyotsuRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setEditingKyotsuRecord(null);
    setImportMessage({ type: 'success', text: `「${updatedRecord.examName}」のアプリ内自己採点が完了しました！（得点: ${totalScore}/${updatedRecord.maxScore}点）` });
    setTimeout(() => setImportMessage({ type: '', text: '' }), 5000);
  };

  const handleImportNijiJson = () => {
    try {
      if (!nijiJsonText.trim()) return;
      let clean = nijiJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!parsed.subject || !parsed.unitDetails) {
        throw new Error('subject または unitDetails が不足しています');
      }

      const master = SUBJECT_UNITS_MASTER[parsed.subject] || [];
      const validatedUnits = parsed.unitDetails.map(u => {
        const matched = master.find(m => m.toLowerCase().includes(u.unit.toLowerCase()) || u.unit.toLowerCase().includes(m.toLowerCase()));
        return {
          unit: matched || u.unit,
          score: Number(u.score) || 0,
          maxScore: Number(u.maxScore) || 0
        };
      });

      const totalEarned = validatedUnits.reduce((s, i) => s + i.score, 0);
      const totalMax = validatedUnits.reduce((s, i) => s + i.maxScore, 0);

      const record = {
        id: 'n-' + Date.now(),
        year: parsed.year || new Date().getFullYear(),
        examName: parsed.examName || `${parsed.subject} 二次記述演習`,
        date: parsed.date || new Date().toISOString().split('T')[0],
        subject: parsed.subject,
        score: parsed.score !== undefined ? Number(parsed.score) : totalEarned,
        maxScore: parsed.maxScore !== undefined ? Number(parsed.maxScore) : totalMax,
        notes: parsed.notes || '',
        unitDetails: validatedUnits
      };

      setNijiRecords(prev => [record, ...prev]);
      setNijiJsonText('');
      setImportMessage({ type: 'success', text: `二次「${record.examName}」の構造を登録しました！大問ごとの点数をアプリ内で入力してください。` });
      setTimeout(() => setImportMessage({ type: '', text: '' }), 5000);

      setEditingNijiRecord(record);
    } catch (e) {
      setImportMessage({ type: 'error', text: `コード解析エラー: ${e.message}` });
    }
  };

  const handleSaveNijiEditing = () => {
    if (!editingNijiRecord) return;
    const totalScore = editingNijiRecord.unitDetails.reduce((sum, u) => sum + Number(u.score), 0);
    const updatedRecord = {
      ...editingNijiRecord,
      score: totalScore
    };
    setNijiRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setEditingNijiRecord(null);
    setImportMessage({ type: 'success', text: `「${updatedRecord.examName}」の得点を保存しました！（合計: ${totalScore}/${updatedRecord.maxScore}点）` });
    setTimeout(() => setImportMessage({ type: '', text: '' }), 5000);
  };

  const handleSaveNativeMarkEntry = () => {
    if (!markForm.examName.trim()) {
      alert('試験名を入力してください。');
      return;
    }
    const unitDetails = calculateUnitDetailsFromAnswers(markForm.questions);
    const totalMax = markForm.questions.reduce((s, q) => s + Number(q.score), 0);
    const record = {
      id: 'k-' + Date.now(),
      year: Number(markForm.year),
      examName: markForm.examName,
      date: markForm.date,
      subject: markForm.subject,
      score: 0,
      maxScore: totalMax || 100,
      answers: markForm.questions.map(q => ({
        questionNo: q.qNo,
        userMark: q.userMark,
        correctMark: q.correctMark,
        isCorrect: false,
        unit: q.unit,
        score: Number(q.score)
      })),
      unitDetails
    };

    setKyotsuRecords(prev => [record, ...prev]);
    setShowMarkEntryModal(false);
  };

  const handleSaveNijiManual = () => {
    if (!newNijiForm.examName.trim()) {
      alert('試験名を入力してください。');
      return;
    }
    const totalScore = newNijiForm.unitDetails.reduce((sum, u) => sum + Number(u.score), 0);
    const totalMax = newNijiForm.unitDetails.reduce((sum, u) => sum + Number(u.maxScore), 0);

    const record = {
      id: 'n-' + Date.now(),
      year: Number(newNijiForm.year),
      examName: newNijiForm.examName,
      date: newNijiForm.date,
      subject: newNijiForm.subject,
      score: totalScore,
      maxScore: totalMax,
      unitDetails: newNijiForm.unitDetails,
      notes: newNijiForm.notes
    };

    setNijiRecords(prev => [record, ...prev]);
    setShowNijiAddModal(false);
  };

  const getKyotsuPromptText = (subj) => {
    const units = SUBJECT_UNITS_MASTER[subj] || [];
    return `【共通テスト テスト構造コード作成用 AI指示文】
あなたには私が受験した共通テスト(または模試)の『問題PDF/画像』と『正解・配点一覧』を与えます。

【最重要ルール】
私の解答の採点は行わないでください。アプリ内で私自身がマーク数字を入力して自己採点するため、正解番号・配点・固定単元の「問題構造JSONコード」のみを出力してください。

■厳守条件:
1. 「${subj}」の単元は、必ず以下の固定リストから厳格に割り当ててください:
[固定単元マスタ]: ${units.join(', ')}

2. 出力は以下のJSON構造のみ（コードブロック付きで出力し、前後の会話文は一切不要です）:
\`\`\`json
{
  "year": 2025,
  "examName": "2025年度 共通テスト模試",
  "date": "${new Date().toISOString().split('T')[0]}",
  "subject": "${subj}",
  "questions": [
    {
      "questionNo": "問1",
      "correctMark": "3",
      "score": 5,
      "unit": "上記マスタから合致する単元名"
    }
  ]
}
\`\`\`

準備ができたら「問題PDFと正解・配点表を送信してください」と答えてください。`;
  };

  const getNijiPromptText = (subj) => {
    const units = SUBJECT_UNITS_MASTER[subj] || [];
    return `【国公立二次記述試験 テスト構造コード作成用 AI指示文】
あなたには「国公立二次試験の問題/過去問PDF」と「配点基準/大問一覧」を与えます。

【最重要ルール】
私の答案の採点や点数計算は行わないでください。アプリ内で私自身が大問ごとの得点を手入力して管理するため、大問・固定単元・配点満点の「問題構造JSONコード」のみを出力してください。

■厳守条件:
1. 単元分類は必ず以下の指定固定マスタから選んで割り当ててください:
[固定単元マスタ]: ${units.join(', ')}

2. 出力は以下のJSON構造のみを出力してください:
\`\`\`json
{
  "year": 2025,
  "examName": "東京大学 2024年二次過去問",
  "date": "${new Date().toISOString().split('T')[0]}",
  "subject": "${subj}",
  "maxScore": 総合満点,
  "unitDetails": [
    {
      "unit": "上記マスタから合致する単元名",
      "score": 0,
      "maxScore": 大問満点
    }
  ]
}
\`\`\`

準備ができたら「問題PDFおよび配点基準を送信してください」と返答してください。`;
  };

  const getFullAIDiagnosisPrompt = () => {
    const kyotsuSummary = kyotsuRecords.map(k => 
      `・[${k.date} / ${k.year}年] ${k.examName} (${k.subject}): ${k.score}/${k.maxScore}点 (${Math.round((k.score/k.maxScore)*100)}%)`
    ).join('\n');

    const nijiSummary = nijiRecords.map(n => 
      `・[${n.date} / ${n.year}年] ${n.examName} (${n.subject}): ${n.score}/${n.maxScore}点 (${Math.round((n.score/n.maxScore)*100)}%) - 備考: ${n.notes || 'なし'}`
    ).join('\n');

    const weakList = unitAnalytics.weak.slice(0, 5).map(w => `${w.unit} (${w.subject}): 得点率${w.rate}%`).join('\n');

    return `あなたは超一流の志望校合格戦略コンサルタントです。
私の志望校目標とこれまでの全演習・模試記録を解析し、具体的な総合診断を行ってください。

========================================
【1. 志望校・配点条件】
・志望校: ${targetConfig.universityName}
・現在の時期: ${targetConfig.currentSeason}
・共通テスト目標: ${targetConfig.kyotsuTarget}点 / 900点 (配点換算: ${targetConfig.kyotsuWeight})
・二次試験目標: ${targetConfig.nijiTarget}点 (配点換算: ${targetConfig.nijiWeight})
・方針メモ: ${targetConfig.borderNote}

========================================
【2. 共通テスト 実施全履歴】
${kyotsuSummary || '（記録なし）'}

========================================
【3. 国公立二次記述 実施全履歴】
${nijiSummary || '（記録なし）'}

========================================
【4. 単元別 弱点データ TOP5】
${weakList || '（データ不足）'}

========================================
【依頼事項（客観的かつ論理的に回答してください）】
1. 【時期別ドッキング総合判定 (S / A / B / C / D / E)】
   共通テストと二次の傾斜配点・現状の時期(${targetConfig.currentSeason})を踏まえた合格判定。

2. 【「このまま行って間に合うか」合格リスク診断】
   残された期間に対する現在の課題と到達可能性についての率直な診断。

3. 【最優先で伸ばすべき単元 TOP3 アドバイス】
   弱点データに基づき、最も得点効率が高い単元と具体的な補強方針。

4. 【今後の勉強時間配分ルール】
   直近における「共通テスト vs 二次記述」の推奨学習比率。`;
  };

  const handleCopyText = (text, label) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedStatus(label);
          setTimeout(() => setCopiedStatus(''), 2500);
        })
        .catch(() => fallbackCopy(text, label));
    } else {
      fallbackCopy(text, label);
    }
  };

  const fallbackCopy = (text, label) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedStatus(label);
      setTimeout(() => setCopiedStatus(''), 2500);
    } catch (err) {
      alert('コピーに失敗しました。');
    }
    document.body.removeChild(textArea);
  };

  const sortRecords = (records, sortBy) => {
    const sorted = [...records];
    switch (sortBy) {
      case 'dateDesc':
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'dateAsc':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'yearDesc':
        return sorted.sort((a, b) => b.year - a.year || new Date(b.date) - new Date(a.date));
      case 'scoreDesc':
        return sorted.sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore));
      default:
        return sorted;
    }
  };

  const sortedKyotsu = useMemo(() => sortRecords(kyotsuRecords, kyotsuSortBy), [kyotsuRecords, kyotsuSortBy]);
  const sortedNiji = useMemo(() => sortRecords(nijiRecords, nijiSortBy), [nijiRecords, nijiSortBy]);

  const examTotalData = useMemo(() => {
    const kyotsuMap = {};
    kyotsuRecords.forEach(k => {
      const key = `${k.year}_${k.examName}`;
      if (!kyotsuMap[key]) {
        kyotsuMap[key] = {
          type: '共テ',
          year: k.year,
          examName: k.examName,
          date: k.date,
          score: 0,
          maxScore: 0,
          subjectCount: 0,
          subjects: []
        };
      }
      kyotsuMap[key].score += Number(k.score);
      kyotsuMap[key].maxScore += Number(k.maxScore);
      kyotsuMap[key].subjectCount += 1;
      kyotsuMap[key].subjects.push(`${k.subject}: ${k.score}/${k.maxScore}点`);
      if (new Date(k.date) > new Date(kyotsuMap[key].date)) {
        kyotsuMap[key].date = k.date;
      }
    });

    const nijiMap = {};
    nijiRecords.forEach(n => {
      const key = `${n.year}_${n.examName}`;
      if (!nijiMap[key]) {
        nijiMap[key] = {
          type: '二次',
          year: n.year,
          examName: n.examName,
          date: n.date,
          score: 0,
          maxScore: 0,
          subjectCount: 0,
          subjects: []
        };
      }
      nijiMap[key].score += Number(n.score);
      nijiMap[key].maxScore += Number(n.maxScore);
      nijiMap[key].subjectCount += 1;
      nijiMap[key].subjects.push(`${n.subject}: ${n.score}/${n.maxScore}点`);
      if (new Date(n.date) > new Date(nijiMap[key].date)) {
        nijiMap[key].date = n.date;
      }
    });

    const combined = [...Object.values(kyotsuMap), ...Object.values(nijiMap)].map(item => ({
      ...item,
      displayName: `${item.year}年 ${item.examName}`,
      rate: item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0
    }));

    return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [kyotsuRecords, nijiRecords]);

  const timelineChartData = useMemo(() => {
    const combined = [
      ...kyotsuRecords.map(k => ({
        date: k.date,
        type: '共テ',
        name: `${k.date.slice(5)} (${k.subject})`,
        rate: Math.round((k.score / k.maxScore) * 100),
        subject: k.subject,
        examName: k.examName
      })),
      ...nijiRecords.map(n => ({
        date: n.date,
        type: '二次',
        name: `${n.date.slice(5)} (${n.subject})`,
        rate: Math.round((n.score / n.maxScore) * 100),
        subject: n.subject,
        examName: n.examName
      }))
    ];
    return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [kyotsuRecords, nijiRecords]);

  const unitAnalytics = useMemo(() => {
    const stats = {};
    const process = (item) => {
      item.unitDetails?.forEach(u => {
        if (!stats[u.unit]) {
          stats[u.unit] = { earned: 0, max: 0, count: 0, subject: item.subject };
        }
        stats[u.unit].earned += Number(u.score);
        stats[u.unit].max += Number(u.maxScore);
        stats[u.unit].count += 1;
      });
    };
    kyotsuRecords.forEach(process);
    nijiRecords.forEach(process);

    const list = Object.keys(stats).map(unitName => {
      const d = stats[unitName];
      const rate = d.max > 0 ? Math.round((d.earned / d.max) * 100) : 0;
      return { unit: unitName, subject: d.subject, rate, earned: d.earned, max: d.max, count: d.count };
    });

    return {
      all: list,
      weak: [...list].sort((a, b) => a.rate - b.rate),
      strong: [...list].sort((a, b) => b.rate - a.rate)
    };
  }, [kyotsuRecords, nijiRecords]);

  // Growth Analytics Calculations
  const growthData = useMemo(() => {
    const records = growthExamType === 'kyotsu' ? kyotsuRecords : nijiRecords;

    // 1. Total Score Growth by Date/Exam
    const totalByExamMap = {};
    records.forEach(r => {
      const key = `${r.year}_${r.examName}`;
      if (!totalByExamMap[key]) {
        totalByExamMap[key] = {
          examName: r.examName,
          year: r.year,
          date: r.date,
          score: 0,
          maxScore: 0,
          subjectsCount: 0
        };
      }
      totalByExamMap[key].score += Number(r.score);
      totalByExamMap[key].maxScore += Number(r.maxScore);
      totalByExamMap[key].subjectsCount += 1;
      if (new Date(r.date) > new Date(totalByExamMap[key].date)) {
        totalByExamMap[key].date = r.date;
      }
    });

    const totalList = Object.values(totalByExamMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, idx, arr) => {
        const prev = idx > 0 ? arr[idx - 1] : null;
        const rate = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;
        const prevRate = prev && prev.maxScore > 0 ? Math.round((prev.score / prev.maxScore) * 100) : null;
        const diffRate = prevRate !== null ? rate - prevRate : 0;
        const diffScore = prev ? item.score - prev.score : 0;
        return {
          ...item,
          displayName: `${item.date} (${item.examName})`,
          rate,
          diffRate,
          diffScore
        };
      });

    const firstTotal = totalList[0];
    const latestTotal = totalList[totalList.length - 1];
    const totalOverallGrowth = (firstTotal && latestTotal) 
      ? {
          scoreDiff: latestTotal.score - firstTotal.score,
          rateDiff: latestTotal.rate - firstTotal.rate
        } 
      : { scoreDiff: 0, rateDiff: 0 };

    // 2. Subject Growth by Date
    const availableSubjects = Array.from(new Set(records.map(r => r.subject)));
    const filteredSubjectRecords = records
      .filter(r => r.subject === selectedSubjectFilter)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, idx, arr) => {
        const rate = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;
        const prev = idx > 0 ? arr[idx - 1] : null;
        const prevRate = prev && prev.maxScore > 0 ? Math.round((prev.score / prev.maxScore) * 100) : null;
        const diffRate = prevRate !== null ? rate - prevRate : 0;
        return {
          ...item,
          displayName: `${item.date} (${item.examName})`,
          rate,
          diffRate
        };
      });

    // 3. Unit Growth by Date for Selected Subject
    const unitHistoryMap = {};
    const masterUnits = SUBJECT_UNITS_MASTER[selectedSubjectFilter] || [];
    
    masterUnits.forEach(u => {
      unitHistoryMap[u] = [];
    });

    const subjectSortedRecords = records
      .filter(r => r.subject === selectedSubjectFilter)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    subjectSortedRecords.forEach(r => {
      r.unitDetails?.forEach(ud => {
        if (!unitHistoryMap[ud.unit]) {
          unitHistoryMap[ud.unit] = [];
        }
        const rate = ud.maxScore > 0 ? Math.round((ud.score / ud.maxScore) * 100) : 0;
        unitHistoryMap[ud.unit].push({
          date: r.date,
          examName: r.examName,
          score: ud.score,
          maxScore: ud.maxScore,
          rate
        });
      });
    });

    const unitGrowthList = Object.keys(unitHistoryMap).map(unitName => {
      const history = unitHistoryMap[unitName];
      if (history.length === 0) {
        return {
          unit: unitName,
          historyCount: 0,
          firstRate: null,
          latestRate: null,
          diffRate: 0,
          latestScore: 0,
          latestMax: 0,
          history
        };
      }
      const first = history[0];
      const latest = history[history.length - 1];
      const diffRate = latest.rate - first.rate;
      return {
        unit: unitName,
        historyCount: history.length,
        firstRate: first.rate,
        latestRate: latest.rate,
        diffRate,
        latestScore: latest.score,
        latestMax: latest.maxScore,
        history
      };
    }).sort((a, b) => (b.diffRate || 0) - (a.diffRate || 0));

    return {
      totalList,
      totalOverallGrowth,
      availableSubjects,
      filteredSubjectRecords,
      unitGrowthList
    };
  }, [kyotsuRecords, nijiRecords, growthExamType, selectedSubjectFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-slate-900 tracking-tight text-base">ExamAnalytics <span className="text-indigo-600">AI</span></span>
          </div>

          <nav className="flex space-x-1 sm:space-x-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'summary' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('kyotsu')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'kyotsu' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              共通テスト
            </button>
            <button
              onClick={() => setActiveTab('niji')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'niji' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              国公立二次
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'prompts' ? 'bg-indigo-600 text-white font-bold' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'}`}
            >
              AI指示文コピー
            </button>
            <button
              onClick={() => setActiveTab('target')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'target' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              志望校設定
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {importMessage.text && (
          <div className={`p-3 rounded-lg text-xs font-bold flex items-center justify-between shadow-xs ${
            importMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <span>{importMessage.text}</span>
            <button onClick={() => setImportMessage({ type: '', text: '' })} className="text-slate-400">✕</button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">目標志望校</span>
                  <span className="text-xs text-slate-500 font-medium">時期: {targetConfig.currentSeason}</span>
                </div>
                <h1 className="text-lg font-black text-slate-900 mt-1">{targetConfig.universityName}</h1>
                <p className="text-xs text-slate-500 mt-0.5">目標: 共テ {targetConfig.kyotsuTarget}点 / 二次記述 {targetConfig.nijiTarget}点</p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('prompts')}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI総合診断プロンプトを出力</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    実施日別 得点伸び幅・成長推移アナライザー
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    テストを解いた実施日順で「合計点」「科目別」「各単元別」の成長幅や伸び悩みを比較分析できます。
                  </p>
                </div>

                {/* Exam Type Selector: Kyotsu vs Niji */}
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto font-bold">
                  <button
                    onClick={() => setGrowthExamType('kyotsu')}
                    className={`px-3 py-1.5 rounded-md transition ${
                      growthExamType === 'kyotsu' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    共通テスト
                  </button>
                  <button
                    onClick={() => setGrowthExamType('niji')}
                    className={`px-3 py-1.5 rounded-md transition ${
                      growthExamType === 'niji' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    国公立二次
                  </button>
                </div>
              </div>

              {/* View Metric Tabs: Total / Subject / Unit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex space-x-1 text-xs font-bold w-full sm:w-auto">
                  <button
                    onClick={() => setGrowthMetric('total')}
                    className={`px-3 py-1.5 rounded-md transition grow sm:grow-0 text-center ${
                      growthMetric === 'total' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ① 合計点の伸び幅
                  </button>
                  <button
                    onClick={() => setGrowthMetric('subject')}
                    className={`px-3 py-1.5 rounded-md transition grow sm:grow-0 text-center ${
                      growthMetric === 'subject' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ② 科目別の伸び幅
                  </button>
                  <button
                    onClick={() => setGrowthMetric('unit')}
                    className={`px-3 py-1.5 rounded-md transition grow sm:grow-0 text-center ${
                      growthMetric === 'unit' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ③ 単元別の伸び幅
                  </button>
                </div>

                {(growthMetric === 'subject' || growthMetric === 'unit') && (
                  <div className="flex items-center space-x-2 text-xs w-full sm:w-auto justify-end">
                    <span className="font-bold text-slate-600 shrink-0">対象科目:</span>
                    <select
                      value={selectedSubjectFilter}
                      onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 font-bold text-slate-800 focus:outline-none text-xs"
                    >
                      {Object.keys(SUBJECT_UNITS_MASTER).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* METRIC 1: Total Score Growth View */}
              {growthMetric === 'total' && (
                <div className="space-y-4">
                  {growthData.totalList.length > 0 ? (
                    <>
                      {/* Overall Growth KPI Badge */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 block font-medium">実施初回 ➔ 直近（合計点）</span>
                          <div className="flex items-baseline space-x-1 mt-0.5">
                            <span className={`text-base font-black ${
                              growthData.totalOverallGrowth.scoreDiff >= 0 ? 'text-indigo-600' : 'text-red-600'
                            }`}>
                              {growthData.totalOverallGrowth.scoreDiff >= 0 ? `+${growthData.totalOverallGrowth.scoreDiff}` : growthData.totalOverallGrowth.scoreDiff} 点
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                              ({growthData.totalOverallGrowth.rateDiff >= 0 ? `+${growthData.totalOverallGrowth.rateDiff}` : growthData.totalOverallGrowth.rateDiff}%)
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 block font-medium">直近テスト 合計点</span>
                          <span className="text-base font-black text-slate-900 mt-0.5 block">
                            {growthData.totalList[growthData.totalList.length - 1].score} / {growthData.totalList[growthData.totalList.length - 1].maxScore}点
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 block font-medium">登録演習・テスト回数</span>
                          <span className="text-base font-black text-slate-900 mt-0.5 block">
                            {growthData.totalList.length} 回
                          </span>
                        </div>
                      </div>

                      {/* Total Score Line Chart */}
                      <div className="h-60 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={growthData.totalList} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="displayName" tick={{ fontSize: 10 }} angle={-10} textAnchor="end" />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip 
                              formatter={(val, name, item) => [
                                `${item.payload.score}/${item.payload.maxScore}点 (${item.payload.rate}%) [前回比: ${item.payload.diffScore >= 0 ? '+' : ''}${item.payload.diffScore}点]`,
                                '合計点'
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke={growthExamType === 'kyotsu' ? '#4f46e5' : '#047857'} 
                              strokeWidth={2.5} 
                              dot={{ r: 5, fill: growthExamType === 'kyotsu' ? '#4f46e5' : '#047857' }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Date-by-date Total Breakdown Table */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-slate-700 block">実施日別 合計点数の推移明細</span>
                        <div className="space-y-1.5">
                          {growthData.totalList.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-400">第{idx + 1}回</span>
                                <span className="text-slate-500 font-mono text-[11px]">📅 {t.date}</span>
                                <span className="font-bold text-slate-900">{t.examName}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="font-black text-slate-800 text-sm">{t.score} <span className="text-xs font-normal text-slate-400">/ {t.maxScore}点</span></span>
                                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                  t.diffRate > 0 ? 'bg-emerald-100 text-emerald-800' : t.diffRate < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {idx === 0 ? '初回' : `${t.diffScore >= 0 ? '+' : ''}${t.diffScore}点 (${t.diffRate >= 0 ? '+' : ''}${t.diffRate}%)`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">選択した試験区分のデータがありません。テスト記録を追加してください。</div>
                  )}
                </div>
              )}

              {/* METRIC 2: Subject Growth View */}
              {growthMetric === 'subject' && (
                <div className="space-y-4">
                  {growthData.filteredSubjectRecords.length > 0 ? (
                    <>
                      <div className="h-60 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={growthData.filteredSubjectRecords} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="displayName" tick={{ fontSize: 10 }} angle={-10} textAnchor="end" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                            <Tooltip 
                              formatter={(val, name, item) => [
                                `${item.payload.score}/${item.payload.maxScore}点 (${val}%) [前回比: ${item.payload.diffRate >= 0 ? '+' : ''}${item.payload.diffRate}%]`,
                                '得点率'
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="rate" 
                              stroke="#0284c7" 
                              strokeWidth={2.5} 
                              dot={{ r: 5, fill: '#0284c7' }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <span className="text-xs font-bold text-slate-700 block">【{selectedSubjectFilter}】実施日別のスコア推移</span>
                        {growthData.filteredSubjectRecords.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-500 font-mono text-[11px]">📅 {s.date}</span>
                              <span className="font-bold text-slate-900">{s.examName}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="font-black text-slate-800">{s.score} / {s.maxScore}点 ({s.rate}%)</span>
                              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                s.diffRate > 0 ? 'bg-emerald-100 text-emerald-800' : s.diffRate < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {idx === 0 ? '初回' : `${s.diffRate >= 0 ? '+' : ''}${s.diffRate}%`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">「{selectedSubjectFilter}」の実施記録がありません。</div>
                  )}
                </div>
              )}

              {/* METRIC 3: Unit Growth View */}
              {growthMetric === 'unit' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-700 block">
                    【{selectedSubjectFilter}】固定単元別 実施日による到達度・伸び幅 (初回 ➔ 直近)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {growthData.unitGrowthList.map((u, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{u.unit}</span>
                          <span className={`font-black px-2 py-0.5 rounded text-[11px] ${
                            u.diffRate > 0 ? 'bg-emerald-100 text-emerald-800' : u.diffRate < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {u.historyCount <= 1 
                              ? `最新: ${u.latestRate ?? '-'}%` 
                              : `伸び幅: ${u.diffRate >= 0 ? '+' : ''}${u.diffRate}%`}
                          </span>
                        </div>

                        {u.historyCount > 0 ? (
                          <div className="space-y-1 pt-1 border-t border-slate-200/60">
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>実施回数: {u.historyCount}回</span>
                              <span>初回({u.firstRate}%) ➔ 直近({u.latestRate}%)</span>
                            </div>

                            {/* Mini Timeline Bar */}
                            <div className="flex items-center space-x-1 pt-1 overflow-x-auto">
                              {u.history.map((h, hIdx) => (
                                <div key={hIdx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                  <span className="text-slate-400 mr-1">{h.date.slice(5)}:</span>
                                  <span className="font-bold text-slate-800">{h.score}/{h.maxScore} ({h.rate}%)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">まだ実施データがありません</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Exam Total Summary Cards */}
            {examTotalData.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Target className="w-4 h-4 text-indigo-600" />
                  年度・模試別 総合合計点数一覧
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {examTotalData.map((e, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            e.type === '共テ' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {e.type}
                          </span>
                          <span className="font-bold text-slate-900">{e.displayName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">📅 {e.date}</span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-medium">登録科目 ({e.subjectCount}科目):</span>
                        <div className="text-right">
                          <span className="text-base font-black text-indigo-700">{e.score}</span>
                          <span className="text-xs text-slate-400"> / {e.maxScore}点 ({e.rate}%)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1 text-[10px] text-slate-600">
                        {e.subjects.map((sub, sIdx) => (
                          <span key={sIdx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak & Strong Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    固定単元別 弱点TOP5（復習優先順）
                  </span>
                  <span className="text-[10px] text-slate-400">平均得点率</span>
                </div>

                <div className="space-y-2">
                  {unitAnalytics.weak.slice(0, 5).map((u, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-800">{u.unit}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({u.subject})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-red-600">{u.rate}%</span>
                        <span className="text-[10px] text-slate-400">({u.earned}/{u.max}点)</span>
                      </div>
                    </div>
                  ))}
                  {unitAnalytics.weak.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">データがありません。</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    固定単元別 得意TOP5（アドバンテージ）
                  </span>
                  <span className="text-[10px] text-slate-400">平均得点率</span>
                </div>

                <div className="space-y-2">
                  {unitAnalytics.strong.slice(0, 5).map((u, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-800">{u.unit}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({u.subject})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-emerald-700">{u.rate}%</span>
                        <span className="text-[10px] text-slate-400">({u.earned}/{u.max}点)</span>
                      </div>
                    </div>
                  ))}
                  {unitAnalytics.strong.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">データがありません。</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kyotsu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900">共通テスト記録・自己採点</h2>
                <p className="text-xs text-slate-500">外部AIで問題コード(JSON)をインポート後、アプリ内でマーク数字を入力して即座に採点できます。</p>
              </div>

              <button
                onClick={() => setShowMarkEntryModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新規テスト枠組み手動作成</span>
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                AI指示文で生成した問題枠組みコード(JSON)をインポート
              </span>
              <textarea
                rows={3}
                value={kyotsuJsonText}
                onChange={(e) => setKyotsuJsonText(e.target.value)}
                placeholder="AIが出力した { 'subject': '数学I・A', 'questions': [...] } などのコードをここに貼り付け..."
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleImportKyotsuJson}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs"
                >
                  枠組みコードを取り込む
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">登録済み共通テスト ({sortedKyotsu.length}件)</span>

                <div className="flex items-center space-x-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">並び替え:</span>
                  <select
                    value={kyotsuSortBy}
                    onChange={(e) => setKyotsuSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 font-medium focus:outline-none"
                  >
                    <option value="dateDesc">解いた日付 (最新順)</option>
                    <option value="dateAsc">解いた日付 (古い順)</option>
                    <option value="yearDesc">実施年度 (新しい順)</option>
                    <option value="scoreDesc">得点率 (高い順)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {sortedKyotsu.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-indigo-100 text-indigo-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                          {item.year}年
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.examName}</span>
                        <span className="text-xs text-slate-500 font-medium">({item.subject})</span>
                        <span className="text-[10px] text-slate-400">📅 {item.date}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-2">
                          <span className="text-base font-black text-indigo-700">{item.score}</span>
                          <span className="text-xs text-slate-400">/{item.maxScore}点 ({Math.round((item.score/item.maxScore)*100)}%)</span>
                        </div>
                        
                        <button
                          onClick={() => setEditingKyotsuRecord(item)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-2.5 py-1.5 rounded border border-indigo-200 flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>マーク数字を入力して採点</span>
                        </button>

                        <button
                          onClick={() => setKyotsuRecords(prev => prev.filter(r => r.id !== item.id))}
                          className="text-slate-400 hover:text-red-600 text-xs p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {item.answers && item.answers.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1 text-[10px]">
                        <span className="text-slate-400 font-semibold mr-1">マーク結果:</span>
                        {item.answers.map((a, idx) => (
                          <span key={idx} className={`px-1.5 py-0.5 rounded ${
                            a.userMark === '' 
                              ? 'bg-slate-200 text-slate-500' 
                              : a.isCorrect 
                                ? 'bg-emerald-100 text-emerald-800 font-bold' 
                                : 'bg-red-100 text-red-800 font-bold'
                          }`}>
                            {a.questionNo}:{a.userMark || '?'}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {item.unitDetails?.map((u, idx) => (
                        <div key={idx} className="bg-white p-1.5 rounded border border-slate-200 flex justify-between">
                          <span className="text-slate-600 truncate pr-1">{u.unit}</span>
                          <span className="font-bold text-slate-800 shrink-0">{u.score}/{u.maxScore}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'niji' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900">国公立二次記述 記録</h2>
                <p className="text-xs text-slate-500">二次記述試験の点数・大問別固定単元・反省メモを記録・管理できます。</p>
              </div>

              <button
                onClick={() => setShowNijiAddModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>二次試験の手入力登録</span>
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI指示文で生成した二次試験コード(JSON)をインポート
              </span>
              <textarea
                rows={3}
                value={nijiJsonText}
                onChange={(e) => setNijiJsonText(e.target.value)}
                placeholder="AIが出力した { 'subject': '物理', 'unitDetails': [...] } などのコードをここに貼り付け..."
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleImportNijiJson}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs"
                >
                  二次コードを取り込む
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">登録済み二次記述 ({sortedNiji.length}件)</span>

                <div className="flex items-center space-x-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">並び替え:</span>
                  <select
                    value={nijiSortBy}
                    onChange={(e) => setNijiSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 font-medium focus:outline-none"
                  >
                    <option value="dateDesc">解いた日付 (最新順)</option>
                    <option value="dateAsc">解いた日付 (古い順)</option>
                    <option value="yearDesc">実施年度 (新しい順)</option>
                    <option value="scoreDesc">得点率 (高い順)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {sortedNiji.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                          {item.year}年
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.examName}</span>
                        <span className="text-xs text-slate-500 font-medium">({item.subject})</span>
                        <span className="text-[10px] text-slate-400">📅 {item.date}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-800">{item.score}</span>
                          <span className="text-xs text-slate-400">/{item.maxScore}点 ({Math.round((item.score/item.maxScore)*100)}%)</span>
                        </div>
                        
                        <button
                          onClick={() => setNijiRecords(prev => prev.filter(r => r.id !== item.id))}
                          className="text-slate-400 hover:text-red-600 text-xs p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                        📝 {item.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {item.unitDetails?.map((u, idx) => (
                        <div key={idx} className="bg-white p-1.5 rounded border border-slate-200 flex justify-between">
                          <span className="text-slate-600 truncate pr-1">{u.unit}</span>
                          <span className="font-bold text-slate-800 shrink-0">{u.score}/{u.maxScore}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  外部AI（Gemini / ChatGPT 等）連携 指示文生成
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  以下の指示文をコピーして他のAIへ送信することで、自動採点や総合合格診断コードを取得できます。
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-700">対象科目の選択:</span>
                <select
                  value={promptSubject}
                  onChange={(e) => setPromptSubject(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-indigo-700 focus:outline-none"
                >
                  {Object.keys(SUBJECT_UNITS_MASTER).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Prompt Card 1: Kyotsu */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">1. 共通テスト枠組み・自動採点コード作成指示文</span>
                  <button
                    onClick={() => handleCopyText(getKyotsuPromptText(promptSubject), 'kyotsu')}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded text-xs transition flex items-center space-x-1"
                  >
                    {copiedStatus === 'kyotsu' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStatus === 'kyotsu' ? 'コピー完了' : '指示文をコピー'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-white p-3 rounded border border-slate-200 text-slate-600 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {getKyotsuPromptText(promptSubject)}
                </pre>
              </div>

              {/* Prompt Card 2: Niji */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">2. 国公立二次 採点＆コード出力指示文</span>
                  <button
                    onClick={() => handleCopyText(getNijiPromptText(promptSubject), 'niji')}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded text-xs transition flex items-center space-x-1"
                  >
                    {copiedStatus === 'niji' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStatus === 'niji' ? 'コピー完了' : '指示文をコピー'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-white p-3 rounded border border-slate-200 text-slate-600 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {getNijiPromptText(promptSubject)}
                </pre>
              </div>

              {/* Prompt Card 3: Full AI Diagnosis Prompt */}
              <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    3. 志望校・全履歴統合 AI総合判定＆アドバイス指示文（全データ自動埋め込み済み）
                  </span>
                  <button
                    onClick={() => handleCopyText(getFullAIDiagnosisPrompt(), 'full')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded text-xs transition flex items-center space-x-1 shadow-xs"
                  >
                    {copiedStatus === 'full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStatus === 'full' ? 'コピー完了' : '統合指示文をコピー'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  アプリに保存されている共テ・二次の全記録と志望校設定を全て反映した指示文です。そのまま外部AIに貼り付けると「ドッキング判定」や「合格可能性診断」が得られます。
                </p>
                <pre className="text-[11px] font-mono bg-white p-3 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {getFullAIDiagnosisPrompt()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'target' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              志望校・配点目標設定
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">第一志望校・学部名</label>
                <input
                  type="text"
                  value={targetConfig.universityName}
                  onChange={(e) => setTargetConfig({ ...targetConfig, universityName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">現在の時期（シーズン）</label>
                <select
                  value={targetConfig.currentSeason}
                  onChange={(e) => setTargetConfig({ ...targetConfig, currentSeason: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
                >
                  <option>夏（7月〜8月・基礎完成期）</option>
                  <option>秋（9月〜11月・二次演習期）</option>
                  <option>冬（12月・共テ直前対策期）</option>
                  <option>直前期（1月〜2月・二次直前仕上げ期）</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">共通テスト 目標点数</label>
                  <input
                    type="number"
                    value={targetConfig.kyotsuTarget}
                    onChange={(e) => setTargetConfig({ ...targetConfig, kyotsuTarget: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">共通テスト 傾斜配点比率</label>
                  <input
                    type="text"
                    value={targetConfig.kyotsuWeight}
                    onChange={(e) => setTargetConfig({ ...targetConfig, kyotsuWeight: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                    placeholder="例: 110 / 900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">二次記述 目標点数</label>
                  <input
                    type="number"
                    value={targetConfig.nijiTarget}
                    onChange={(e) => setTargetConfig({ ...targetConfig, nijiTarget: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">二次記述 傾斜配点比率</label>
                  <input
                    type="text"
                    value={targetConfig.nijiWeight}
                    onChange={(e) => setTargetConfig({ ...targetConfig, nijiWeight: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                    placeholder="例: 440 / 550"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">合格戦略メモ・目標ボーダー</label>
                <textarea
                  rows={2}
                  value={targetConfig.borderNote}
                  onChange={(e) => setTargetConfig({ ...targetConfig, borderNote: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal for Entering Mark Numbers on Imported Kyotsu Exam */}
      {editingKyotsuRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  【アプリ内自己採点】{editingKyotsuRecord.examName} ({editingKyotsuRecord.subject})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">マーク解答番号（数字）を入力すると、アプリが即座に正誤判定・得点計算を行います。</p>
              </div>
              <button onClick={() => setEditingKyotsuRecord(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center justify-between">
              <span className="font-bold text-indigo-900">リアルタイム採点結果</span>
              <div className="text-right">
                <span className="text-lg font-black text-indigo-700">
                  {editingKyotsuRecord.answers.reduce((sum, q) => {
                    const isCorr = q.userMark !== '' && String(q.userMark).trim() === String(q.correctMark).trim();
                    return sum + (isCorr ? Number(q.score) : 0);
                  }, 0)}
                </span>
                <span className="text-xs text-slate-500"> / {editingKyotsuRecord.maxScore}点</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {editingKyotsuRecord.answers.map((q, idx) => {
                  const isTyped = q.userMark !== '';
                  const isCorrect = isTyped && String(q.userMark).trim() === String(q.correctMark).trim();
                  return (
                    <div key={idx} className={`flex items-center justify-between p-2 rounded border ${
                      !isTyped 
                        ? 'bg-slate-50 border-slate-200' 
                        : isCorrect 
                          ? 'bg-emerald-50/60 border-emerald-200' 
                          : 'bg-red-50/60 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 w-10">{q.questionNo}</span>
                        <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[90px]">
                          {q.unit}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="数字"
                          value={q.userMark}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingKyotsuRecord(prev => {
                              const updatedAnswers = [...prev.answers];
                              updatedAnswers[idx] = { ...updatedAnswers[idx], userMark: val };
                              return { ...prev, answers: updatedAnswers };
                            });
                          }}
                          className="w-12 p-1 bg-white border border-slate-300 rounded text-center font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-slate-400 text-[10px]">(正解:{q.correctMark})</span>
                        <span className="text-[11px] font-bold text-slate-600 w-8 text-right">{q.score}点</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingKyotsuRecord(null)}
                className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveKyotsuUserMarks}
                className="px-4 py-1.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-xs"
              >
                採点完了・アプリに保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Score on Imported Niji Exam */}
      {editingNijiRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                  【アプリ内得点入力】{editingNijiRecord.examName} ({editingNijiRecord.subject})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">大問ごとの得点と所感メモを入力してください。</p>
              </div>
              <button onClick={() => setEditingNijiRecord(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-2">
              {editingNijiRecord.unitDetails?.map((u, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="font-bold text-slate-800">{u.unit}</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={u.score}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditingNijiRecord(prev => {
                          const updated = [...prev.unitDetails];
                          updated[idx] = { ...updated[idx], score: val };
                          return { ...prev, unitDetails: updated };
                        });
                      }}
                      className="w-16 p-1 bg-white border border-slate-300 rounded text-right font-bold"
                    />
                    <span>/ {u.maxScore}点</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">所感・反省メモ</label>
              <textarea
                rows={2}
                value={editingNijiRecord.notes || ''}
                onChange={(e) => setEditingNijiRecord({ ...editingNijiRecord, notes: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                placeholder="例: 微積分は完答できたが、確率で計算ミスがあった。"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingNijiRecord(null)}
                className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveNijiEditing}
                className="px-4 py-1.5 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded shadow-xs"
              >
                得点を保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating Native Kyotsu Framework */}
      {showMarkEntryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Plus className="w-4 h-4 text-indigo-600" />
                共通テスト 枠組み手動作成
              </h3>
              <button onClick={() => setShowMarkEntryModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">年度</label>
                <input
                  type="number"
                  value={markForm.year}
                  onChange={(e) => setMarkForm({ ...markForm, year: Number(e.target.value) })}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">実施/演習日付</label>
                <input
                  type="date"
                  value={markForm.date}
                  onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">科目</label>
                <select
                  value={markForm.subject}
                  onChange={(e) => setMarkForm({ ...markForm, subject: e.target.value })}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-bold text-indigo-700"
                >
                  {Object.keys(SUBJECT_UNITS_MASTER).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">試験・模試名</label>
              <input
                type="text"
                value={markForm.examName}
                onChange={(e) => setMarkForm({ ...markForm, examName: e.target.value })}
                placeholder="例: 全統共通テスト模試 第2回"
                className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMarkEntryModal(false)}
                className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveNativeMarkEntry}
                className="px-4 py-1.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-xs"
              >
                枠組みを保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Manual Niji Add */}
      {showNijiAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                国公立二次 手入力採点フォーム
              </h3>
              <button onClick={() => setShowNijiAddModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">年度</label>
                <input
                  type="number"
                  value={newNijiForm.year}
                  onChange={(e) => setNewNijiForm({ ...newNijiForm, year: Number(e.target.value) })}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">演習日付</label>
                <input
                  type="date"
                  value={newNijiForm.date}
                  onChange={(e) => setNewNijiForm({ ...newNijiForm, date: e.target.value })}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">科目</label>
                <select
                  value={newNijiForm.subject}
                  onChange={(e) => setNewNijiForm({ ...newNijiForm, subject: e.target.value })}
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-bold text-emerald-800"
                >
                  {Object.keys(SUBJECT_UNITS_MASTER).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">試験・演習名</label>
              <input
                type="text"
                value={newNijiForm.examName}
                onChange={(e) => setNewNijiForm({ ...newNijiForm, examName: e.target.value })}
                placeholder="例: 東京大学 2024年二次本試"
                className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">大問・固定単元別得点</span>
                <button
                  type="button"
                  onClick={() => {
                    const units = SUBJECT_UNITS_MASTER[newNijiForm.subject] || ['大問'];
                    setNewNijiForm(prev => ({
                      ...prev,
                      unitDetails: [...prev.unitDetails, { unit: units[0], score: 0, maxScore: 30 }]
                    }));
                  }}
                  className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>大問を追加</span>
                </button>
              </div>

              {newNijiForm.unitDetails.map((item, idx) => {
                const units = SUBJECT_UNITS_MASTER[newNijiForm.subject] || ['大問'];
                return (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-400 w-10">大問{idx+1}</span>
                    <select
                      value={item.unit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewNijiForm(prev => {
                          const u = [...prev.unitDetails];
                          u[idx].unit = val;
                          return { ...prev, unitDetails: u };
                        });
                      }}
                      className="p-1 bg-white border border-slate-300 rounded grow"
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>

                    <input
                      type="number"
                      value={item.score}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewNijiForm(prev => {
                          const u = [...prev.unitDetails];
                          u[idx].score = val;
                          return { ...prev, unitDetails: u };
                        });
                      }}
                      className="w-14 p-1 bg-white border border-slate-300 rounded font-bold text-right"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      value={item.maxScore}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewNijiForm(prev => {
                          const u = [...prev.unitDetails];
                          u[idx].maxScore = val;
                          return { ...prev, unitDetails: u };
                        });
                      }}
                      className="w-14 p-1 bg-white border border-slate-300 rounded font-bold text-right"
                    />
                    <span>点</span>

                    <button
                      type="button"
                      onClick={() => setNewNijiForm(prev => ({ ...prev, unitDetails: prev.unitDetails.filter((_, i) => i !== idx) }))}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">所感・反省メモ</label>
              <textarea
                rows={2}
                value={newNijiForm.notes}
                onChange={(e) => setNewNijiForm({ ...newNijiForm, notes: e.target.value })}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNijiAddModal(false)}
                className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveNijiManual}
                className="px-4 py-1.5 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded shadow-xs"
              >
                結果を保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
