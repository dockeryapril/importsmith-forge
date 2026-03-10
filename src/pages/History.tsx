import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Clock } from "lucide-react";
import { MOCK_RUNS } from "@/data/mock";

const History = () => {
  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-accent" />
        <h1 className="text-2xl font-bold">File History</h1>
        <span className="text-sm text-muted-foreground">Previous processing runs</span>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_RUNS.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-mono text-xs max-w-[220px] truncate">{run.fileName}</TableCell>
                  <TableCell className="font-medium">{run.supplier}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {run.categories.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{run.productsFound}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{run.exportFormat}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{run.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
