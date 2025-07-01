import React, { useState } from "react";
import { useAppContext } from "@/context/app-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ApiKeyInput from "@/components/api-key-input";

export default function Profile() {
  const { userDetails, setUserDetails, apiKey, setApiKey } = useAppContext();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(userDetails || {});
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userDetails) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No personal details found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.name || !form.email) {
      setError("Name and Email are required.");
      return;
    }
    setUserDetails(form);
    setEditMode(false);
    setError(null);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                disabled={!editMode}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                disabled={!editMode}
                required
              />
            </div>
            {/* Add more fields as needed */}
            {editMode ? (
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => { setEditMode(false); setForm(userDetails); setError(null); }}>Cancel</Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setEditMode(true)}>Edit</Button>
            )}
          </form>
          <div>
            <Label className="mb-2 block">API Key</Label>
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[180px] text-muted-foreground">{apiKey ? `••••••${apiKey.slice(-4)}` : "Not set"}</span>
              <Button size="sm" variant="outline" onClick={() => setShowApiKeyInput(v => !v)}>
                Change Key
              </Button>
            </div>
            {showApiKeyInput && (
              <div className="mt-2">
                <ApiKeyInput onSave={() => setShowApiKeyInput(false)} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 