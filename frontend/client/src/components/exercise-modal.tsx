import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import type { Exercise } from "@shared/schema";

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(exercise.duration * 60); // Convert to seconds
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted && !isPaused && !isCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isStarted, isPaused, isCompleted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsStarted(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsStarted(false);
    setIsPaused(false);
    setCurrentStep(0);
    setTimeRemaining(exercise.duration * 60);
    setIsCompleted(false);
  };

  const progress = ((exercise.duration * 60 - timeRemaining) / (exercise.duration * 60)) * 100;

  const renderExerciseContent = () => {
    const instructions = exercise.instructions as any;

    switch (exercise.type) {
      case 'breathing':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full bg-white/30 flex items-center justify-center ${isStarted && !isPaused ? 'animate-pulse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-white/50"></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Focus on your breathing and follow the rhythm
              </p>
            </div>
            
            <Card className="p-4">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {instructions.steps?.map((step: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                )) || []}
              </ol>
            </Card>
          </div>
        );

      case 'journaling':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center">
                <i className="fas fa-pen text-white text-lg"></i>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take time to reflect and write down your thoughts
              </p>
            </div>
            
            <Card className="p-4">
              <h4 className="font-medium mb-2">Prompts to consider:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {instructions.prompts?.map((prompt: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-[hsl(var(--primary))]">•</span>
                    <span>{prompt}</span>
                  </li>
                )) || []}
              </ul>
            </Card>
          </div>
        );

      case 'grounding':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[hsl(var(--success))] to-[hsl(var(--accent))] flex items-center justify-center">
                <i className="fas fa-leaf text-white text-lg"></i>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ground yourself in the present moment using your senses
              </p>
            </div>
            
            <Card className="p-4">
              <h4 className="font-medium mb-2">5-4-3-2-1 Technique:</h4>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {instructions.steps?.map((step: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--success))] text-white text-xs flex items-center justify-center">
                      {5 - index}
                    </span>
                    <span>{step}</span>
                  </li>
                )) || []}
              </ol>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{exercise.title}</span>
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer and Progress */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-mono font-bold text-[hsl(var(--primary))]">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {exercise.duration} minute exercise
            </p>
          </div>

          {/* Exercise Content */}
          {renderExerciseContent()}

          {/* Controls */}
          <div className="flex justify-center space-x-2">
            {!isStarted ? (
              <Button onClick={handleStart} className="px-6">
                <Play className="h-4 w-4 mr-2" />
                Start Exercise
              </Button>
            ) : (
              <>
                <Button onClick={handlePause} variant="outline">
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {isCompleted && (
            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                  Exercise Complete!
                </h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Great job taking time for your mental health. How do you feel?
                </p>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
