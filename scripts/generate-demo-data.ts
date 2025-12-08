/**
 * Generate demo data for episode health reports
 */

import * as fs from 'fs';
import * as path from 'path';
import { EpisodeHealthReport } from '../src/types/health-report';

// Demo Episode 1: Excellent Performance
const excellentEpisode: EpisodeHealthReport = {
  episode: {
    id: 'demo-excellent-001',
    name: 'TypeScriptの型システム完全ガイド - 実践テクニック集',
    releaseDate: new Date('2024-11-15'),
    duration: 2400, // 40 minutes
    totalStreams: 15420,
    totalListeners: 8930,
    averageListenTime: 2160, // 36 minutes
  },
  healthScore: {
    total: 95,
    level: 'excellent',
    breakdown: {
      playbackRate: 40,
      dropoutRate: 30,
      engagement: 25,
    },
  },
  playbackRateAnalysis: {
    overallRate: 87.5,
    evaluation: 'excellent',
    byTimeSegment: {
      intro: 94.2,
      earlyMain: 91.8,
      midMain: 86.3,
      lateMain: 82.1,
    },
  },
  dropoutAnalysis: {
    averageDropoutRate: 12.5,
    maxDropoutPoint: {
      timestamp: 2100,
      rate: 18.2,
    },
    pattern: 'excellent',
    topicAnalysis: {
      topics: [
        { name: '技術・開発', dropoutRate: 8.5 },
        { name: '機能・特徴', dropoutRate: 11.2 },
        { name: '紹介・説明', dropoutRate: 15.8 },
        { name: '改善・解決', dropoutRate: 9.7 },
      ],
      highInterest: ['技術・開発', '改善・解決', '機能・特徴'],
      lowInterest: [],
    },
  },
  engagementAnalysis: {
    followerGrowthAroundRelease: 234,
    totalStreams: 15420,
    totalListeners: 8930,
    engagementRate: 0.352,
    evaluation: 'excellent',
  },
  demographics: {
    age: {
      '18-24': 1245,
      '25-34': 3890,
      '35-44': 2456,
      '45-54': 1123,
      '55+': 216,
    },
    gender: {
      male: 6234,
      female: 2456,
      other: 240,
    },
    country: {
      JP: 7234,
      US: 856,
      UK: 345,
      DE: 234,
      FR: 201,
    },
  },
  actionItems: {
    critical: [],
    high: [],
    recommended: [
      {
        priority: 'recommended',
        issue: '後半部分の視聴維持率をさらに向上させる余地がある',
        action: '後半により具体的なコード例やデモを追加し、リスナーの興味を最後まで維持する',
        expectedImpact: '完走率が5-8%向上し、リスナー満足度がさらに高まります',
      },
      {
        priority: 'recommended',
        issue: '現在の高いエンゲージメントを維持しながら、さらなる成長を目指す',
        action: 'SNSでのハイライトクリップ共有や、リスナーからの質問を次回エピソードで取り上げる',
        expectedImpact: 'コミュニティの活性化とフォロワー増加率の向上',
      },
    ],
    futureEpisodes: [
      {
        priority: 'recommended',
        issue: 'このエピソードの成功パターンを他のエピソードでも再現',
        action: '技術的な深掘りと実践的な例を組み合わせる構成を継続する',
        expectedImpact: '安定した高品質コンテンツの提供が可能になります',
      },
    ],
  },
  aiInsights: {
    overview:
      'このエピソード「TypeScriptの型システム完全ガイド」は、3つの指標全てにおいて優秀な成績を収めています。再生率87.5%は基準を大きく上回り、離脱率も12.5%と非常に低く抑えられています。特に技術的な内容にも関わらず、リスナーの興味を最後まで維持できている点が素晴らしいです。エンゲージメント率0.352も優秀で、フォロワーが実際に視聴している健全な状態です。',
    playbackRateAssessment:
      '指標1（再生率）: 平均再生率87.5%は80%の基準を大きく上回る優秀な数値です。イントロから前半にかけて94.2%→91.8%と高い維持率を保ち、後半も82.1%と基準以上を維持しています。技術的な内容でありながら、分かりやすい説明と具体例により、リスナーの興味を引き続けることに成功しています。',
    dropoutAssessment:
      '指標2（離脱ポイント）: 平均離脱率12.5%は20%以下の優秀な基準を満たしています。最大離脱ポイントも35分地点で18.2%と許容範囲内です。トピック別では「技術・開発」(8.5%)と「改善・解決」(9.7%)が特に低い離脱率を示しており、実践的な内容への関心の高さが伺えます。終盤まで視聴者を引き付ける構成が功を奏しています。',
    engagementAssessment:
      '指標3（エンゲージメント）: エンゲージメント率0.352は非常に高く、フォロワー234人の増加も健全な成長を示しています。総再生数15,420、総リスナー数8,930という数値は、フォロワーが実際にコンテンツを視聴し、さらに口コミで広がっている証拠です。このエピソードはフォロワー獲得と再生数のバランスが理想的な状態です。',
    priorityActions: [
      '後半35分以降のセグメントに、より多くの実践的なコード例やデモを追加し、視聴維持率をさらに向上させる',
      'このエピソードの成功要因（技術的深掘り + 実践例）を分析し、テンプレート化して他のエピソードにも適用する',
      'リスナーからのフィードバックを積極的に収集し、次回以降のトピック選定に活かす',
    ],
    successFactors: [
      '技術的な内容を分かりやすく説明し、かつ実践的な例を豊富に含めている点',
      'イントロから本編への流れがスムーズで、リスナーの興味を最初から引き付けている',
      'トピックの選定が適切で、ターゲットオーディエンスのニーズに合致している',
      '適切な長さ（40分）で、内容の濃さと視聴しやすさのバランスが取れている',
    ],
    improvementAreas: [
      '後半部分の視聴維持率がやや下がる傾向があるため、構成の見直しを検討',
    ],
    nextEpisodeSuggestions: [
      '今回の型システムの続編として「実践TypeScript - 大規模プロジェクトでの型活用術」を企画する',
      'リスナーからの質問や要望を取り入れた Q&A 形式のエピソードを追加する',
    ],
  },
};

// Demo Episode 2: Needs Improvement
const improvementNeededEpisode: EpisodeHealthReport = {
  episode: {
    id: 'demo-needs-improvement-002',
    name: 'Web開発トレンド2024総まとめ（60分スペシャル）',
    releaseDate: new Date('2024-11-20'),
    duration: 3600, // 60 minutes
    totalStreams: 3240,
    totalListeners: 2156,
    averageListenTime: 1080, // 18 minutes
  },
  healthScore: {
    total: 58,
    level: 'needs-improvement',
    breakdown: {
      playbackRate: 20,
      dropoutRate: 18,
      engagement: 20,
    },
  },
  playbackRateAnalysis: {
    overallRate: 52.3,
    evaluation: 'good',
    byTimeSegment: {
      intro: 78.5,
      earlyMain: 62.4,
      midMain: 41.2,
      lateMain: 15.8,
    },
  },
  dropoutAnalysis: {
    averageDropoutRate: 47.7,
    maxDropoutPoint: {
      timestamp: 2400,
      rate: 65.3,
    },
    pattern: 'problematic',
    topicAnalysis: {
      topics: [
        { name: '紹介・説明', dropoutRate: 21.5 },
        { name: '技術・開発', dropoutRate: 35.8 },
        { name: '比較・競合', dropoutRate: 58.2 },
        { name: '将来・展望', dropoutRate: 72.4 },
        { name: 'ツール・環境', dropoutRate: 41.3 },
      ],
      highInterest: ['紹介・説明'],
      lowInterest: ['比較・競合', '将来・展望'],
    },
  },
  engagementAnalysis: {
    followerGrowthAroundRelease: 156,
    totalStreams: 3240,
    totalListeners: 2156,
    engagementRate: 0.142,
    evaluation: 'standard',
  },
  demographics: {
    age: {
      '18-24': 324,
      '25-34': 1023,
      '35-44': 567,
      '45-54': 198,
      '55+': 44,
    },
    gender: {
      male: 1545,
      female: 523,
      other: 88,
    },
    country: {
      JP: 1834,
      US: 198,
      UK: 67,
      DE: 34,
      FR: 23,
    },
  },
  actionItems: {
    critical: [
      {
        priority: 'critical',
        issue: '中盤から後半にかけて離脱率が急激に上昇している（40分地点で65.3%）',
        action: 'エピソードを30-40分程度に短縮し、内容を絞り込む。または、複数のエピソードに分割する',
        expectedImpact: '視聴維持率が20-30%改善し、完走率が大幅に向上します',
      },
      {
        priority: 'critical',
        issue: '「比較・競合」と「将来・展望」のトピックで離脱率が50%を超えている',
        action: 'これらのトピックを削除するか、より短く簡潔にまとめる。抽象的な話より具体例を増やす',
        expectedImpact: '中盤以降の離脱率が15-25%改善します',
      },
    ],
    high: [
      {
        priority: 'high',
        issue: '60分は長すぎて、リスナーが最後まで視聴するのが困難',
        action: '今後のエピソードは30-40分を目安にし、内容を凝縮する',
        expectedImpact: '平均視聴時間が30%以上向上します',
      },
      {
        priority: 'high',
        issue: 'イントロの維持率は良好だが、本編で急激に低下',
        action: 'イントロで約束した内容を早めに提供し、本編の構成を見直す',
        expectedImpact: '前半の離脱率が10-15%改善します',
      },
    ],
    recommended: [
      {
        priority: 'recommended',
        issue: '「紹介・説明」のトピックは離脱率が低いため、このスタイルを活かす',
        action: '具体的な説明や実例を増やし、抽象的な比較や展望を減らす構成にシフトする',
        expectedImpact: '全体的な視聴満足度が向上します',
      },
    ],
    futureEpisodes: [
      {
        priority: 'recommended',
        issue: '総まとめ形式は長くなりがちで離脱を招く',
        action: '次回から「総まとめ」ではなく、1つのトピックに絞った深掘り形式にする',
        expectedImpact: 'エピソードあたりの視聴維持率が安定します',
      },
    ],
  },
  aiInsights: {
    overview:
      'このエピソード「Web開発トレンド2024総まとめ」は、改善が必要な状態です。再生率52.3%は基準（50%）をわずかに上回っているものの、60分という長さが裏目に出て、中盤以降の離脱率が非常に高くなっています。イントロの維持率78.5%は良好ですが、本編で急激に低下する点が課題です。エンゲージメント率0.142は標準的ですが、フォロワーの期待に応えられていない可能性があります。',
    playbackRateAssessment:
      '指標1（再生率）: 平均再生率52.3%は基準の50%をわずかに上回っていますが、改善の余地が大きいです。特に中盤（41.2%）から後半（15.8%）にかけて大幅に低下しており、60分という長さがリスナーの負担になっています。イントロの78.5%は良好なので、導入部分は魅力的ですが、その後の内容が期待に応えられていない可能性があります。',
    dropoutAssessment:
      '指標2（離脱ポイント）: 平均離脱率47.7%は40%の基準を超えており、問題があります。40分地点での最大離脱（65.3%）は深刻です。トピック別では「比較・競合」(58.2%)と「将来・展望」(72.4%)が特に高く、抽象的で具体性に欠ける内容がリスナーを退屈させている可能性があります。一方、「紹介・説明」(21.5%)は良好なので、具体的な説明スタイルが有効です。',
    engagementAssessment:
      '指標3（エンゲージメント）: エンゲージメント率0.142は標準的ですが、フォロワー増加156人に対して再生数3,240は相対的に低めです。フォロワーは増えているものの、既存フォロワーの視聴率が低い、またはタイトルやテーマが期待と合っていない可能性があります。60分という長さが視聴のハードルを上げている可能性もあります。',
    priorityActions: [
      'エピソードの長さを30-40分に短縮し、内容を絞り込む。総まとめ形式よりも、特定のトピックに深く焦点を当てる',
      '「比較・競合」と「将来・展望」のような抽象的なトピックを削減し、具体的な実例やデモを増やす',
      'イントロで約束した内容を早めに提供し、リスナーの期待に応える構成に見直す',
    ],
    successFactors: [
      'イントロ部分の維持率78.5%は良好で、リスナーの興味を引く導入ができている',
      '「紹介・説明」のトピックは離脱率21.5%と良好で、このスタイルはリスナーに受け入れられている',
    ],
    improvementAreas: [
      '60分という長さが最大の問題。リスナーの視聴可能時間を超えている',
      '中盤以降の内容が抽象的で具体性に欠け、リスナーの興味を保てていない',
      'イントロで期待を高めているが、本編がその期待に応えられていない',
    ],
    nextEpisodeSuggestions: [
      '次回は30-40分を目安に、1つのフレームワークやツールに焦点を当てた実践的な内容にする',
      '「総まとめ」形式は避け、具体的なテーマで深掘りする形式を採用する',
    ],
  },
};

// Demo Episode 3: Critical State
const criticalEpisode: EpisodeHealthReport = {
  episode: {
    id: 'demo-critical-003',
    name: '【初心者向け】プログラミング学習の始め方',
    releaseDate: new Date('2024-11-25'),
    duration: 1800, // 30 minutes
    totalStreams: 890,
    totalListeners: 623,
    averageListenTime: 420, // 7 minutes
  },
  healthScore: {
    total: 35,
    level: 'critical',
    breakdown: {
      playbackRate: 10,
      dropoutRate: 12,
      engagement: 13,
    },
  },
  playbackRateAnalysis: {
    overallRate: 28.7,
    evaluation: 'needs-improvement',
    byTimeSegment: {
      intro: 56.3,
      earlyMain: 38.2,
      midMain: 15.4,
      lateMain: 4.8,
    },
  },
  dropoutAnalysis: {
    averageDropoutRate: 71.3,
    maxDropoutPoint: {
      timestamp: 480,
      rate: 82.5,
    },
    pattern: 'problematic',
    topicAnalysis: {
      topics: [
        { name: '紹介・説明', dropoutRate: 43.7 },
        { name: '問題・課題', dropoutRate: 78.9 },
        { name: '改善・解決', dropoutRate: 65.2 },
        { name: 'ツール・環境', dropoutRate: 71.4 },
      ],
      highInterest: [],
      lowInterest: ['問題・課題', '改善・解決', 'ツール・環境'],
    },
  },
  engagementAnalysis: {
    followerGrowthAroundRelease: 287,
    totalStreams: 890,
    totalListeners: 623,
    engagementRate: 0.038,
    evaluation: 'needs-improvement',
  },
  demographics: {
    age: {
      '18-24': 198,
      '25-34': 267,
      '35-44': 112,
      '45-54': 34,
      '55+': 12,
    },
    gender: {
      male: 423,
      female: 178,
      other: 22,
    },
    country: {
      JP: 534,
      US: 56,
      UK: 21,
      DE: 8,
      FR: 4,
    },
  },
  actionItems: {
    critical: [
      {
        priority: 'critical',
        issue: '再生率28.7%は基準（50%）を大幅に下回り、8分地点で82.5%が離脱している',
        action: 'タイトルと内容が一致していない可能性が高い。「初心者向け」と謳いながら、実際の内容が難しすぎる、または期待と異なる内容になっていないか確認し、全面的に見直す',
        expectedImpact: '再生率が15-25%向上し、ターゲットオーディエンスに適切にリーチできます',
      },
      {
        priority: 'critical',
        issue: 'フォロワーが287人増加しているのに、再生数が890と極端に低い',
        action: 'タイトル、サムネイル、エピソード説明を大幅に見直し。既存フォロワーが「これは自分向けではない」と判断している可能性が高い。ターゲットオーディエンスの再定義が必要',
        expectedImpact: 'エンゲージメント率が3-5倍に向上し、フォロワーが実際に視聴するようになります',
      },
      {
        priority: 'critical',
        issue: '全てのトピックで離脱率が43%以上と非常に高い',
        action: '内容が初心者向けと謳いながら難しすぎる、または退屈すぎる可能性。初心者が本当に知りたい「最初の一歩」に焦点を絞り、より具体的で実践的な内容に変更',
        expectedImpact: '離脱率が30-40%改善し、ターゲット層に響く内容になります',
      },
    ],
    high: [
      {
        priority: 'high',
        issue: 'イントロは56.3%と比較的良好だが、本編で急激に低下',
        action: 'イントロで約束している内容と本編の内容が乖離している可能性。イントロを見直すか、本編を約束通りの内容に変更',
        expectedImpact: '前半の離脱率が20-30%改善します',
      },
    ],
    recommended: [],
    futureEpisodes: [
      {
        priority: 'recommended',
        issue: '「初心者向け」というターゲティングが機能していない',
        action: '次回から、より明確で具体的なターゲット設定（例：「5分でわかる！初めてのPython」）にする',
        expectedImpact: '適切なオーディエンスにリーチし、満足度が向上します',
      },
    ],
  },
  aiInsights: {
    overview:
      'このエピソード「【初心者向け】プログラミング学習の始め方」は、3つの指標全てで深刻な問題を抱えています。再生率28.7%は基準を大幅に下回り、平均離脱率71.3%は非常に高い状態です。最も深刻なのは、フォロワーが287人も増加しているにも関わらず、再生数が890と極端に低いことです。これは、タイトルやテーマが既存フォロワーの期待と完全に乖離していることを示しています。早急な対策が必要です。',
    playbackRateAssessment:
      '指標1（再生率）: 平均再生率28.7%は基準の50%を大きく下回り、緊急対応が必要です。イントロの56.3%は比較的良好ですが、本編開始8分で82.5%が離脱するという異常な状況です。「初心者向け」と謳いながら、実際の内容が初心者の期待に応えていない、または難しすぎる可能性が極めて高いです。タイトルと内容の不一致が最大の原因と考えられます。',
    dropoutAssessment:
      '指標2（離脱ポイント）: 平均離脱率71.3%は極めて深刻で、8分地点での82.5%離脱は異常です。全てのトピックで離脱率が43%以上という状況は、コンテンツの根本的な問題を示しています。特に「問題・課題」(78.9%)で大量離脱が発生しており、初心者が求めている「解決策」ではなく「問題点の列挙」になっている可能性があります。',
    engagementAssessment:
      '指標3（エンゲージメント）: これが最も深刻です。フォロワー287人増加（これ自体は良い）に対して、再生数890、エンゲージメント率0.038は異常に低い数値です。これは、このエピソードが既存フォロワーの興味と完全に合っていないことを示しています。タイトルに惹かれて来た新規視聴者も、内容が期待と異なるため即座に離脱していると考えられます。',
    priorityActions: [
      'タイトルと内容の完全な見直し。「初心者向け」なら、本当に初心者が最初に知りたい「環境構築」「最初のコード」など超具体的な内容に絞る',
      'エピソード全体を10-15分に短縮し、1つの具体的なトピック（例：「5分でPythonを動かす」）に集中する',
      '既存フォロワーの属性を分析し、彼らが求めているコンテンツとのギャップを埋める。または、新しいターゲット層を狙う場合は、それに合わせたマーケティングを行う',
    ],
    successFactors: [
      'タイトルは新規フォロワーを287人も獲得できるだけの訴求力がある（ただし内容とのミスマッチが問題）',
    ],
    improvementAreas: [
      'タイトルと内容の深刻な乖離。「初心者向け」というラベルと実際の内容が合っていない',
      '内容が抽象的で、初心者が求めている具体的な「次の一歩」を提供できていない',
      '既存フォロワーの期待を完全に無視した内容になっている',
      '8分という早い段階で大量離脱が発生する構成上の問題',
    ],
    nextEpisodeSuggestions: [
      '次回は「【3分で完了】Pythonのインストールと最初のHello World」のような、超具体的で短いエピソードにする',
      '既存フォロワーの属性を調査し、彼らが本当に求めているコンテンツを提供する。初心者向けではなく中級者向けかもしれない',
    ],
  },
};

// Generate demo reports
const demoDir = path.join(__dirname, '..', 'demo-reports');

// Ensure demo directory exists
if (!fs.existsSync(demoDir)) {
  fs.mkdirSync(demoDir, { recursive: true });
}

// Save demo data
fs.writeFileSync(
  path.join(demoDir, 'demo-excellent-report.json'),
  JSON.stringify(excellentEpisode, null, 2)
);

fs.writeFileSync(
  path.join(demoDir, 'demo-improvement-needed-report.json'),
  JSON.stringify(improvementNeededEpisode, null, 2)
);

fs.writeFileSync(
  path.join(demoDir, 'demo-critical-report.json'),
  JSON.stringify(criticalEpisode, null, 2)
);

console.log('✅ Demo data generated successfully!');
console.log('📁 Files created:');
console.log('   - demo-excellent-report.json (95/100 - Excellent)');
console.log('   - demo-improvement-needed-report.json (58/100 - Needs Improvement)');
console.log('   - demo-critical-report.json (35/100 - Critical)');
