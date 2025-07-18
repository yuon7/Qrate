export interface Question {
  id: number;
  type: "question";
  text: string;
  options: string[];
  allowMultiple?: boolean;
  required?: boolean;
}

export const allQuestions: Question[] = [
  {
    id: 0, // 場所の質問を最初に追加
    type: "question",
    text: "どちらのエリアで食事をしたいですか？",
    options: [
      "渋谷",
      "新宿",
      "銀座",
      "原宿",
      "池袋",
      "上野",
      "浅草",
      "六本木",
      "恵比寿",
      "中目黒",
      "吉祥寺",
      "立川",
      "町田",
      "横浜",
      "川崎",
      "大宮",
      "その他",
    ],
    allowMultiple: false,
    required: true,
  },
  {
    id: 1,
    type: "question",
    text: "食べたい料理のジャンルは？",
    options: [
      "和食",
      "洋食",
      "中華",
      "イタリアン",
      "焼肉・ホルモン",
      "居酒屋",
      "ダイニングバー",
      "アジア・エスニック",
      "ラーメン",
      "スイーツ",
    ],
    allowMultiple: false,
  },
  {
    id: 2,
    type: "question",
    text: "一人あたりの予算の上限金額は？",
    options: [
      "指定なし",
      "1,000円",
      "2,000円",
      "3,000円",
      "5,000円",
      "10,000円",
      "15,000円",
      "30,000円以上",
    ],
    allowMultiple: false,
  },
  {
    id: 3,
    type: "question",
    text: "利用目的は？",
    options: [
      "知人・友人と",
      "デート",
      "大人数の宴会",
      "家族と",
      "一人で",
      "女子会",
      "合コン",
      "飲み放題",
      "食べ放題",
    ],
    allowMultiple: true,
    required: false,
  },
  {
    id: 4,
    type: "question",
    text: "こだわり条件は？",
    options: [
      "おしゃれな空間",
      "落ち着いた空間",
      "カップルシート",
      "カウンター席",
      "ソファー席",
      "座敷",
      "掘りごたつ",
      "景色が綺麗",
      "夜景が見える",
      "海が見える",
      "ホテルのレストラン",
    ],
    allowMultiple: true,
    required: false,
  },
];
