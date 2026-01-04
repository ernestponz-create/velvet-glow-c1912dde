interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i < currentStep
              ? "w-10 bg-primary"
              : i === currentStep
              ? "w-10 bg-primary/50"
              : "w-6 bg-muted"
          }`}
        />
      ))}
    </div>
  );
};

export default OnboardingProgress;
