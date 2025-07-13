import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ClientPage from "./client-page";

interface RecommendResultPageProps {
  searchParams: {
    data?: string;
    roomid?: string | undefined;
    sessionId?: string;
  };
}

export default async function RecommendResultPage({
  searchParams,
}: RecommendResultPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!searchParams.data && !searchParams.sessionId) {
    redirect("/meal3");
  }

  let results;
  let roomid: string | undefined;
  
  if (searchParams.sessionId) {
    return <ClientPage user={user} sessionId={searchParams.sessionId} />;
  }

  try {
    if (!searchParams.data) {
      redirect("/meal3");
    }
    results = JSON.parse(decodeURIComponent(searchParams.data));
    roomid = searchParams.roomid;
  } catch (error) {
    console.error("Failed to parse recommendation data:", error);
    redirect("/meal3");
  }

  return <ClientPage user={user} results={results} roomId={roomid} />;
}
