"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CheckInChecklist, { type CheckInData, type StudentType } from "@/components/onboarding/CheckInChecklist";
import TeamTypeSelector, { type TeamChoice } from "@/components/onboarding/TeamTypeSelector";
import CreateTeamDossier from "@/components/onboarding/CreateTeamDossier";
import JoinTeamTerminal from "@/components/onboarding/JoinTeamTerminal";
import {
  saveCheckInAction,
  prepareTeamCodeAction,
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
    initialParticipant?.team?.code ?? ""
  );
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(
    initialParticipant?.teamId ?? null
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);


  // STEP 1: Save Check-In data
  const handleCheckInSubmit = async (data: CheckInData) => {
    setIsLoading(true);
    setCheckInError(null);
    try {
      const res = await saveCheckInAction(data);
      if (!res.success) {
        setCheckInError(res.error || "Could not save your details. Please try again.");
        return;
      }
      setParticipantName(data.name);
      setStep("team-type");
    } catch (err) {
      console.error("Check-in error:", err);
      setCheckInError("Could not save your details. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Handle Team Choice
  const handleTeamTypeSelect = async (choice: TeamChoice) => {
    if (choice === "create") {
      setIsLoading(true);
      try {
        // Generate unique code & QR code WITHOUT saving to MongoDB yet
        const res = await prepareTeamCodeAction();
        if (res.success) {
          setCreatedTeamCode(res.teamCode);
          if (res.qrDataUrl) setQrDataUrl(res.qrDataUrl);
        }
      } catch (err) {
        console.error("Failed to prepare team code:", err);
      } finally {
        setIsLoading(false);
        setStep("create-team");
      }
    } else {
      setStep("join-team");
    }
  };

  // STEP 3A: Create Team Save and Continue
  // The team is ONLY created and saved in MongoDB when the user clicks Save and Continue!
  const handleCreateTeamContinue = async (teamName: string) => {
    setIsLoading(true);
    try {
      const res = await createTeamAction(teamName, createdTeamCode);
      if (res && !res.success) {
        setIsLoading(false);
        return { success: false, error: res.error || "Failed to create team. Please try another name." };
      }
      router.push("/dashboard");
      return { success: true };
    } catch (err: any) {
      console.error("Failed to finalize team:", err);
      setIsLoading(false);
      return { success: false, error: err?.message || "Failed to save team. Please try again." };
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
            phone: initialParticipant?.phone ?? "",
            year: initialParticipant?.year,
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
          submitError={checkInError}
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
          initialTeamName=""
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
