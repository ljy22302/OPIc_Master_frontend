import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, MessageSquare, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const essentialPhrases = {
  introduction: [
    { phrase: "Let me introduce myself...", meaning: "저를 소개하겠습니다..." },
    { phrase: "I'd like to tell you about...", meaning: "…에 대해 말씀드리고 싶습니다." },
    { phrase: "Speaking of...", meaning: "말하자면..." },
    { phrase: "As far as I know...", meaning: "제가 알기로는..." },
    { phrase: "In my opinion...", meaning: "제 생각에는..." },
  ],
  description: [
    { phrase: "To be more specific...", meaning: "더 구체적으로 말하자면..." },
    { phrase: "What I mean is...", meaning: "내 말은..." },
    { phrase: "In other words...", meaning: "다르게 말하면..." },
    { phrase: "For instance...", meaning: "예를 들면..." },
    { phrase: "Let me give you an example...", meaning: "예를 하나 들어 보겠습니다..." },
  ],
  comparison: [
    { phrase: "Compared to...", meaning: "…와 비교해서..." },
    { phrase: "Unlike...", meaning: "…와는 달리..." },
    { phrase: "On the other hand...", meaning: "반면에..." },
    { phrase: "Similarly...", meaning: "비슷하게..." },
    { phrase: "In contrast to...", meaning: "…와 대비하여..." },
  ],
  conclusion: [
    { phrase: "All in all...", meaning: "결론적으로..." },
    { phrase: "In conclusion...", meaning: "끝으로..." },
    { phrase: "To sum up...", meaning: "요약하자면..." },
    { phrase: "That's basically it...", meaning: "그게 기본적으로 전부입니다." },
    { phrase: "That's all I wanted to say about...", meaning: "…에 대해 말하고 싶었던 것은 이것뿐입니다." },
  ],
};

const topicVocabulary = [
  {
    topic: "공연 (Performance)",
    words: [
      "concert - 콘서트",
      "stage - 무대",
      "audience - 관객",
      "rehearsal - 리허설",
      "ticket - 티켓",
      "microphone - 마이크",
    ],
  },
  {
    topic: "국내여행 (Domestic Travel)",
    words: [
      "road trip - 자동차 여행",
      "itinerary - 여행 일정",
      "local food - 지역 음식",
      "accommodation - 숙박",
      "scenic - 경치 좋은",
      "travel budget - 여행 예산",
    ],
  },
  {
    topic: "카페 (Cafe)",
    words: [
      "atmosphere - 분위기",
      "cozy - 아늑한",
      "latte art - 라떼 아트",
      "specialty coffee - 스페셜티 커피",
      "espresso - 에스프레소",
      "pastry - 페이스트리",
    ],
  },
  {
    topic: "운동 (Exercise)",
    words: [
      "workout routine - 운동 루틴",
      "cardio - 유산소 운동",
      "strength training - 근력 운동",
      "flexibility - 유연성",
      "endurance - 지구력",
      "gym - 체육관",
    ],
  },
  {
    topic: "집 (Home)",
    words: [
      "roommate - 룸메이트",
      "rent - 월세",
      "chores - 집안일",
      "renovation - 개조",
      "living room - 거실",
      "neighborhood - 동네",
    ],
  },
  {
    topic: "요리 (Cooking)",
    words: [
      "recipe - 레시피",
      "ingredients - 재료",
      "seasoning - 양념",
      "simmer - 약한 불로 끓이다",
      "garnish - 장식",
      "homemade - 집에서 만든",
    ],
  },
  {
    topic: "캠핑 (Camping)",
    words: [
      "tent - 텐트",
      "campfire - 모닥불",
      "sleeping bag - 침낭",
      "trail - 트레일",
      "marshmallow - 마시멜로",
      "scenery - 풍경",
    ],
  },
  {
    topic: "조깅/산책 (Jogging/Walking)",
    words: [
      "trail - 산책로",
      "pace - 속도",
      "fresh air - 신선한 공기",
      "sneakers - 운동화",
      "route - 경로",
      "stretch - 스트레칭",
    ],
  },
  {
    topic: "사는 지역 (Housing)",
    words: [
      "neighborhood - 동네",
      "commute - 출퇴근",
      "public transport - 대중교통",
      "apartment - 아파트",
      "green space - 녹지",
      "community - 커뮤니티",
    ],
  },
  {
    topic: "해외여행 (Abroad)",
    words: [
      "visa - 비자",
      "embassy - 대사관",
      "backpacking - 배낭여행",
      "sightseeing - 관광",
      "cultural exchange - 문화 교류",
      "accommodation - 숙박",
    ],
  },
  {
    topic: "휴일 (Holiday)",
    words: [
      "getaway - 휴가",
      "relaxation - 휴식",
      "celebration - 축하",
      "festival - 축제",
      "break - 휴식 시간",
      "itinerary - 일정",
    ],
  },
  {
    topic: "이웃 (Neighbor)",
    words: [
      "neighbor - 이웃",
      "community - 공동체",
      "friendly - 친절한",
      "quiet - 조용한",
      "helpful - 도움이 되는",
      "apartment complex - 아파트 단지",
    ],
  },
  {
    topic: "술집 (Drinking Bar)",
    words: [
      "bar - 술집",
      "cocktail - 칵테일",
      "happy hour - 해피 아워",
      "bartender - 바텐더",
      "pub - 펍",
      "atmosphere - 분위기",
    ],
  },
  {
    topic: "음악 (Music)",
    words: [
      "genre - 장르",
      "playlist - 재생 목록",
      "concert - 콘서트",
      "lyrics - 가사",
      "melody - 멜로디",
      "rhythm - 리듬",
    ],
  },
  {
    topic: "게임 (Game)",
    words: [
      "multiplayer - 다중 사용자",
      "console - 콘솔",
      "strategy - 전략",
      "level up - 레벨 업",
      "challenge - 도전",
      "opponent - 상대",
    ],
  },
  {
    topic: "해변 (Beach)",
    words: [
      "sand - 모래",
      "waves - 파도",
      "sunscreen - 자외선 차단제",
      "seaside - 해변가",
      "tide - 조수",
      "shell - 조개껍데기",
    ],
  },
  {
    topic: "공원 (Park)",
    words: [
      "picnic - 소풍",
      "playground - 놀이터",
      "greenery - 녹지",
      "bench - 벤치",
      "lake - 호수",
      "jog - 조깅",
    ],
  },
  {
    topic: "산 (Mountain)",
    words: [
      "hiking trail - 등산로",
      "summit - 정상",
      "altitude - 고도",
      "viewpoint - 전망대",
      "backpack - 배낭",
      "nature - 자연",
    ],
  },
  {
    topic: "쇼핑 (Shopping)",
    words: [
      "bargain - 특가",
      "mall - 쇼핑몰",
      "cashier - 계산대",
      "purchase - 구매",
      "fashion - 패션",
      "souvenir - 기념품",
    ],
  },
  {
    topic: "영화 (Movie)",
    words: [
      "cinema - 영화관",
      "trailer - 예고편",
      "plot - 줄거리",
      "genre - 장르",
      "actor - 배우",
      "review - 리뷰",
    ],
  },
  {
    topic: "구직 (Job)",
    words: [
      "resume - 이력서",
      "interview - 면접",
      "qualification - 자격",
      "career - 경력",
      "candidate - 지원자",
      "position - 직책",
    ],
  },
  {
    topic: "SNS (SNS)",
    words: [
      "post - 게시물",
      "follower - 팔로워",
      "hashtag - 해시태그",
      "feed - 피드",
      "comment - 댓글",
      "update - 업데이트",
    ],
  },
];

const usefulTips = [
  {
    title: "시간 벌기 표현",
    content: [
      {
        phrase: "That's a great question, let me think for a moment.",
        example: "That's a great question, let me think for a moment while I organize my thoughts.",
        translation: "정말 좋은 질문이에요, 생각을 정리할 시간을 잠시만 주세요.",
      },
      {
        phrase: "Hmm, I'm not entirely sure, but I believe...",
        example: "Hmm, I'm not entirely sure, but I believe the best option would be to start early.",
        translation: "음, 확실하지는 않지만, 일찍 시작하는 것이 최선의 선택일 것 같아요.",
      },
      {
        phrase: "Let me see, I would say that...",
        example: "Let me see, I would say that my favorite place to visit is the cafe downtown.",
        translation: "음, 제 생각에는 제가 가장 좋아하는 곳은 시내의 카페예요.",
      },
      {
        phrase: "You know what, I think...",
        example: "You know what, I think I would choose the second example because it sounds more realistic.",
        translation: "있잖아요, 저는 두 번째 예제가 더 현실적으로 들리기 때문에 그걸 선택할 것 같아요.",
      },
    ],
  },
  {
    title: "답변 구조화",
    content: [
      {
        phrase: "First of all, I want to mention that...",
        example: "First of all, I want to mention that preparation is very important for this task.",
        translation: "무엇보다도, 이 과제에서는 준비가 매우 중요하다는 점을 말씀드리고 싶습니다.",
      },
      {
        phrase: "Secondly, I also think that...",
        example: "Secondly, I also think that practicing every day helps build confidence.",
        translation: "둘째로, 매일 연습하는 것이 자신감을 쌓는 데 도움이 된다고 생각합니다.",
      },
      {
        phrase: "Finally, it seems clear that...",
        example: "Finally, it seems clear that I prefer traveling by train rather than by plane.",
        translation: "마지막으로, 비행기보다는 기차로 여행하는 것을 선호하는 것이 분명한 것 같습니다.",
      },
      {
        phrase: "Additionally, I would add that...",
        example: "Additionally, I would add that the food at the cafe was really delicious.",
        translation: "추가로 말씀드리자면, 그 카페의 음식이 정말 맛있었습니다.",
      },
    ],
  },
  {
    title: "경험 말하기",
    content: [
      {
        phrase: "I remember when I first tried...",
        example: "I remember when I first tried camping with my friends, we had so much fun.",
        translation: "친구들과 처음 캠핑을 시도했을 때가 기억나요, 정말 즐거웠어요.",
      },
      {
        phrase: "There was a time when I...",
        example: "There was a time when I had to learn a new skill very quickly.",
        translation: "제가 아주 빨리 새로운 기술을 배워야 했던 때가 있었어요.",
      },
      {
        phrase: "Once I went to...",
        example: "Once I went to a concert and the atmosphere was incredible.",
        translation: "한 번 콘서트에 갔었는데 분위기가 정말 대단했어요.",
      },
      {
        phrase: "I'll never forget the time when...",
        example: "I'll never forget the time when I prepared for a speech and felt very proud afterward.",
        translation: "연설을 준비하고 나서 매우 자랑스러웠던 때를 절대 잊지 못할 거예요.",
      },
    ],
  },
  {
    title: "의견 제시",
    content: [
      {
        phrase: "From my perspective, the best option is...",
        example: "From my perspective, the best option is to choose a relaxed and realistic topic.",
        translation: "제 관점에서는, 편안하고 현실적인 주제를 선택하는 것이 최선의 선택입니다.",
      },
      {
        phrase: "I strongly believe that...",
        example: "I strongly believe that practicing with friends helps improve speaking skills.",
        translation: "저는 친구들과 연습하는 것이 말하기 능력을 향상시키는 데 도움이 된다고 굳게 믿습니다.",
      },
      {
        phrase: "If you ask me, I would say...",
        example: "If you ask me, I would say that studying regularly makes a big difference.",
        translation: "제게 물으신다면, 규칙적으로 공부하는 것이 큰 차이를 만든다고 말씀드리겠습니다.",
      },
      {
        phrase: "The way I see it, ...",
        example: "The way I see it, having a clear structure makes answers much easier to follow.",
        translation: "제 생각에는, 명확한 구조를 갖추는 것이 답변을 훨씬 이해하기 쉽게 만듭니다.",
      },
    ],
  },
];

export function Resources() {
  const navigate = useNavigate();
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [savedPhrases, setSavedPhrases] = useState<string[]>([]);
  const [phraseSets, setPhraseSets] = useState(essentialPhrases);
  const [topicSets, setTopicSets] = useState(topicVocabulary);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [tipSets, setTipSets] = useState(usefulTips);

  const toggleSavedPhrase = (phrase: string) => {
    setSavedPhrases((prev) =>
      prev.includes(phrase) ? prev.filter((item) => item !== phrase) : [...prev, phrase]
    );
  };

  const toggleSavedWord = (word: string) => {
    setSavedWords((prev) =>
      prev.includes(word) ? prev.filter((item) => item !== word) : [...prev, word]
    );
  };

  const refreshPhraseCategory = (category: keyof typeof essentialPhrases) => {
    setPhraseSets((prev) => {
      const next = { ...prev, [category]: [...prev[category]] };
      for (let i = next[category].length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[category][i], next[category][j]] = [next[category][j], next[category][i]];
      }
      return next;
    });
  };

  const refreshTopicCategory = (index: number) => {
    setTopicSets((prev) => {
      const next = [...prev];
      const category = [...next[index].words];
      for (let i = category.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [category[i], category[j]] = [category[j], category[i]];
      }
      next[index] = { ...next[index], words: category };
      return next;
    });
  };

  const refreshTipCategory = (index: number) => {
    setTipSets((prev) => {
      const next = [...prev];
      const category = [...next[index].content];
      for (let i = category.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [category[i], category[j]] = [category[j], category[i]];
      }
      next[index] = { ...next[index], content: category };
      return next;
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">추가 자료</h1>
            <p className="text-gray-600">오픽 준비에 필요한 필수 표현과 단어</p>
          </div>
        </div>

        <Tabs defaultValue="phrases" className="mb-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="phrases">필수 문장</TabsTrigger>
            <TabsTrigger value="vocabulary">주제별 단어</TabsTrigger>
            <TabsTrigger value="tips">유용한 팁</TabsTrigger>
          </TabsList>

          {/* Essential Phrases */}
          <TabsContent value="phrases" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {Object.entries(phraseSets).map(([category, phrases]) => (
                <Card key={category} className="p-6 bg-white">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-yellow-500" />
                      {category === "introduction" ? "시작 표현" :
                       category === "description" ? "설명 표현" :
                       category === "comparison" ? "비교 표현" :
                       "마무리 표현"}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {phrases.map((item, index) => {
                      const isSaved = savedPhrases.includes(item.phrase);
                      return (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 rounded-lg border border-yellow-100"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <p className="text-gray-900 font-medium">{item.phrase}</p>
                              <p className="text-sm text-gray-600 mt-1">{item.meaning}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className={isSaved ? "bg-yellow-200 text-gray-900 hover:bg-yellow-200" : ""}
                              onClick={() => toggleSavedPhrase(item.phrase)}
                            >
                              {isSaved ? "저장됨" : "저장하기"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshPhraseCategory(category as keyof typeof essentialPhrases)}
                    >
                      새로고침
                    </Button>
                  </div>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* Topic Vocabulary */}
          <TabsContent value="vocabulary" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {topicSets.map((item, index) => (
                <Card key={index} className="p-6 bg-white">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-yellow-500" />
                      {item.topic}
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {item.words.map((word, idx) => {
                      const [english, korean] = word.split(" - ");
                      const isSaved = savedWords.includes(word);
                      return (
                        <div
                          key={idx}
                          className="p-4 bg-yellow-50 rounded-lg border border-yellow-100"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{english}</p>
                              <p className="text-sm text-gray-600">{korean}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className={isSaved ? "bg-yellow-200 text-gray-900 hover:bg-yellow-200" : ""}
                              onClick={() => toggleSavedWord(word)}
                            >
                              {isSaved ? "저장됨" : "저장하기"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button size="sm" variant="outline" onClick={() => refreshTopicCategory(index)}>
                      새로고침
                    </Button>
                  </div>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* Useful Tips */}
          <TabsContent value="tips" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {tipSets.map((tip, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedTip(expandedTip === index ? null : index)}
                    >
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        {tip.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedTip === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  {expandedTip === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6"
                    >
                      <div className="space-y-3">
                        {tip.content.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-yellow-50 rounded-lg border border-yellow-100"
                          >
                            <p className="font-semibold text-gray-900">{item.phrase}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.example}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.translation}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshTipCategory(index);
                          }}
                        >
                          새로고침
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              ))}

              {/* General Tips */}
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  💡 전반적인 팁
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>최소 2문장 이상 답변하기 (간단한 답변 지양)</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>구체적인 예시 포함하기</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>과거, 현재, 미래 시제를 다양하게 사용하기</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>연결어를 활용하여 자연스럽게 이어가기</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>침묵 대신 시간 벌기 표현 활용하기</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}