import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type UptimePercentageProps = {
  percentage: number;
};

export default function UptimePercentage({
  percentage,
}: UptimePercentageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uptime Percentage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-2">{percentage.toFixed(2)}%</div>
        <Progress value={percentage} className="w-full" />
      </CardContent>
    </Card>
  );
}
