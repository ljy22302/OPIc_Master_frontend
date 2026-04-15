import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Bookmark, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type PhraseItem = {
  phrase: string;
  meaning: string;
};

type TipItem = {
  phrase: string;
  example: string;
  translation: string;
};

type TopicItem = {
  topic: string;
  words: string[];
};

const essentialPhrases: Record<string, PhraseItem[]> = {
  introduction: [
    { phrase: "Let me introduce myself...", meaning: "제가 자기소개를 시작하겠습니다." },
    { phrase: "I'd like to tell you about...", meaning: "…에 대해 말씀드리고 싶습니다." },
    { phrase: "Speaking of...", meaning: "…에 관해서 말하자면" },
    { phrase: "As far as I know...", meaning: "제가 아는 바로는" },
    { phrase: "In my opinion...", meaning: "제 의견으로는" },
  ],
  description: [
    { phrase: "To be more specific...", meaning: "좀 더 구체적으로 말하자면" },
    { phrase: "What I mean is...", meaning: "제가 말하고 싶은 것은" },
    { phrase: "In other words...", meaning: "다시 말해" },
    { phrase: "For instance...", meaning: "예를 들면" },
    { phrase: "Let me give you an example...", meaning: "예를 하나 들어보겠습니다." },
  ],
  comparison: [
    { phrase: "Compared to...", meaning: "…와 비교하면" },
    { phrase: "Unlike...", meaning: "…와 달리" },
    { phrase: "On the other hand...", meaning: "반면에" },
    { phrase: "Similarly...", meaning: "비슷하게" },
    { phrase: "In contrast to...", meaning: "…와 대조적으로" },
  ],
  conclusion: [
    { phrase: "All in all...", meaning: "종합해 보면" },
    { phrase: "In conclusion...", meaning: "결론적으로" },
    { phrase: "To sum up...", meaning: "요약하자면" },
    { phrase: "That's basically it...", meaning: "대체로 그것이 전부입니다." },
    { phrase: "That's all I wanted to say about...", meaning: "…에 대해 제가 말씀드리고 싶었던 것은 이것이 전부입니다." },
  ],
};

const topicVocabulary: TopicItem[] = [
  { topic: "공연", words: ["concert", "stage", "audience", "rehearsal", "ticket", "microphone"] },
  { topic: "국내 여행", words: ["road trip", "itinerary", "local food", "accommodation", "scenic", "budget"] },
  { topic: "카페", words: ["atmosphere", "cozy", "latte art", "specialty coffee", "espresso", "pastry"] },
  { topic: "운동", words: ["workout routine", "cardio", "strength training", "flexibility", "endurance", "gym"] },
  { topic: "집", words: ["living room", "bedroom", "kitchen", "spacious", "organized", "comfort"] },
  { topic: "요리", words: ["recipe", "ingredient", "cook", "season", "boil", "bake"] },
  { topic: "캠핑", words: ["tent", "campfire", "sleeping bag", "outdoor", "backpack", "nature"] },
  { topic: "조깅/걷기", words: ["jogging", "walking", "route", "pace", "fresh air", "stamina"] },
  { topic: "주거", words: ["apartment", "rent", "deposit", "neighbor", "residential", "lease"] },
  { topic: "해외여행", words: ["passport", "flight", "destination", "souvenir", "customs", "guidebook"] },
  { topic: "휴일/연휴", words: ["holiday", "long weekend", "relax", "family time", "travel", "break"] },
  { topic: "이웃", words: ["neighbor", "community", "friendly", "helpful", "greeting", "shared space"] },
  { topic: "술집/회식", words: ["bar", "drinks", "gathering", "colleague", "toast", "conversation"] },
  { topic: "음악", words: ["song", "lyrics", "playlist", "performance", "genre", "melody"] },
  { topic: "게임", words: ["game", "level", "challenge", "player", "strategy", "mission"] },
  { topic: "바다", words: ["ocean", "waves", "beach", "sea breeze", "sunset", "swim"] },
  { topic: "공원", words: ["park", "bench", "trees", "walkway", "picnic", "relax"] },
  { topic: "산", words: ["mountain", "hiking", "trail", "peak", "nature", "view"] },
  { topic: "쇼핑", words: ["shopping mall", "discount", "purchase", "brand", "cart", "receipt"] },
  { topic: "영화", words: ["movie", "scene", "actor", "storyline", "director", "genre"] },
  { topic: "직장", words: ["office", "coworker", "meeting", "deadline", "task", "project"] },
  { topic: "SNS", words: ["post", "share", "follow", "comment", "hashtag", "profile"] },
];

const usefulTips: Array<{ title: string; content: TipItem[] }> = [
  {
    title: "시간 벌기 표현",
    content: [
      {
        phrase: "That's a great question, let me think for a moment.",
        example: "That's a great question, let me think for a moment while I organize my thoughts.",
        translation: "좋은 질문이네요. 제 생각을 정리할 시간을 잠깐 주시면 좋겠습니다.",
      },
      {
        phrase: "Hmm, I'm not entirely sure, but I believe...",
        example: "Hmm, I'm not entirely sure, but I believe the best option would be to start early.",
        translation: "음, 확실하진 않지만 가장 좋은 방법은 일찍 시작하는 것이라고 생각합니다.",
      },
      {
        phrase: "Let me see, I would say that...",
        example: "Let me see, I would say that my favorite place to visit is the cafe downtown.",
        translation: "음, 제일 좋아하는 장소는 시내에 있는 카페라고 말하고 싶습니다.",
      },
      {
        phrase: "You know what, I think...",
        example: "You know what, I think I would choose the second option because it sounds more realistic.",
        translation: "있잖아요, 두 번째 선택지가 더 현실적으로 들려서 그걸 고르겠습니다.",
      },
    ],
  },
  {
    title: "의견 구성",
    content: [
      {
        phrase: "First of all, I want to mention that...",
        example: "First of all, I want to mention that preparation is very important for this task.",
        translation: "우선, 이 과제에서는 준비가 매우 중요하다는 점을 말씀드리고 싶습니다.",
      },
      {
        phrase: "Secondly, I also think that...",
        example: "Secondly, I also think that practicing every day helps build confidence.",
        translation: "둘째로, 매일 연습하는 것이 자신감을 키우는 데 도움이 된다고 생각합니다.",
      },
      {
        phrase: "Finally, it seems clear that...",
        example: "Finally, it seems clear that I prefer traveling by train rather than by plane.",
        translation: "마지막으로, 저는 비행기보다 기차로 여행하는 것을 더 선호하는 것 같습니다.",
      },
      {
        phrase: "Additionally, I would add that...",
        example: "Additionally, I would add that the food at the cafe was really delicious.",
        translation: "추가로 말씀드리자면, 그 카페의 음식은 정말 맛있었습니다.",
      },
    ],
  },
  {
    title: "경험 말하기",
    content: [
      {
        phrase: "I remember when I first tried...",
        example: "I remember when I first tried camping with my friends, we had so much fun.",
        translation: "친구들과 처음 캠핑을 갔을 때를 기억하는데, 정말 즐거웠습니다.",
      },
      {
        phrase: "There was a time when I...",
        example: "There was a time when I had to learn a new skill very quickly.",
        translation: "제가 새로운 기술을 아주 빨리 배워야 했던 때가 있었습니다.",
      },
      {
        phrase: "Once I went to...",
        example: "Once I went to a concert and the atmosphere was incredible.",
        translation: "한번 콘서트에 갔는데 분위기가 정말 대단했습니다.",
      },
      {
        phrase: "I'll never forget the time when...",
        example: "I'll never forget the time when I prepared for a speech and felt very proud afterward.",
        translation: "발표를 준비했던 그때를 절대 잊지 못할 것입니다. 끝나고 정말 뿌듯했습니다.",
      },
    ],
  },
  {
    title: "의견 제시",
    content: [
      {
        phrase: "From my perspective, the best option is...",
        example: "From my perspective, the best option is to choose a relaxed and realistic topic.",
        translation: "제 관점에서는, 편안하고 현실적인 주제를 고르는 것이 가장 좋은 선택입니다.",
      },
      {
        phrase: "I strongly believe that...",
        example: "I strongly believe that practicing with friends helps improve speaking skills.",
        translation: "친구들과 함께 연습하는 것이 말하기 실력 향상에 도움이 된다고 강하게 믿습니다.",
      },
      {
        phrase: "If you ask me, I would say...",
        example: "If you ask me, I would say that studying regularly makes a big difference.",
        translation: "제게 묻는다면, 꾸준히 공부하는 것이 큰 차이를 만든다고 말하겠습니다.",
      },
      {
        phrase: "The way I see it, ...",
        example: "The way I see it, having a clear structure makes answers much easier to follow.",
        translation: "제가 보기에는, 명확한 구조가 있으면 답변을 훨씬 쉽게 이어갈 수 있습니다.",
      },
    ],
  },
];

export function Resources() {
  const navigate = useNavigate();
  const [savedPhrases, setSavedPhrases] = useState<string[]>([]);
  const [expandedMeanings, setExpandedMeanings] = useState<string[]>([]);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const toggleSavedPhrase = (phrase: string) => {
    setSavedPhrases((prev) => (prev.includes(phrase) ? prev.filter((item) => item !== phrase) : [...prev, phrase]));
  };

  const toggleMeaning = (phrase: string) => {
    setExpandedMeanings((prev) => (prev.includes(phrase) ? prev.filter((item) => item !== phrase) : [...prev, phrase]));
  };

  const toggleSavedWord = (word: string) => {
    setSavedWords((prev) => (prev.includes(word) ? prev.filter((item) => item !== word) : [...prev, word]));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">학습 자료</h1>
            <p className="text-gray-600">시험 준비에 필요한 핵심 표현과 어휘를 정리해두었습니다.</p>
          </div>
        </div>

        <Tabs defaultValue="phrases" className="mb-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="phrases">필수 문장</TabsTrigger>
            <TabsTrigger value="vocabulary">주제별 어휘</TabsTrigger>
            <TabsTrigger value="tips">유용한 팁</TabsTrigger>
          </TabsList>

          <TabsContent value="phrases" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {Object.entries(essentialPhrases).map(([category, phrases]) => (
                <Card key={category} className="bg-white p-6">
                  <div className="mb-4">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                      <MessageSquare className="h-5 w-5 text-yellow-500" />
                      {category === "introduction"
                        ? "자기소개 표현"
                        : category === "description"
                          ? "설명 표현"
                          : category === "comparison"
                            ? "비교 표현"
                            : "결론 표현"}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {phrases.map((item) => {
                      const isSaved = savedPhrases.includes(item.phrase);
                      const isExpanded = expandedMeanings.includes(item.phrase);

                      return (
                        <div key={item.phrase} className="rounded-lg border border-yellow-100 bg-yellow-50 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900">{item.phrase}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto gap-1 px-0 py-0 text-gray-700 hover:bg-transparent hover:text-gray-900"
                                  onClick={() => toggleMeaning(item.phrase)}
                                >
                                  해석▶️
                                </Button>
                                {isExpanded && <p className="text-sm text-gray-600">{item.meaning}</p>}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-9 w-9 rounded-full p-0 ${isSaved ? "text-yellow-600" : "text-gray-700"}`}
                              onClick={() => toggleSavedPhrase(item.phrase)}
                              aria-label={isSaved ? "저장됨" : "저장하기"}
                            >
                              <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="vocabulary" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {topicVocabulary.map((topic) => (
                <Card key={topic.topic} className="bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-xl font-bold text-gray-900">{topic.topic}</h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {topic.words.filter((word) => savedWords.includes(word)).length}개 저장됨
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {topic.words.map((word) => {
                      const isSaved = savedWords.includes(word);

                      return (
                        <div key={word} className="flex items-center justify-between rounded-lg border border-yellow-100 bg-yellow-50 p-3">
                          <p className="text-sm text-gray-800">{word}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-9 w-9 rounded-full p-0 ${isSaved ? "text-yellow-600" : "text-gray-700"}`}
                            onClick={() => toggleSavedWord(word)}
                            aria-label={isSaved ? "저장됨" : "저장하기"}
                          >
                            <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="tips" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {usefulTips.map((tip, tipIndex) => (
                <Card key={tip.title} className="bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">{tip.title}</h3>
                  </div>

                  <div className="space-y-3">
                    {tip.content.map((item, itemIndex) => {
                      const key = tipIndex * 100 + itemIndex;
                      const isExpanded = expandedTip === key;

                      return (
                        <div key={item.phrase} className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900">{item.phrase}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 h-auto gap-1 px-0 py-0 text-gray-700 hover:bg-transparent hover:text-gray-900"
                                onClick={() => setExpandedTip(isExpanded ? null : key)}
                              >
                                예문 및 해석
                              </Button>
                              {isExpanded && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-gray-600">{item.example}</p>
                                  <p className="text-sm text-gray-700">{item.translation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
