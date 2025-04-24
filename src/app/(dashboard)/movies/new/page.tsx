'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Film,
  Upload,
  TextSelect,
  Image as ImageIcon,
  Plus,
  X,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  Trash,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import ScriptAnalyzer from '@/components/movies/ScriptAnalyzer';

const categoryOptions = [
  { value: 'action', label: 'Action' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'horror', label: 'Horror' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'western', label: 'Western' },
];

const ageRatingOptions = [
  { value: 'g', label: 'G - General Audiences' },
  { value: 'pg', label: 'PG - Parental Guidance Suggested' },
  { value: 'pg13', label: 'PG-13 - Parents Strongly Cautioned' },
  { value: 'r', label: 'R - Restricted' },
  { value: 'nc17', label: 'NC-17 - Adults Only' },
];

// Empty episode template
const emptyEpisode = {
  title: '',
  description: '',
  thumbnail: null,
  duration: '',
  order: 0,
  isGenerating: false,
};

export default function CreateMoviePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [movieData, setMovieData] = useState({
    title: '',
    description: '',
    poster: null,
    categories: [],
    ageRating: '',
    releaseDate: '',
    isAIGenerated: false,
    script: '',
    status: 'draft',
  });
  const [episodes, setEpisodes] = useState([]);
  const [scriptAnalysisMode, setScriptAnalysisMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1);

  // Handle form field changes
  const handleChange = (field, value) => {
    setMovieData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    if (movieData.categories.includes(category)) {
      handleChange(
        'categories',
        movieData.categories.filter((c) => c !== category),
      );
    } else {
      if (movieData.categories.length < 3) {
        handleChange('categories', [...movieData.categories, category]);
      } else {
        toast.error('You can select up to 3 categories');
      }
    }
  };

  // Handle poster upload
  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // For demo purposes, we're using a URL.createObjectURL
    // In a real app, you would upload to a server/CDN
    const objectUrl = URL.createObjectURL(file);
    handleChange('poster', { file, preview: objectUrl });
  };

  // Helper function to create episodes from Gemini response
  const createEpisodesFromAI = (generatedEpisodes) => {
    const newEpisodes = generatedEpisodes.map((ep, index) => ({
      ...emptyEpisode,
      title: ep.title || `Episode ${index + 1}`,
      description: ep.description || '',
      order: index,
      duration: ep.duration || '30:00',
    }));

    setEpisodes(newEpisodes);
    setActiveTab('episodes');
    toast.success(`${newEpisodes.length} episodes generated`);
  };

  // Add empty episode manually
  const addEmptyEpisode = () => {
    setEpisodes((prev) => [
      ...prev,
      {
        ...emptyEpisode,
        order: episodes.length,
        title: `Episode ${episodes.length + 1}`,
      },
    ]);
  };

  // Update specific episode
  const updateEpisode = (index, field, value) => {
    setEpisodes((prev) => prev.map((ep, i) => (i === index ? { ...ep, [field]: value } : ep)));
  };

  // Delete episode
  const deleteEpisode = (index) => {
    setEpisodes((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // Update order for remaining episodes
      return filtered.map((ep, i) => ({ ...ep, order: i }));
    });
  };

  // Move episode up/down
  const moveEpisode = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === episodes.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    setEpisodes((prev) => {
      const newEpisodes = [...prev];
      const temp = { ...newEpisodes[index] };
      newEpisodes[index] = { ...newEpisodes[newIndex], order: index };
      newEpisodes[newIndex] = { ...temp, order: newIndex };
      return newEpisodes;
    });
  };

  // Regenerate specific episode using AI
  const regenerateEpisode = async (index) => {
    // This would call your Gemini API
    updateEpisode(index, 'isGenerating', true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock response
      const regeneratedEpisode = {
        title: `Regenerated Episode ${index + 1}`,
        description:
          'This is a newly generated description for this episode with more details and creative content.',
        duration: '35:00',
      };

      // Update episode with new content
      updateEpisode(index, 'title', regeneratedEpisode.title);
      updateEpisode(index, 'description', regeneratedEpisode.description);
      updateEpisode(index, 'duration', regeneratedEpisode.duration);

      toast.success('Episode regenerated successfully');
    } catch (error) {
      console.error('Error regenerating episode:', error);
      toast.error('Failed to regenerate episode');
    } finally {
      updateEpisode(index, 'isGenerating', false);
    }
  };

  // Handle switching to AI script analysis mode
  const startScriptAnalysis = () => {
    if (!movieData.title) {
      toast.error('Please enter a movie title first');
      return;
    }

    setScriptAnalysisMode(true);
    setStep(1);
  };

  // Handle AI script analysis
  const handleScriptAnalysis = async (scriptText) => {
    setIsAnalyzing(true);
    handleChange('script', scriptText);
    handleChange('isAIGenerated', true);

    try {
      // This would be your actual Gemini API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mock response from Gemini
      const mockEpisodes = [
        {
          title: 'The Beginning',
          description:
            'Our protagonist discovers a hidden talent that will change their life forever, setting them on a journey of self-discovery.',
          duration: '28:00',
        },
        {
          title: 'New Horizons',
          description:
            'Venturing into unknown territory, new allies and enemies are encountered as the stakes begin to rise.',
          duration: '32:00',
        },
        {
          title: 'The Challenge',
          description:
            'A formidable obstacle threatens to end the journey before it truly begins, testing resolve and ingenuity.',
          duration: '35:00',
        },
        {
          title: 'Unexpected Allies',
          description:
            'Help comes from an unexpected source, changing perspectives and revealing hidden truths about the world.',
          duration: '30:00',
        },
        {
          title: 'The Revelation',
          description:
            'A shocking discovery forces our hero to reconsider everything they thought they knew about their mission and themselves.',
          duration: '40:00',
        },
        {
          title: 'Turning Point',
          description:
            'Faced with a critical decision, the choice made will determine the fate of many, with no easy answers in sight.',
          duration: '33:00',
        },
        {
          title: 'Darkest Hour',
          description:
            'All seems lost as enemies close in and trusted allies fall. Hope dwindles in the face of overwhelming odds.',
          duration: '38:00',
        },
        {
          title: 'The Final Stand',
          description:
            'Drawing on inner strength and the lessons learned along the way, our hero makes one last desperate attempt to succeed.',
          duration: '45:00',
        },
      ];

      createEpisodesFromAI(mockEpisodes);
      setScriptAnalysisMode(false);
    } catch (error) {
      console.error('Error analyzing script:', error);
      toast.error('Failed to analyze script');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Discard changes and go back
  const handleDiscard = () => {
    router.push('/movies');
  };

  // Save movie
  const handleSave = async (status = 'draft') => {
    // Validate required fields
    if (!movieData.title) {
      toast.error('Please enter a movie title');
      setActiveTab('details');
      return;
    }

    if (episodes.length === 0) {
      toast.error('Please add at least one episode');
      setActiveTab('episodes');
      return;
    }

    setIsSaving(true);

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set the status based on the button clicked
      handleChange('status', status);

      toast.success(`Movie ${status === 'published' ? 'published' : 'saved'}`);
      router.push('/movies');
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error('Failed to save movie');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDiscardDialogOpen(true)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Movie</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={isSaving} onClick={() => handleSave('draft')}>
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button disabled={isSaving} onClick={() => handleSave('published')}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {scriptAnalysisMode ? (
        /* Script Analysis Mode */
        <ScriptAnalyzer
          movieTitle={movieData.title}
          onAnalyze={handleScriptAnalysis}
          onCancel={() => setScriptAnalysisMode(false)}
          isAnalyzing={isAnalyzing}
          step={step}
          setStep={setStep}
        />
      ) : (
        /* Normal Movie Creation Mode */
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Movie Details</TabsTrigger>
              <TabsTrigger value="episodes">
                Episodes {episodes.length > 0 && `(${episodes.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Movie Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column - Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter the main details for your movie</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Movie Title *</Label>
                      <Input
                        id="title"
                        value={movieData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter movie title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={movieData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Enter movie description"
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categories">Categories (select up to 3)</Label>
                      <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((category) => (
                          <Badge
                            key={category.value}
                            variant={
                              movieData.categories.includes(category.value) ? 'default' : 'outline'
                            }
                            className="cursor-pointer"
                            onClick={() => handleCategoryChange(category.value)}
                          >
                            {category.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ageRating">Age Rating</Label>
                        <Select
                          value={movieData.ageRating}
                          onValueChange={(value) => handleChange('ageRating', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            {ageRatingOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="releaseDate">Release Date</Label>
                        <Input
                          id="releaseDate"
                          type="date"
                          value={movieData.releaseDate}
                          onChange={(e) => handleChange('releaseDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column - Poster & AI */}
                <div className="space-y-6">
                  {/* Poster Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Movie Poster</CardTitle>
                      <CardDescription>Upload a poster image for your movie</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative aspect-[2/3] w-full max-w-[200px] overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/25">
                          {movieData.poster ? (
                            <>
                              <img
                                src={movieData.poster.preview}
                                alt="Movie poster"
                                className="h-full w-full object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6"
                                onClick={() => handleChange('poster', null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Recommended size: 600x900px
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-center">
                          <Label
                            htmlFor="poster-upload"
                            className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            {movieData.poster ? 'Change Poster' : 'Upload Poster'}
                            <Input
                              id="poster-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handlePosterUpload}
                            />
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Script Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Episode Generation</CardTitle>
                      <CardDescription>
                        Use Gemini AI to automatically generate episodes from a script
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="rounded-full bg-primary/20 p-3">
                          <Bot className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Automatic Episode Creation</h3>
                          <p className="text-sm text-muted-foreground">
                            Paste your script or screenplay, and let Gemini analyze and generate
                            episodes
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="gap-2 w-full"
                          onClick={startScriptAnalysis}
                        >
                          <Wand2 className="h-4 w-4" />
                          Start AI Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Episodes Tab */}
            <TabsContent value="episodes" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Episodes</CardTitle>
                      <CardDescription>
                        {episodes.length > 0
                          ? `${episodes.length} episodes - Manage the episodes for this movie`
                          : 'Add episodes to your movie'}
                      </CardDescription>
                    </div>
                    <Button onClick={addEmptyEpisode}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Episode
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {episodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                      <Film className="mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No Episodes Yet</h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Get started by manually adding episodes or using AI to generate them from a
                        script
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center">
                        <Button onClick={addEmptyEpisode}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Manually
                        </Button>
                        <Button variant="outline" onClick={startScriptAnalysis}>
                          <Bot className="mr-2 h-4 w-4" />
                          Generate with AI
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[600px]">
                      <div className="space-y-6">
                        {episodes.map((episode, index) => (
                          <div
                            key={index}
                            className="group rounded-md border p-4 transition-colors hover:bg-accent/50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                  {index + 1}
                                </div>
                                <h3 className="font-medium">
                                  {episode.title || `Episode ${index + 1}`}
                                </h3>
                                {episode.isGenerating && (
                                  <Badge variant="outline" className="bg-amber-500/20">
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    Generating...
                                  </Badge>
                                )}
                                {movieData.isAIGenerated && !episode.isGenerating && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    <Bot className="mr-1 h-3 w-3" />
                                    AI Generated
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveEpisode(index, 'up')}
                                  disabled={index === 0}
                                  className="h-8 w-8"
                                >
                                  <ArrowLeft className="h-4 w-4 rotate-90" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveEpisode(index, 'down')}
                                  disabled={index === episodes.length - 1}
                                  className="h-8 w-8"
                                >
                                  <ArrowLeft className="h-4 w-4 -rotate-90" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteEpisode(index)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`episode-${index}-title`}>Episode Title</Label>
                                <Input
                                  id={`episode-${index}-title`}
                                  value={episode.title}
                                  onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                                  placeholder={`Episode ${index + 1}`}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`episode-${index}-duration`}>Duration</Label>
                                <Input
                                  id={`episode-${index}-duration`}
                                  value={episode.duration}
                                  onChange={(e) => updateEpisode(index, 'duration', e.target.value)}
                                  placeholder="HH:MM:SS"
                                />
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              <Label htmlFor={`episode-${index}-description`}>Description</Label>
                              <Textarea
                                id={`episode-${index}-description`}
                                value={episode.description}
                                onChange={(e) =>
                                  updateEpisode(index, 'description', e.target.value)
                                }
                                placeholder="Enter episode description"
                                className="min-h-[100px]"
                              />
                            </div>

                            <div className="mt-4 flex justify-between items-center">
                              <div className="flex-1">
                                <Label
                                  htmlFor={`episode-${index}-thumbnail`}
                                  className="mb-2 block text-sm"
                                >
                                  Thumbnail Image (optional)
                                </Label>
                                <div className="flex items-center gap-2">
                                  {episode.thumbnail ? (
                                    <div className="relative h-12 w-20 overflow-hidden rounded-md">
                                      <img
                                        src={episode.thumbnail.preview}
                                        alt={`Thumbnail for ${episode.title}`}
                                        className="h-full w-full object-cover"
                                      />
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute right-1 top-1 h-5 w-5"
                                        onClick={() => updateEpisode(index, 'thumbnail', null)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex h-12 w-20 items-center justify-center rounded-md border border-dashed">
                                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <Label
                                    htmlFor={`thumbnail-upload-${index}`}
                                    className="cursor-pointer rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                                  >
                                    {episode.thumbnail ? 'Change' : 'Upload'}
                                    <Input
                                      id={`thumbnail-upload-${index}`}
                                      type="file"
                                      accept="image/*"
                                      className="sr-only"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (!file.type.includes('image/')) {
                                          toast.error('Please upload an image file');
                                          return;
                                        }
                                        updateEpisode(index, 'thumbnail', {
                                          file,
                                          preview: URL.createObjectURL(file),
                                        });
                                      }}
                                    />
                                  </Label>
                                </div>
                              </div>

                              {movieData.isAIGenerated && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  disabled={episode.isGenerating}
                                  onClick={() => regenerateEpisode(index)}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Regenerate
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
                {episodes.length > 0 && (
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">{episodes.length} episodes</p>
                    <Button onClick={addEmptyEpisode}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Episode
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Discard Changes Dialog */}
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard your changes? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDiscard}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
