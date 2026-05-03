import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import OnboardingScreen from "@/components/screens/OnboardingScreen";
import LanguageScreen from "@/components/screens/LanguageScreen";
import RegistrationScreen from "@/components/screens/RegistrationScreen";
import GameScreen from "@/components/screens/GameScreen";
import DashboardScreen from "@/components/screens/DashboardScreen";
import StoreScreen from "@/components/screens/StoreScreen";
import WelcomeBackScreen from "@/components/screens/WelcomeBackScreen";
import StageScreen from "@/components/screens/StageScreen";
import LevelCompleteScreen from "@/components/screens/LevelCompleteScreen";
import StageCompleteScreen from "@/components/screens/StageCompleteScreen";
import AccountScreen from "@/components/screens/AccountScreen";
import LeaderboardScreen from "@/components/screens/LeaderboardScreen";
import CinematicIntro from "@/components/CinematicIntro";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlexiKeys — Small steps. Big progress." },
      {
        name: "description",
        content:
          "FlexiKeys helps kids learn the alphabet with a friendly cloud mascot, adaptive keyboards, and playful rewards.",
      },
      { property: "og:title", content: "FlexiKeys — Learn letters playfully" },
      {
        property: "og:description",
        content:
          "A gentle, adaptive alphabet game for kids. Tap, learn, and earn stars with your cloud friend.",
      },
    ],
  }),
  component: Index,
});

const AppContent: React.FC = () => {
  const { screen } = useGame();
  switch (screen) {
    case "onboarding":
      return <OnboardingScreen />;
    case "language":
      return <LanguageScreen />;
    case "registration":
      return <RegistrationScreen />;
    case "game":
      return <GameScreen />;
    case "dashboard":
      return <DashboardScreen />;
    case "store":
      return <StoreScreen />;
    case "welcomeBack":
      return <WelcomeBackScreen />;
    case "stages":
      return <StageScreen />;
    case "levelComplete":
      return <LevelCompleteScreen />;
    case "stageComplete":
      return <StageCompleteScreen />;
    case "account":
      return <AccountScreen />;
    case "leaderboard":
      return <LeaderboardScreen />;
    default:
      return <OnboardingScreen />;
  }
};

function Index() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <GameProvider>
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}
      <AppContent />
    </GameProvider>
  );
}
