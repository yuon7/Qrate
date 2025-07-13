"use client";

import { RecommendationResults } from "@/features/Recommend/RecommendationResults";
import { Button, Container, Title } from "@mantine/core";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/sessionStorage/recommendSession";

type Restaurant = {
  name: string;
  url: string;
  genre: string;
  area: string;
  station: string;
  distance: string;
  rating: number;
  reviewCount: number;
  savedCount: number;
  budgetDinner: string;
  budgetLunch: string;
  description: string;
  hasVpoint: boolean;
  isHotRestaurant: boolean;
  thumbnailImages: string[];
};

type RecommendationResult = {
  restaurant: Restaurant;
  recommendReason: string;
  matchScore: number;
};

interface ClientPageProps {
  user: User;
  roomId?: string;
  results?: RecommendationResult[];
  sessionId?: string;
}

export default function ClientPage({ user, results, roomId, sessionId }: ClientPageProps) {
  const router = useRouter();
  const [sessionResults, setSessionResults] = useState<RecommendationResult[]>([]);
  const [sessionRoomId, setSessionRoomId] = useState<string | undefined>(roomId);
  const [loading, setLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    if (sessionId) {
      try {
        const sessionData = getSession(sessionId);
        if (sessionData) {
          setSessionResults(sessionData.results || []);
          setSessionRoomId(sessionData.roomId);
        } else {
          console.error("Session data not found");
          router.push("/meal3");
        }
      } catch (error) {
        console.error("Failed to get session data:", error);
        router.push("/meal3");
      } finally {
        setLoading(false);
      }
    }
  }, [sessionId, router]);

  const handleGoBack = () => {
    router.back();
  };

  const finalResults = sessionId ? sessionResults : results || [];
  const finalRoomId = sessionId ? sessionRoomId : roomId;

  if (loading) {
    return (
      <Container size="lg" px="lg" py={80}>
        <Title order={2} mb="xl" ta="center">
          データを読み込んでいます...
        </Title>
      </Container>
    );
  }

  return (
    <Container size="lg" px="lg" py={80}>
      <Button variant="outline" onClick={handleGoBack} mb="xl">
        戻る
      </Button>

      <Title order={2} mb="xl" ta="center">
        レストラン推薦結果
      </Title>

      <RecommendationResults results={finalResults} user={user} roomId={finalRoomId} />
    </Container>
  );
}
