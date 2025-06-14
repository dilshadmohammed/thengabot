import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ExerciseModal from "./exercise-modal";
import { 
  Dumbbell, 
  TrendingUp, 
  Heart, 
  Phone, 
  UserPlus, 
  Book,
  Smile,
  Frown,
  Meh,
  Activity
} from "lucide-react";
import type { Exercise } from "@shared/schema";

interface SidebarProps {
  sessionId: number | null;
}

const moodEmojis = [
  { value: 1, emoji: "😢", color: "bg-red-100 hover:bg-red-200 text-red-600", title: "Very Bad" },
  { value: 2, emoji: "😕", color: "bg-orange-100 hover:bg-orange-200 text-orange-600", title: "Bad" },
  { value: 3, emoji: "😐", color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-600", title: "Okay" },
  { value: 4, emoji: "🙂", color: "bg-green-100 hover:bg-green-200 text-green-600", title: "Good" },
  { value: 5, emoji: "😊", color: "bg-blue-100 hover:bg-blue-200 text-blue-600", title: "Great" }
];

export default function Sidebar({ sessionId }: SidebarProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['/api/exercises'],
  });

  const moodMutation = useMutation({
    mutationFn: async (mood: number) => {
      if (!sessionId) throw new Error("No session ID");
      
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, mood }),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to save mood');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood Saved",
        description: "Thank you for sharing how you're feeling.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mood', sessionId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save mood. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    if (sessionId) {
      moodMutation.mutate(mood);
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const getExerciseGradient = (type: string) => {
    switch (type) {
      case 'breathing':
        return 'exercise-breathing';
      case 'journaling':
        return 'exercise-journaling';
      case 'grounding':
        return 'exercise-grounding';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'breathing':
        return <Activity className="text-[hsl(var(--secondary))] h-5 w-5" />;
      case 'journaling':
        return <Book className="text-[hsl(var(--primary))] h-5 w-5" />;
      case 'grounding':
        return <Heart className="text-[hsl(var(--success))] h-5 w-5" />;
      default:
        return <Dumbbell className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Dumbbell className="text-[hsl(var(--secondary))] mr-2 h-4 w-4" />
            Quick Exercises
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exercisesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 animate-pulse h-16" />
              ))}
            </div>
          ) : (
            exercises?.map((exercise: Exercise) => (
              <div
                key={exercise.id}
                className={`${getExerciseGradient(exercise.type)} rounded-lg p-3 cursor-pointer transition-all`}
                onClick={() => handleExerciseClick(exercise)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {getExerciseIcon(exercise.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                      {exercise.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {exercise.duration} minutes
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Mood Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <TrendingUp className="text-[hsl(var(--accent))] mr-2 h-4 w-4" />
            Mood Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            How are you feeling right now?
          </p>
          <div className="flex justify-between items-center">
            {moodEmojis.map((mood) => (
              <Button
                key={mood.value}
                variant="ghost"
                size="sm"
                className={`w-8 h-8 rounded-full p-0 ${mood.color} ${
                  selectedMood === mood.value ? 'ring-2 ring-[hsl(var(--primary))]' : ''
                }`}
                title={mood.title}
                onClick={() => handleMoodSelect(mood.value)}
                disabled={moodMutation.isPending}
              >
                <span className="text-lg">{mood.emoji}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Heart className="text-red-400 mr-2 h-4 w-4" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="tel:988"
            className="block p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Phone className="text-red-500 h-4 w-4" />
              <div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                  Crisis Hotline
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  24/7 Support
                </p>
              </div>
            </div>
          </a>

          <a
            href="https://www.psychologytoday.com/us/therapists"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <UserPlus className="text-blue-500 h-4 w-4" />
              <div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                  Find a Therapist
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Professional Help
                </p>
              </div>
            </div>
          </a>

          <a
            href="https://www.nami.org/help"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Book className="text-green-500 h-4 w-4" />
              <div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                  Self-Help Guide
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Learn More
                </p>
              </div>
            </div>
          </a>
        </CardContent>
      </Card>

      {/* Exercise Modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
