import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";

interface PrivacyNoticeProps {
  onClose: () => void;
}

export default function PrivacyNotice({ onClose }: PrivacyNoticeProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="text-[hsl(var(--primary))] mt-1 h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                Privacy & Safety
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Your conversations are private and not stored permanently. If you're in crisis, please contact emergency services immediately.
              </p>
              <div className="flex justify-between items-center">
                <Button
                  onClick={onClose}
                  variant="link"
                  className="text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 font-medium p-0 h-auto"
                >
                  Got it
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 h-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
