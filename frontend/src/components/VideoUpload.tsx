import { useState, useRef, useCallback } from 'react';
import { Upload, FileVideo, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios, { AxiosProgressEvent } from 'axios';

interface VideoUploadProps {
  locationId: string;
  onUploadComplete?: (taskId: string) => void;
  onError?: (error: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const SUPPORTED_FORMATS = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska'];
const SUPPORTED_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv'];

export default function VideoUpload({ locationId, onUploadComplete, onError }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 100MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const isValidExtension = SUPPORTED_EXTENSIONS.includes(fileExtension);
    const isValidType = SUPPORTED_FORMATS.includes(file.type);

    if (!isValidExtension && !isValidType) {
      return `Unsupported format. Supported: MP4, AVI, MOV, MKV`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setUploadState('error');
      onError?.(validationError);
      return;
    }

    setFile(file);
    setError(null);
    setUploadState('idle');

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !locationId) return;

    setUploadState('uploading');
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('location_id', locationId);

    try {
      const response = await axios.post('/api/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setProgress(percentCompleted);
        },
      });

      const { task_id } = response.data;

      setUploadState('processing');
      setProcessingStep('Extracting frames...');

      onUploadComplete?.(task_id);

      // Start polling for progress
      pollTaskStatus(task_id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setUploadState('error');
      onError?.(errorMessage);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/tasks/${taskId}/status`);
        const { status, progress, step } = response.data;

        if (status === 'processing') {
          setProcessingStep(step || 'Processing...');
          if (progress) setProgress(progress);
        } else if (status === 'complete') {
          clearInterval(pollInterval);
          setUploadState('complete');
          setProgress(100);
        } else if (status === 'error') {
          clearInterval(pollInterval);
          setUploadState('error');
          setError('Processing failed');
          onError?.('Processing failed');
        }
      } catch (err) {
        clearInterval(pollInterval);
        setUploadState('error');
        setError('Failed to check status');
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadState('idle');
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStateMessage = () => {
    switch (uploadState) {
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'processing':
        return processingStep;
      case 'complete':
        return 'Complete!';
      case 'error':
        return error || 'Error occurred';
      default:
        return 'Ready to upload';
    }
  };

  const getStateIcon = () => {
    switch (uploadState) {
      case 'uploading':
      case 'processing':
        return <Loader2 size={20} className="animate-spin text-[#0D9488]" />;
      case 'complete':
        return <CheckCircle size={20} className="text-[#10B981]" />;
      case 'error':
        return <AlertCircle size={20} className="text-[#EF4444]" />;
      default:
        return <Upload size={20} className="text-[#64748B]" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FileVideo size={18} className="text-[#0D9488]" />
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
            Video Upload
          </h3>
        </div>
        {file && uploadState === 'idle' && (
          <button
            onClick={clearFile}
            className="p-1 hover:bg-[#F1F5F9] rounded transition-colors"
          >
            <X size={16} className="text-[#64748B]" />
          </button>
        )}
      </div>

      {/* Drop Zone */}
      {!file && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${dragActive
            ? 'border-[#0D9488] bg-[#F0FDFA]'
            : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
            }`}
        >
          <Upload size={48} className="mx-auto mb-4 text-[#94A3B8]" />
          <p className="text-sm font-medium text-[#0F172A] mb-1">
            Drag & drop video here
          </p>
          <p className="text-xs text-[#64748B] mb-3">
            or click to browse
          </p>
          <p className="text-[10px] text-[#94A3B8]">
            MP4, AVI, MOV, MKV • Max 100MB • Up to 5 min
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* File Preview */}
      {file && previewUrl && uploadState === 'idle' && (
        <div className="mb-4">
          <video
            src={previewUrl}
            controls
            className="w-full rounded-lg max-h-[200px] object-cover"
          />
          <div className="flex items-center justify-between mt-2 p-3 bg-[#F8FAFC] rounded-lg">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileVideo size={16} className="text-[#0D9488] shrink-0" />
              <span className="text-sm text-[#0F172A] truncate">{file.name}</span>
            </div>
            <span className="text-xs text-[#64748B] shrink-0">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {(uploadState === 'uploading' || uploadState === 'processing') && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStateIcon()}
              <span className="text-sm font-medium text-[#0F172A]">
                {getStateMessage()}
              </span>
            </div>
            <span className="text-sm font-mono text-[#64748B]">{progress}%</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Complete State */}
      {uploadState === 'complete' && (
        <div className="mb-4 p-4 bg-[#F0FDF4] rounded-lg border border-[#10B981]/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-[#10B981]" />
            <span className="font-medium text-[#10B981]">Analysis Complete!</span>
          </div>
          <button
            onClick={() => { }}
            className="text-sm text-[#0D9488] hover:text-[#0F766E] font-medium"
          >
            View results →
          </button>
        </div>
      )}

      {/* Error State */}
      {uploadState === 'error' && error && (
        <div className="mb-4 p-4 bg-[#FEF2F2] rounded-lg border border-[#EF4444]/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#EF4444]">Upload Failed</p>
              <p className="text-sm text-[#64748B] mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {file && uploadState === 'idle' && (
        <button
          onClick={handleUpload}
          disabled={!locationId}
          className="w-full py-3 bg-[#0F172A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-[#1E293B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze Video
        </button>
      )}

      {uploadState === 'error' && (
        <button
          onClick={() => {
            clearFile();
            setUploadState('idle');
          }}
          className="w-full py-3 bg-[#F1F5F9] text-[#0F172A] rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-[#E2E8F0] transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Skeleton loader
export function VideoUploadSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm animate-pulse">
      <div className="w-24 h-3 bg-[#E2E8F0] rounded mb-5" />
      <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-8">
        <div className="w-12 h-12 bg-[#F1F5F9] rounded mx-auto mb-4" />
        <div className="w-32 h-4 bg-[#E2E8F0] rounded mx-auto mb-2" />
        <div className="w-48 h-3 bg-[#F1F5F9] rounded mx-auto" />
      </div>
    </div>
  );
}
