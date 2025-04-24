'use client';

import { useState } from 'react';
import {
  Bot,
  ArrowRight,
  Wand2,
  X,
  Loader2,
  Upload,
  File,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ScriptAnalyzer({
  movieTitle,
  onAnalyze,
  onCancel,
  isAnalyzing,
  step,
  setStep,
}) {
  const [script, setScript] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [episodeCount, setEpisodeCount] = useState(8);
  const [episodeFormat, setEpisodeFormat] = useState({
    includeTitle: true,
    includeDescription: true,
    includeDuration: true,
  });

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a text, PDF, or Word document');
      return;
    }

    // In a real app, you would parse the file contents
    // Here we'll just use the file name and simulate content
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Simulate reading the file
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For demo, let's set a sample script based on uploaded file
    setScript(`SAMPLE SCRIPT (${file.name})

FADE IN:

EXT. CITY STREET - NIGHT
Rain pours down on the dimly lit street. A FIGURE in a trench coat walks purposefully.

NARRATOR (V.O.)
The city has a thousand stories. This is just one of them.

The figure stops, looks up at a neon sign: "MIDNIGHT LOUNGE"

INT. MIDNIGHT LOUNGE - NIGHT
The lounge is smoky, half-empty. JAZZ MUSIC plays softly. The Figure enters, removes hat to reveal DETECTIVE MORGAN (40s).

BARTENDER
The usual?

DETECTIVE MORGAN
(nodding)
Been a long night. And it's about to get longer.

A mysterious WOMAN in red enters. All eyes turn to her.

DETECTIVE MORGAN (V.O.)
And that's when I knew trouble had just walked in...

...`);

    toast.success('File uploaded successfully');
    setIsReady(true);
  };

  // Handle script text change
  const handleScriptChange = (e) => {
    setScript(e.target.value);
    setIsReady(e.target.value.length > 100); // Simple validation
  };

  // Handle analysis
  const handleAnalysis = () => {
    if (!isReady) return;

    // In a real app, you would send this to your Gemini API endpoint
    setStep(2);

    // Simulate processing progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProcessingProgress(progress);

      // Update status messages based on progress
      if (progress === 20) {
        setProcessingStatus('Analyzing script content...');
      } else if (progress === 40) {
        setProcessingStatus('Identifying narrative structure...');
      } else if (progress === 60) {
        setProcessingStatus('Generating episode breakdowns...');
      } else if (progress === 80) {
        setProcessingStatus('Finalizing episode details...');
      }

      if (progress >= 100) {
        clearInterval(interval);
        setProcessingStatus('Analysis complete!');
        setStep(3);
      }
    }, 200);
  };

  // Handle final submit
  const handleSubmit = () => {
    onAnalyze(script);
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Step 1: Input Script</h2>
              <Badge variant="outline" className="text-xs">
                Movie: {movieTitle || 'Untitled'}
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Script Text Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Enter Script Text</CardTitle>
                  <CardDescription>
                    Paste your screenplay, script, or detailed story outline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste your script here..."
                    className="min-h-[300px]"
                    value={script}
                    onChange={handleScriptChange}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    {script ? `${script.length} characters` : 'No text entered'}
                  </p>
                  {script && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setScript('')}
                      className="gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Or Upload File */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Script File</CardTitle>
                  <CardDescription>Upload a text, PDF, or Word document</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-muted p-3">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(uploadedFile.size / 1024)} KB
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setScript('');
                          setIsReady(false);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-muted p-6">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Drop your file here or click to browse</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Supports TXT, PDF, and DOC files
                        </p>
                      </div>
                      <Label
                        htmlFor="script-upload"
                        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Upload File
                        <Input
                          id="script-upload"
                          type="file"
                          accept=".txt,.pdf,.doc,.docx"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Episode Generation Options</CardTitle>
                <CardDescription>Customize how Gemini will analyze your script</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="episode-count">Number of Episodes</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="episode-count"
                        type="number"
                        min="1"
                        max="20"
                        value={episodeCount}
                        onChange={(e) =>
                          setEpisodeCount(Math.max(1, Math.min(20, Number(e.target.value))))
                        }
                      />
                      <span className="text-sm text-muted-foreground">episodes</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 5-12 episodes for most stories
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Episode Details to Include</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="include-title"
                          checked={episodeFormat.includeTitle}
                          onChange={() =>
                            setEpisodeFormat({
                              ...episodeFormat,
                              includeTitle: !episodeFormat.includeTitle,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="include-title" className="text-sm">
                          Generate titles for each episode
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="include-description"
                          checked={episodeFormat.includeDescription}
                          onChange={() =>
                            setEpisodeFormat({
                              ...episodeFormat,
                              includeDescription: !episodeFormat.includeDescription,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="include-description" className="text-sm">
                          Generate descriptions for each episode
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="include-duration"
                          checked={episodeFormat.includeDuration}
                          onChange={() =>
                            setEpisodeFormat({
                              ...episodeFormat,
                              includeDuration: !episodeFormat.includeDuration,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="include-duration" className="text-sm">
                          Suggest duration for each episode
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Bot className="h-4 w-4" />
              <AlertTitle>AI-powered analysis</AlertTitle>
              <AlertDescription>
                Gemini will analyze your script and suggest a logical episode structure based on
                narrative flow and content. You'll be able to review and edit all suggestions before
                finalizing.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Step 2: Processing with Gemini</h2>

            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-6 py-8 text-center">
                  <div className="rounded-full bg-primary/20 p-4">
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Analyzing Your Script</h3>
                    <p className="text-muted-foreground mb-6">
                      Gemini AI is working on breaking down your script into {episodeCount} episodes
                    </p>

                    <div className="max-w-md mx-auto space-y-4">
                      <Progress value={processingProgress} className="h-2" />
                      <p className="text-sm font-medium">{processingStatus || 'Initializing...'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" disabled={true} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button variant="ghost" disabled={true} className="gap-1">
                Cancel
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Step 3: Analysis Complete</h2>

            <Card className="border-green-600/30">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-6 py-6 text-center">
                  <div className="rounded-full bg-green-600/20 p-4">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Script Analysis Successful</h3>
                    <p className="text-muted-foreground mb-4">
                      Gemini has analyzed your script and prepared {episodeCount} episodes
                    </p>

                    <div className="flex gap-4 justify-center">
                      <div className="bg-muted rounded-md px-4 py-2 text-center">
                        <p className="text-2xl font-bold">{episodeCount}</p>
                        <p className="text-xs text-muted-foreground">Episodes</p>
                      </div>
                      <div className="bg-muted rounded-md px-4 py-2 text-center">
                        <p className="text-2xl font-bold">{Math.round(script.length / 100)}</p>
                        <p className="text-xs text-muted-foreground">Script Pages</p>
                      </div>
                      <div className="bg-muted rounded-md px-4 py-2 text-center">
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-500">Ready to generate episodes</AlertTitle>
                  <AlertDescription>
                    Click 'Generate Episodes' to create detailed episode content based on this
                    analysis. You can edit the results afterwards.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end w-full">
                  <Button onClick={handleSubmit} className="gap-2">
                    <Bot className="h-4 w-4" />
                    Generate Episodes
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button variant="ghost" onClick={onCancel} className="gap-1">
                Cancel
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full text-xs flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            1
          </div>
          <div className={`h-1 flex-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div
            className={`h-8 w-8 rounded-full text-xs flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            2
          </div>
          <div className={`h-1 flex-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div
            className={`h-8 w-8 rounded-full text-xs flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            3
          </div>
        </div>
      </div>

      {/* Main content */}
      <div>{renderStepContent()}</div>

      {/* Navigation buttons */}
      {step === 1 && (
        <div className="flex justify-between">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleAnalysis} disabled={!isReady} className="gap-2">
            <Wand2 className="h-4 w-4" />
            Analyze Script
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
