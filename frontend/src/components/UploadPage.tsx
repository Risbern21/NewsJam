import { useState } from 'react';
import { motion } from 'motion/react';
import { Link2, FileText, Image, Loader2, Upload as UploadIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface UploadPageProps {
  onUpload: (type: 'url' | 'text' | 'image' | 'audio', content: string, title: string, imageUrl?: string) => Promise<void>;
}

export function UploadPage({ onUpload }: UploadPageProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'image'>('url');
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    let content = '';
    let imageUrl = '';
    
    if (activeTab === 'url' && urlInput.trim()) {
      content = urlInput;
    } else if (activeTab === 'text' && textInput.trim()) {
      content = textInput;
    } else if (activeTab === 'image' && imageFile) {
      content = imageFile.name;
      // In a real app, you'd upload the image and get a URL
      imageUrl = URL.createObjectURL(imageFile);
    } else {
      return;
    }

    if (!title.trim()) {
      return;
    }

    setIsUploading(true);
    await onUpload(activeTab, content, title, imageUrl || undefined);
    
    // Reset form
    setTitle('');
    setUrlInput('');
    setTextInput('');
    setImageFile(null);
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const canUpload = title.trim() && (
    (activeTab === 'url' && urlInput.trim()) ||
    (activeTab === 'text' && textInput.trim()) ||
    (activeTab === 'image' && imageFile)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-gray-900 dark:text-white mb-2">Upload for Verification</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload content to check for fake news or misinformation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Verify Content</CardTitle>
              <CardDescription>
                Upload URLs, text, or images for AI-powered credibility analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-gray-900 dark:text-white">
                  Title *
                </label>
                <Input
                  placeholder="Give your post a descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12"
                  disabled={isUploading}
                />
              </div>

              {/* Content Type Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link2 className="size-4" />
                    <span className="hidden sm:inline">URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="size-4" />
                    <span className="hidden sm:inline">Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="size-4" />
                    <span className="hidden sm:inline">Image</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-2 mt-4">
                  <label className="text-gray-900 dark:text-white">
                    URL
                  </label>
                  <Input
                    placeholder="https://example.com/news-article"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="h-12"
                    disabled={isUploading}
                  />
                </TabsContent>

                <TabsContent value="text" className="space-y-2 mt-4">
                  <label className="text-gray-900 dark:text-white">
                    Text Content
                  </label>
                  <Textarea
                    placeholder="Paste the text you want to verify..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[200px] resize-none"
                    disabled={isUploading}
                  />
                </TabsContent>

                <TabsContent value="image" className="space-y-2 mt-4">
                  <label className="text-gray-900 dark:text-white">
                    Image File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-green-500 dark:hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                        <Image className="size-8 text-green-600 dark:text-green-500" />
                      </div>
                      {imageFile ? (
                        <div>
                          <p className="text-gray-900 dark:text-white mb-1">
                            {imageFile.name}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900 dark:text-white">
                            Click to upload an image
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            PNG, JPG, or WEBP
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleUpload}
                disabled={isUploading || !canUpload}
                className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-5 mr-2 animate-spin" />
                    Analyzing & Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="size-5 mr-2" />
                    Upload & Verify
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}