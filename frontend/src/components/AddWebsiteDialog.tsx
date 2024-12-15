"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type AddWebsiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (url: string, interval: string) => void;
};

export default function AddWebsiteDialog({
  open,
  onOpenChange,
  onAdd,
}: AddWebsiteDialogProps) {
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState("THIRTY");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(url, interval);
    setUrl("");
    setInterval("THIRTY");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Website to Monitor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interval">Interval</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEN">10 Seconds</SelectItem>
                <SelectItem value="THIRTY">30 Seconds</SelectItem>
                <SelectItem value="SIXTY">60 Seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Add Website</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
