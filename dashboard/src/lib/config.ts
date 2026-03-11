// Optalis Mode Configuration
// Set NEXT_PUBLIC_OPTALIS_MODE=basic to hide AI features
// Set NEXT_PUBLIC_OPTALIS_MODE=full (or leave unset) for all features

export const OPTALIS_MODE = process.env.NEXT_PUBLIC_OPTALIS_MODE || 'full';
export const isBasicMode = OPTALIS_MODE === 'basic';
export const isFullMode = OPTALIS_MODE === 'full' || !isBasicMode;

// Feature flags based on mode
export const features = {
  aiSummary: isFullMode,
  aiExtraction: isFullMode,
  confidenceScores: isFullMode,
  suggestedDecision: isFullMode,
  emailIntake: isFullMode,
  crmAutoSync: isFullMode,
  // Always available
  copyButtons: true,
  manualEntry: true,
  bedManagement: true,
};
