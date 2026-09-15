"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CheckInChecklist, { type CheckInData, type StudentType } from "@/components/onboarding/CheckInChecklist";
import TeamTypeSelector, { type TeamChoice } from "@/components/onboarding/TeamTypeSelector";
import CreateTeamDossier from "@/components/onboarding/CreateTeamDossier";
import JoinTeamTerminal from "@/components/onboarding/JoinTeamTerminal";
import {
  saveCheckInAction,
  createTeamAction,
  validateTeamCodeAction,
  joinTeamAction,
  type CurrentOnboardingParticipant,
} from "./actions";

interface OnboardingWizardProps {
  initialParticipant: CurrentOnboardingParticipant | null;
  initialStep?: string;
  initialCode?: string;
}

export default function OnboardingWizard({
  initialParticipant,
  initialStep = "checkin",
  initialCode = "",
}: OnboardingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Step State: 'checkin' | 'team-type' | 'create-team' | 'join-team'
  const paramStep = searchParams.get("step") || initialStep;
  const paramCode = searchParams.get("code") || initialCode;

  const [step, setStep] = useState<string>(
    paramStep && ["checkin", "team-type", "create-team", "join-team"].includes(paramStep)
      ? paramStep
      : initialParticipant?.teamId
      ? "create-team"
      : "checkin"
  );

  const studentType: StudentType = initialParticipant?.type ?? "vit";

  const [participantName, setParticipantName] = useState<string>(
    initialParticipant?.name ?? ""
  );

  const [createdTeamCode, setCreatedTeamCode] = useState<string>(
    initialParticipant?.team?.code ?? "VH26-242"
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // STEP 1: Save Check-In data
  const handleCheckInSubmit = async (data: CheckInData) => {
    setIsLoading(true);
    try {
      setParticipantName(data.name);
      await saveCheckInAction(data);
      setStep("team-type");
    } catch (err) {
      console.error("Check-in error:", err);
      // Even if network/db hiccup, allow moving forward in wizard for preview
      setStep("team-type");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Handle Team Choice
  const handleTeamTypeSelect = async (choice: TeamChoice) => {
    if (choice === "create") {
      // Auto-generate team code on select
      setIsLoading(true);
      try {
        const res = await createTeamAction(participantName ? `${participantName}'s Squad` : "");
        if (res.success) {
          setCreatedTeamCode(res.teamCode);
          if (res.qrDataUrl) setQrDataUrl(res.qrDataUrl);
        }
      } catch (err) {
        console.error("Failed to pre-create team:", err);
      } finally {
        setIsLoading(false);
        setStep("create-team");
      }
    } else {
      setStep("join-team");
    }
  };

  // STEP 3A: Create Team Save and Continue
  const handleCreateTeamContinue = async (teamName: string) => {
    setIsLoading(true);
    try {
      if (teamName) {
        await createTeamAction(teamName);
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to finalize team:", err);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3B: Join Team handlers
  const handleValidateCode = async (code: string) => {
    try {
      return await validateTeamCodeAction(code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Validation failed";
      return { success: false, error: msg };
    }
  };

  const handleJoinTeam = async (code: string) => {
    try {
      return await joinTeamAction(code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to join team";
      return { success: false, error: msg };
    }
  };

  const handleContinueToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-black text-white flex flex-col justify-center overflow-hidden">
      {/* Wizard Step Views */}
      {step === "checkin" && (
        <CheckInChecklist
          studentType={studentType}
          initialData={{
            name: participantName || initialParticipant?.name || "",
            regNo: initialParticipant?.regNo ?? "",
            isHosteller: initialParticipant?.isHosteller ?? true,
            blockType: initialParticipant?.blockType ?? "MH",
            hostelBlock: initialParticipant?.hostelBlock ?? "",
            roomNo: initialParticipant?.roomNo ?? "",
            address: initialParticipant?.address ?? "",
            collegeName: initialParticipant?.collegeName ?? "",
            takingAccommodation: initialParticipant?.takingAccommodation ?? true,
          }}
          onSubmit={handleCheckInSubmit}
          isLoading={isLoading}
        />
      )}

      {step === "team-type" && (
        <TeamTypeSelector
          onSelect={handleTeamTypeSelect}
          onBack={() => setStep("checkin")}
        />
      )}

      {step === "create-team" && (
        <CreateTeamDossier
          teamCode={createdTeamCode}
          qrDataUrl={qrDataUrl}
          initialTeamName={participantName ? `${participantName}'s Squad` : ""}
          onSaveAndContinue={handleCreateTeamContinue}
          onBack={() => setStep("team-type")}
          isLoading={isLoading}
        />
      )}

      {step === "join-team" && (
        <JoinTeamTerminal
          participantName={participantName}
          initialCode={paramCode}
          onValidateCode={handleValidateCode}
          onJoinTeam={handleJoinTeam}
          onContinueToDashboard={handleContinueToDashboard}
          onBack={() => setStep("team-type")}
        />
      )}
    </div>
  );
}
