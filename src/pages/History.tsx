import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";

const History = () => {
  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-accent" />
        <h1 className="text-2xl font-bold">File History</h1>
        <span className="text-sm text-muted-foreground">Previous processing runs</span>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-smith-surface">
            <FileSpreadsheet className="h-6 w-6 text-accent" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Saved history is not available yet</h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              ImportSmith processes files in your browser and does not upload or retain supplier data. Download both exports before leaving the dashboard.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard">Start a new import</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
