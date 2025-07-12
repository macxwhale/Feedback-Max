
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface UpgradePromptProps {
  lockedFeature: string;
  onClose: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ lockedFeature, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <Card className="max-w-sm w-full border-2 border-blue-400">
      <CardContent className="p-6 text-center flex flex-col items-center">
        <Star className="w-10 h-10 text-yellow-400 mb-2" />
        <Badge className="mb-2 bg-blue-100 text-blue-800">Upgrade Required</Badge>
        <p className="mb-4 text-lg font-semibold">
          {lockedFeature} is only available on a higher plan.
        </p>
        <Button asChild className="w-full mb-2">
          <a href="/pricing" target="_blank" rel="noopener noreferrer">
            See Plans &amp; Upgrade
          </a>
        </Button>
        <Button onClick={onClose} variant="ghost" className="w-full">
          Close
        </Button>
      </CardContent>
    </Card>
  </div>
);
