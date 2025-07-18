"use client";

import { getRecommendRestaurantInfo } from "@/app/aidemo/action";
import { BlockQuote } from "@/components/BlockQuote/BlockQuote";
import { CookingLoader } from "@/components/CookingLoader/CookingLoader";
import { ProgressBar } from "@/components/Progress/Progress";
import { RadioCard } from "@/components/RadioCard/RadioCard";
import { allQuestions } from "@/data/questions";
import { generateTabelogURL } from "@/lib/generateTabelogURL/generateTabelogURL";
import geoConverter from "@/lib/geoConverter/geoConverter";
import makeTabelogQuery, {
  SearchOptions,
} from "@/lib/makeTabelogQuery/makeTabelogQuery";
import { Button, ScrollArea } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./QuizPage.module.css";
import React from "react";

type RoomData = {
  id?: string;
  area?: string;
  preSelectedAnswers?: SearchOptions;
};

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const encoded = searchParams.get("room");

  // ルーム情報の解析（ソロモードとみんなでモード対応）
  const roomData: RoomData = encoded ? JSON.parse(encoded) : {};
  const isGroupMode = Boolean(roomData.id);
  const preSelectedAnswers = roomData.preSelectedAnswers || {};

  const getQuestionsForMode = () => {
    if (isGroupMode) {
      // マルチモード: 場所の質問（id: 0）以外を表示
      return allQuestions.filter((q) => q.id !== 0);
    } else {
      // ソロモード: 全質問を表示
      return allQuestions;
    }
  };
  const questionsForCurrentMode = getQuestionsForMode();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<SearchOptions>(() => {
    // 初期状態でマルチモードの場合は場所を設定
    if (isGroupMode && roomData.area) {
      return {
        ...preSelectedAnswers,
        0: roomData.area,
      };
    }
    return preSelectedAnswers;
  });
  const [showSummaryPage, setShowSummaryPage] = useState<boolean>(false);
  const [isSelectionMade, setIsSelectionMade] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 事前選択された項目をスキップした質問リスト
  const availableQuestions = questionsForCurrentMode.filter((question) => {
    const hasPreSelectedAnswer = preSelectedAnswers[question.id];
    return !hasPreSelectedAnswer;
  });

  const totalSteps: number = availableQuestions.length;

  useEffect(() => {
    const currentQuestion = availableQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const currentQuestionId = currentQuestion.id;
    const answer = answers[currentQuestionId];

    if (currentQuestion.required === false) {
      setIsSelectionMade(true);
    } else {
      setIsSelectionMade(
        Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
      );
    }
  }, [currentQuestionIndex, answers, availableQuestions]);

  const handleOptionChange = (selectedValue: string | string[]) => {
    const currentQuestion = availableQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    const questionId = currentQuestion.id;

    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedValue,
    }));

    setIsSelectionMade(
      Array.isArray(selectedValue)
        ? selectedValue.length > 0
        : Boolean(selectedValue)
    );
  };

  const proceedToNext = () => {
    if (currentQuestionIndex < availableQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSummaryPage(true);
    }
  };

  const handleGoBack = () => {
    if (showSummaryPage) {
      setShowSummaryPage(false);
      const lastQuestion = availableQuestions[availableQuestions.length - 1];
      if (lastQuestion) {
        const answer = answers[lastQuestion.id];
        setIsSelectionMade(
          Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
        );
      }
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const buildTabelogUrl = async (lat: number, lng: number) => {
    const tabelogURL = await generateTabelogURL(lat, lng);
    const queryParams = makeTabelogQuery(answers);
    const returnTabelogUrl = `${tabelogURL}${queryParams}`;
    return returnTabelogUrl;
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      let lat: number;
      let lng: number;
      let destinationRoute: string;

      if (isGroupMode) {
        // みんなでモード: ルーム情報から場所を取得
        const area = roomData.area;
        if (!area) {
          alert("エリア情報が見つかりません");
          setIsLoading(false);
          return;
        }

        const areaLatLng = await geoConverter(area);
        if (!areaLatLng) {
          alert("座標変換に失敗しました");
          setIsLoading(false);
          return;
        }

        lat = parseFloat(areaLatLng.latitude);
        lng = parseFloat(areaLatLng.longitude);
        destinationRoute = `/recommend-result?roomid=${roomData.id}&data=`;
      } else {
        // ソロモード: 回答から場所を取得
        // 修正：場所の質問ID（0）から取得
        const locationAnswer = answers[0]; // 場所の質問ID

        if (!locationAnswer) {
          alert("場所の選択が必要です");
          setIsLoading(false);
          return;
        }

        try {
          const areaLatLng = await geoConverter(locationAnswer as string);
          if (!areaLatLng) {
            alert("座標変換に失敗しました");
            setIsLoading(false);
            return;
          }

          lat = parseFloat(areaLatLng.latitude);
          lng = parseFloat(areaLatLng.longitude);
          destinationRoute = `/recommend-result?data=`;
        } catch (geoError) {
          console.error("geoConverter error:", geoError);
          alert("座標変換エラーが発生しました");
          setIsLoading(false);
          return;
        }
      }

      // 残りの処理は同じ...
      const returnTabelogUrl = await buildTabelogUrl(lat, lng);
      const aiAgentres = await getRecommendRestaurantInfo(
        returnTabelogUrl,
        answers
      );

      if ("result" in aiAgentres && Array.isArray(aiAgentres.result)) {
        const encodedData = encodeURIComponent(
          JSON.stringify(aiAgentres.result)
        );
        router.push(`${destinationRoute}${encodedData}`);
      } else {
        console.error("Invalid response format:", aiAgentres);
        alert("レストラン情報の取得に失敗しました");
      }
    } catch (error) {
      console.error("レストラン情報の取得に失敗しました:", error);
      alert("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers(preSelectedAnswers);
    setShowSummaryPage(false);
    setIsSelectionMade(false);
  };

  const currentQuestion = showSummaryPage
    ? null
    : availableQuestions[currentQuestionIndex];

  if (isLoading) {
    return <CookingLoader />;
  }

  // 質問がない場合（全て事前選択済み）は直接サマリーページを表示
  if (availableQuestions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.mainPanel}>
          <div className={styles.finalActionArea}>
            <h2 className={styles.finalActionTitle}>
              事前選択された条件で検索します
            </h2>
            <div className={styles.summaryAnswers}>
              <ScrollArea.Autosize mah="50vh" scrollbarSize={8} type="auto">
                <div className={styles.summaryContent}>
                  {allQuestions.map((q) => {
                    const answer = answers[q.id];
                    const hasAnswer = Array.isArray(answer)
                      ? answer.length > 0
                      : Boolean(answer);

                    return hasAnswer ? (
                      <div key={q.id} className={styles.answerBlock}>
                        <strong>{q.text}</strong>
                        <div className={styles.answerContent}>
                          {Array.isArray(answer) ? answer.join(", ") : answer}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </ScrollArea.Autosize>
            </div>
            <div className={styles.finalActionButtons}>
              <Button
                size="lg"
                onClick={handleComplete}
                className={styles.completeButton}
                disabled={isLoading}
              >
                {isLoading ? "検索中..." : "お店を探す"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainPanel}>
        <div className={styles.progress}>
          <ProgressBar
            currentStep={showSummaryPage ? totalSteps : currentQuestionIndex}
            totalSteps={totalSteps}
          />
        </div>

        {!showSummaryPage && currentQuestion && (
          <div className={styles.currentQuestionInputArea}>
            <div className={styles.currentQuestionDisplay}>
              <BlockQuote questionText={currentQuestion.text} />
            </div>

            <div className={styles.area}>
              <RadioCard
                options={currentQuestion.options}
                onOptionChange={handleOptionChange}
                selectedValue={answers[currentQuestion.id] || null}
                allowMultiple={currentQuestion.allowMultiple}
              />
            </div>

            <div className={styles.questionNavButtons}>
              {currentQuestionIndex > 0 && (
                <Button
                  onClick={handleGoBack}
                  className={styles.backButton}
                  variant="default"
                  size="md"
                >
                  戻る
                </Button>
              )}
              <Button
                onClick={proceedToNext}
                size="md"
                disabled={!isSelectionMade}
                className={styles.nextButton}
                styles={{
                  root: {
                    backgroundColor: "#ff6b95",
                    "&:hover": {
                      backgroundColor: "#ff497a",
                    },
                    "&:disabled": {
                      backgroundColor: "#f8c8d0",
                      color: "#aaa",
                    },
                  },
                }}
              >
                次へ
              </Button>
            </div>
          </div>
        )}

        {showSummaryPage && (
          <div className={styles.finalActionArea}>
            <h2 className={styles.finalActionTitle}>回答を確認してください</h2>
            <div className={styles.summaryAnswers}>
              <ScrollArea.Autosize mah="50vh" scrollbarSize={8} type="auto">
                <div className={styles.summaryContent}>
                  {allQuestions.map((q) => {
                    const answer = answers[q.id];
                    const hasAnswer = Array.isArray(answer)
                      ? answer.length > 0
                      : Boolean(answer);

                    return hasAnswer ? (
                      <div key={q.id} className={styles.answerBlock}>
                        <strong>{q.text}</strong>
                        <div className={styles.answerContent}>
                          {Array.isArray(answer) ? answer.join(", ") : answer}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </ScrollArea.Autosize>
            </div>
            <div className={styles.finalActionButtons}>
              <Button
                size="lg"
                onClick={handleComplete}
                className={styles.completeButton}
                disabled={isLoading}
              >
                {isLoading ? "検索中..." : "お店を探す"}
              </Button>
            </div>
            <div className={styles.resetButtonContainer}>
              <button onClick={handleReset} className={styles.resetButton}>
                最初からやり直す
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
