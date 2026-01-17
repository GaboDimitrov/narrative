'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { AudioPlayer } from '@/components/AudioPlayer';

interface GeneratedChapter {
  number: number;
  title: string;
  audioUrl: string;
  characters: string[];
  segmentCount: number;
}

interface GenerationResult {
  success: boolean;
  storyId: string;
  title: string;
  author: string;
  totalChapters: number;
  chapters: GeneratedChapter[];
}

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<GeneratedChapter | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file || !title || !author) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress('Uploading PDF and starting processing...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('author', author);
      if (coverUrl) {
        formData.append('coverUrl', coverUrl);
      }

      setProgress('Processing PDF and generating audiobook... This may take several minutes.');

      const response = await fetch('/api/audiobook/generate', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate audiobook');
      }

      setResult(data);
      setProgress('');
      // Auto-select first chapter for playback
      if (data.chapters && data.chapters.length > 0) {
        setSelectedChapter(data.chapters[0]);
      }
      
      // Reset form
      setFile(null);
      setTitle('');
      setAuthor('');
      setCoverUrl('');
      
      // Reset file input
      const fileInput = document.getElementById('pdf-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Generate Audiobook
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PDF File Upload */}
            <div>
              <label
                htmlFor="pdf-file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                PDF File *
              </label>
              <input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                placeholder="Enter book title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
            </div>

            {/* Author */}
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Author *
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={isLoading}
                placeholder="Enter author name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
            </div>

            {/* Cover URL (Optional) */}
            <div>
              <label
                htmlFor="coverUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cover Image URL (Optional)
              </label>
              <input
                id="coverUrl"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                disabled={isLoading}
                placeholder="https://example.com/cover.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Progress Message */}
            {progress && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {progress}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !file || !title || !author}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Audiobook'}
            </button>
          </form>
        </div>

        {/* Success Result */}
        {result && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Audiobook Generated Successfully!
            </h2>
            <div className="space-y-2 text-green-700">
              <p><strong>Story ID:</strong> {result.storyId}</p>
              <p><strong>Title:</strong> {result.title}</p>
              <p><strong>Author:</strong> {result.author}</p>
              <p><strong>Total Chapters:</strong> {result.totalChapters}</p>
            </div>
            
            {/* Audio Player */}
            {selectedChapter && (
              <div className="mt-6">
                <AudioPlayer
                  src={selectedChapter.audioUrl}
                  title={selectedChapter.title}
                  chapterNumber={selectedChapter.number}
                  onEnded={() => {
                    // Auto-play next chapter
                    const currentIndex = result.chapters.findIndex(c => c.number === selectedChapter.number);
                    if (currentIndex < result.chapters.length - 1) {
                      setSelectedChapter(result.chapters[currentIndex + 1]);
                    }
                  }}
                />
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="font-medium text-green-800 mb-3">Chapters:</h3>
              <ul className="space-y-2">
                {result.chapters.map((chapter) => (
                  <li 
                    key={chapter.number} 
                    className={`bg-white p-4 rounded border transition-colors cursor-pointer ${
                      selectedChapter?.number === chapter.number 
                        ? 'border-primary-500 ring-2 ring-primary-200' 
                        : 'border-green-200 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedChapter(chapter)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {selectedChapter?.number === chapter.number && (
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                          )}
                          <p className="font-medium text-gray-900">
                            Chapter {chapter.number}: {chapter.title}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {chapter.segmentCount} segments | Characters: {chapter.characters.join(', ')}
                        </p>
                      </div>
                      <a
                        href={chapter.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 hover:text-gray-700 p-2"
                        title="Download audio"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
