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
import { saveRecommendationResult } from "@/lib/sessionStorage/recommendSession";

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const encoded = searchParams.get("room");
  if (!encoded) return <p>ルーム情報がありません</p>;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<SearchOptions>({});
  const [showSummaryPage, setShowSummaryPage] = useState<boolean>(false);
  const [isSelectionMade, setIsSelectionMade] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const totalSteps: number = allQuestions.length;

  useEffect(() => {
    const currentQuestion = allQuestions[currentQuestionIndex];
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
  }, [currentQuestionIndex, answers]);

  const handleOptionChange = (selectedValue: string | string[]) => {
    const currentQuestion = allQuestions[currentQuestionIndex];
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
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSummaryPage(true);
    }
  };

  const handleGoBack = () => {
    if (showSummaryPage) {
      setShowSummaryPage(false);
      const lastQuestionId = allQuestions[allQuestions.length - 1]?.id;
      if (lastQuestionId !== undefined) {
        const answer = answers[lastQuestionId];
        setIsSelectionMade(
          Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
        );
      }
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const buildTabelogUrl = async (lat: number, lng: number) => {
    // URLのクエリないやつ
    const tabelogURL = await generateTabelogURL(lat, lng);
    // クエリパラメータ部分
    const queryParams = makeTabelogQuery(answers);
    const returnTabelogUrl = `${tabelogURL}${queryParams}`;
    return returnTabelogUrl;
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      const roomObj = JSON.parse(encoded);
      const roomId = roomObj.id;
      const area = roomObj.area;
      const areaLatLng = await geoConverter(area);
      if (areaLatLng) {
        const lat = parseFloat(areaLatLng.latitude);
        const lng = parseFloat(areaLatLng.longitude);
        const returnTabelogUrl = await buildTabelogUrl(lat, lng);

        const aiAgentres = await getRecommendRestaurantInfo(
          returnTabelogUrl,
          answers
        );
        if ("result" in aiAgentres && Array.isArray(aiAgentres.result)) {
          const sessionId = saveRecommendationResult(
            aiAgentres.result,
            roomId
          );
          
          router.push(`/recommend-result?sessionId=${sessionId}`);
        } else {
          console.error("Invalid response format:", aiAgentres);
        }
      }
    } catch (error) {
      console.error("レストラン情報の取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowSummaryPage(false);
    setIsSelectionMade(false);
  };

  const currentQuestion = showSummaryPage
    ? null
    : allQuestions[currentQuestionIndex];

  if (isLoading) {
    return <CookingLoader />;
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
              {/* <Button size="lg" onClick={handleGoBack} variant="default">
              修正する
            </Button> */}
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
