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
  voiceWarning?: string;
}

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [narratorVoice, setNarratorVoice] = useState('');
  const [voiceStability, setVoiceStability] = useState(60); // 0-100, default 60%
  const [voiceStyle, setVoiceStyle] = useState(15); // 0-100, default 15%
  const [voiceSpeed, setVoiceSpeed] = useState(100); // 25-400, default 100 (1.0x)
  const [voiceClarity, setVoiceClarity] = useState(true); // speaker boost
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<GeneratedChapter | null>(null);
  const [voiceWarning, setVoiceWarning] = useState<string | null>(null);
  
  // Voice checker state
  const [testVoiceInput, setTestVoiceInput] = useState('');
  const [isCheckingVoice, setIsCheckingVoice] = useState(false);
  const [voiceCheckResult, setVoiceCheckResult] = useState<{
    success: boolean;
    message: string;
    voiceId?: string;
    voiceName?: string;
  } | null>(null);

  const handleCheckVoice = async () => {
    if (!testVoiceInput.trim()) return;
    
    setIsCheckingVoice(true);
    setVoiceCheckResult(null);
    
    try {
      const response = await fetch('/api/audiobook/check-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: testVoiceInput.trim() }),
      });
      
      const data = await response.json();
      setVoiceCheckResult(data);
      
      // If voice is found, auto-fill the narrator voice field
      if (data.success && data.voiceId) {
        setNarratorVoice(data.voiceId);
      }
    } catch {
      setVoiceCheckResult({
        success: false,
        message: 'Failed to check voice. Please try again.',
      });
    } finally {
      setIsCheckingVoice(false);
    }
  };

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
      if (narratorVoice.trim()) {
        formData.append('narratorVoice', narratorVoice.trim());
      }
      formData.append('voiceStability', String(voiceStability / 100));
      formData.append('voiceStyle', String(voiceStyle / 100));
      formData.append('voiceSpeed', String(voiceSpeed / 100));
      formData.append('voiceClarity', String(voiceClarity));

      setProgress('Processing PDF and generating audiobook... This may take several minutes.');
      setVoiceWarning(null);

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
      
      // Handle voice warning if the requested voice wasn't found
      if (data.voiceWarning) {
        setVoiceWarning(data.voiceWarning);
      }
      
      // Auto-select first chapter for playback
      if (data.chapters && data.chapters.length > 0) {
        setSelectedChapter(data.chapters[0]);
      }
      
      // Reset form
      setFile(null);
      setTitle('');
      setAuthor('');
      setCoverUrl('');
      setNarratorVoice('');
      setVoiceStability(60);
      setVoiceStyle(15);
      setVoiceSpeed(100);
      setVoiceClarity(true);
      
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

        {/* Voice Checker */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-dashed border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Voice Checker
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Test if a voice name or ID exists in your ElevenLabs account before generating.
          </p>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={testVoiceInput}
              onChange={(e) => setTestVoiceInput(e.target.value)}
              placeholder="Enter voice name or ID (e.g., Rachel or ONzlyqflv3NLRqoxmiV8)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCheckVoice()}
            />
            <button
              type="button"
              onClick={handleCheckVoice}
              disabled={isCheckingVoice || !testVoiceInput.trim()}
              className="px-4 py-2 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCheckingVoice ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking...
                </>
              ) : (
                'Check Voice'
              )}
            </button>
          </div>

          {/* Voice Check Result */}
          {voiceCheckResult && (
            <div className={`mt-4 p-4 rounded-md ${
              voiceCheckResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {voiceCheckResult.success ? (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <div>
                  <p className={voiceCheckResult.success ? 'text-green-800' : 'text-red-800'}>
                    {voiceCheckResult.message}
                  </p>
                  {voiceCheckResult.success && voiceCheckResult.voiceId && (
                    <p className="text-sm text-green-600 mt-1">
                      Voice ID: <code className="bg-green-100 px-1 py-0.5 rounded">{voiceCheckResult.voiceId}</code>
                      {voiceCheckResult.voiceName && (
                        <span className="ml-2">Name: <strong>{voiceCheckResult.voiceName}</strong></span>
                      )}
                    </p>
                  )}
                  {voiceCheckResult.success && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Voice ID has been auto-filled in the form below.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
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

            {/* Narrator Voice (Optional) */}
            <div>
              <label
                htmlFor="narratorVoice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Narrator Voice (Optional)
              </label>
              <input
                id="narratorVoice"
                type="text"
                value={narratorVoice}
                onChange={(e) => setNarratorVoice(e.target.value)}
                disabled={isLoading}
                placeholder="Voice name or ID (e.g., Rachel or ONzlyqflv3NLRqoxmiV8)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a voice name or paste a voice ID directly. Leave empty for default narrator.
              </p>
            </div>

            {/* Voice Settings */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Voice Settings</h3>
              
              {/* Stability Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="voiceStability" className="text-sm text-gray-600">
                    Stability
                  </label>
                  <span className="text-sm text-gray-500">{voiceStability}%</span>
                </div>
                <input
                  id="voiceStability"
                  type="range"
                  min="0"
                  max="100"
                  value={voiceStability}
                  onChange={(e) => setVoiceStability(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>More expressive</span>
                  <span>More consistent</span>
                </div>
              </div>

              {/* Style Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="voiceStyle" className="text-sm text-gray-600">
                    Style Intensity
                  </label>
                  <span className="text-sm text-gray-500">{voiceStyle}%</span>
                </div>
                <input
                  id="voiceStyle"
                  type="range"
                  min="0"
                  max="100"
                  value={voiceStyle}
                  onChange={(e) => setVoiceStyle(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Neutral</span>
                  <span>Dramatic</span>
                </div>
              </div>

              {/* Speed Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="voiceSpeed" className="text-sm text-gray-600">
                    Reading Speed
                  </label>
                  <span className="text-sm text-gray-500">{(voiceSpeed / 100).toFixed(2)}x</span>
                </div>
                <input
                  id="voiceSpeed"
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.25x Slow</span>
                  <span>1x Normal</span>
                  <span>2x Fast</span>
                </div>
              </div>

              {/* Speaker Boost Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  id="voiceClarity"
                  type="checkbox"
                  checked={voiceClarity}
                  onChange={(e) => setVoiceClarity(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                />
                <label htmlFor="voiceClarity" className="text-sm text-gray-600">
                  Enhanced clarity (Speaker Boost)
                </label>
              </div>
            </div>

            {/* Voice Warning */}
            {voiceWarning && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{voiceWarning}</span>
              </div>
            )}

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
