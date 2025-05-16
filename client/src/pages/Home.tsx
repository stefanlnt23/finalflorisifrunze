import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import MainLayout from "@/components/layouts/MainLayout";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedContent, setConvertedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFile(file);
    setConvertedContent(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const result = await response.json();
      setConvertedContent(result.markdown);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsConverting(false);
    }
  };

  const downloadMarkdown = () => {
    if (!convertedContent) return;

    const blob = new Blob([convertedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.split('.')[0] || 'converted'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center animate-fadeInUp mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Office to Markdown Converter
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your Office documents into clean Markdown with just a drag and drop.
              Supports PDF, Word, PowerPoint, Excel and more.
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-lg transition-all duration-300 transform hover:shadow-xl border border-gray-200">
            <CardContent className="p-8">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 cursor-pointer transition-colors duration-300 ${
                  isDragging 
                    ? 'border-green-400 bg-green-50' 
                    : file 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept=".docx,.pptx,.xlsx,.pdf,.html,.txt,.csv,.json,.xml,.zip"
                />

                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className={`fas ${file ? 'fa-file-alt text-blue-500' : 'fa-cloud-upload-alt text-gray-400'} text-2xl`}></i>
                  </div>
                  {file ? (
                    <div className="animate-pulse">
                      <p className="text-lg font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-800">Drag & drop your file here</p>
                      <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500 mt-4">
                  <p>Supports PDF, Word, PowerPoint, Excel, HTML, and more</p>
                </div>
              </div>

              {/* Action Button */}
              {file && !convertedContent && !isConverting && (
                <div className="flex justify-center mb-6 animate-fadeIn">
                  <Button 
                    onClick={handleConvert} 
                    className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-transform duration-200 transform hover:scale-105"
                  >
                    Convert to Markdown
                  </Button>
                </div>
              )}

              {/* Progress Bar */}
              {isConverting && (
                <div className="mb-6 animate-fadeIn">
                  <p className="text-sm font-medium text-gray-700 mb-2">Converting...</p>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 animate-fadeIn">
                  <p className="flex items-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                  </p>
                </div>
              )}

              {/* Converted Content */}
              {convertedContent && (
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Converted Markdown</h3>
                    <Button 
                      onClick={downloadMarkdown}
                      variant="outline" 
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-64 overflow-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {convertedContent}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-file-alt text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Multiple Formats</h3>
              <p className="text-gray-600">Support for PDF, PowerPoint, Word, Excel, and more file formats.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-bolt text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Conversion</h3>
              <p className="text-gray-600">Quick and accurate document conversion to clean Markdown format.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-lock text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Processing</h3>
              <p className="text-gray-600">Your files are processed securely and never stored permanently.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}