
import { useOrganization } from "@/context/OrganizationContext";

export const useFeatureGate = () => {
  const { organization } = useOrganization();

  // Simplified feature gate - all features are available
  function hasFeature(feature: string): boolean {
    return true;
  }

  function allowedQuestionTypes(): string[] {
    return ["star", "nps", "likert", "single-choice", "multi-choice", "text"];
  }

  function responseLimit(): number | null {
    return organization?.max_responses || null;
  }

  function hasModuleAccess(module: string): boolean {
    return true;
  }

  return {
    hasFeature,
    allowedQuestionTypes,
    responseLimit,
    plan: organization?.plan_type || 'enterprise',
    hasModuleAccess,
  };
};
