import React, { useState } from "react";
import { useAppContext } from "@/context/app-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Key, Settings, Trash2 } from "lucide-react";
import { UserDetails } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ApiKeyInput from "@/components/api-key-input";

const AI_PROVIDERS = {
  gemini: { name: 'Google Gemini', color: 'bg-gradient-to-r from-blue-500 to-purple-600' },
  openai: { name: 'OpenAI', color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  deepseek: { name: 'DeepSeek', color: 'bg-gradient-to-r from-orange-500 to-red-600' }
};

export default function Profile() {
  const { userDetails, setUserDetails, selectedProvider, apiKey, clearApiKey } = useAppContext();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<UserDetails>(userDetails || { name: '', age: 0, occupation: '' });
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

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

  const currentProvider = AI_PROVIDERS[selectedProvider as keyof typeof AI_PROVIDERS];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'age' ? parseInt(value) || 0 : value 
    });
  };

  const handleSave = () => {
    if (!form.name || !form.occupation) {
      setError("Name and Occupation are required.");
      return;
    }
    setUserDetails(form);
    setEditMode(false);
    setError(null);
  };

  const handleApiKeyValidated = () => {
    setIsApiKeyDialogOpen(false);
  };

  const handleDeleteApiKey = () => {
    clearApiKey();
  };

  return (
    <div className="container mx-auto p-4 py-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
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
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={form.age || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={form.occupation || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
              </div>
              {editMode ? (
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => { setEditMode(false); setForm(userDetails); setError(null); }}>Cancel</Button>
                </div>
              ) : (
                <Button type="button" onClick={() => setEditMode(true)}>Edit</Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* AI Provider Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Provider Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Current Provider</label>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${currentProvider?.color}`}></div>
                <p className="text-lg font-semibold">{currentProvider?.name}</p>
                <Badge variant="secondary" className="ml-2">
                  {apiKey ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {apiKey ? "Change API Key" : "Add API Key"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {apiKey ? "Change API Key" : "Add API Key"}
                    </DialogTitle>
                  </DialogHeader>
                  <ApiKeyInput onValidated={handleApiKeyValidated} />
                </DialogContent>
              </Dialog>
              
              {apiKey && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete your API key? This action cannot be undone and you'll need to add a new API key to use AI features.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteApiKey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete API Key
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            {apiKey && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  API key is securely stored and will be used for AI-powered features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 