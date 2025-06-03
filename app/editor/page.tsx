'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, FileText, Lock, Sparkles } from 'lucide-react';
import Editor from '@/components/Editor';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/stores/auth';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph } from 'docx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PLACEHOLDER_TEXT = "Start writing your cover letter here...";

export default function EditorPage() {
  const [content, setContent] = useState('');
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const transferredLetter = localStorage.getItem('transferredLetter');
    if (transferredLetter) {
      setContent(transferredLetter);
      localStorage.removeItem('transferredLetter');
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "The content has been copied to your clipboard."
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadAsPDF = () => {
    if (!isLoggedIn) {
      toast({
        title: "Premium feature",
        description: "Please upgrade to download as PDF.",
        variant: "destructive"
      });
      return;
    }

    const doc = new jsPDF();
    doc.text(content, 20, 20);
    doc.save('cover-letter.pdf');
    
    toast({
      title: "Downloaded as PDF",
      description: "Your cover letter has been downloaded."
    });
  };

  const downloadAsDocx = () => {
    if (!isLoggedIn) {
      toast({
        title: "Premium feature",
        description: "Please upgrade to download as DOCX.",
        variant: "destructive"
      });
      return;
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: content
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cover-letter.docx';
      link.click();
      window.URL.revokeObjectURL(url);
    });

    toast({
      title: "Downloaded as DOCX",
      description: "Your cover letter has been downloaded."
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Cover Letter Editor</h1>
            <Button>Save Draft</Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Write Your Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <Editor
                content={content}
                onChange={setContent}
                placeholder={PLACEHOLDER_TEXT}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="py-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4">
                    <Button
                      variant={isLoggedIn ? "default" : "secondary"}
                      onClick={downloadAsPDF}
                      disabled={!isLoggedIn}
                    >
                      {!isLoggedIn && <Lock className="h-4 w-4 mr-2" />}
                      {isLoggedIn && <Download className="h-4 w-4 mr-2" />}
                      Download PDF
                    </Button>
                    <Button
                      variant={isLoggedIn ? "default" : "secondary"}
                      onClick={downloadAsDocx}
                      disabled={!isLoggedIn}
                    >
                      {!isLoggedIn && <Lock className="h-4 w-4 mr-2" />}
                      {isLoggedIn && <FileText className="h-4 w-4 mr-2" />}
                      Download DOCX
                    </Button>
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                  {!isLoggedIn && (
                    <p className="text-sm text-muted-foreground">
                      Upgrade to unlock downloads
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button disabled className="bg-primary/80">
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Enhancement
                            <Lock className="h-3 w-3 ml-2" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coming soon! AI-powered enhancements to perfect your cover letter.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <p className="text-sm text-muted-foreground">
                      Let AI help you enhance your cover letter
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}