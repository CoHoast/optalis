'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { 
  CameraIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import '../mobile.css';

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
}

type ProcessingStep = 
  | 'uploading'
  | 'analyzing'
  | 'extracting'
  | 'validating'
  | 'complete';

export default function MobileScan() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('uploading');
  const [error, setError] = useState<string | null>(null);
  const [newApplicationId, setNewApplicationId] = useState<string | null>(null);

  const handleCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];
    
    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select image files only');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be under 10MB');
        return;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
      });
    });

    setImages((prev) => [...prev, ...newImages]);
    setError(null);
    
    // Clear the input so the same file can be selected again
    e.target.value = '';
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAllImages = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  }, [images]);

  const processImages = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProcessingStep('uploading');

    try {
      // Create FormData with all images
      const formData = new FormData();
      images.forEach((img, index) => {
        formData.append(`image_${index}`, img.file);
      });

      // Step 1: Upload
      setProcessingStep('uploading');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: Analyzing with vision
      setProcessingStep('analyzing');
      
      // Call the API
      const response = await fetch('/api/mobile/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process document');
      }

      // Step 3: Extracting data
      setProcessingStep('extracting');
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 4: Validating
      setProcessingStep('validating');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = await response.json();

      // Step 5: Complete
      setProcessingStep('complete');
      setNewApplicationId(result.applicationId);

      // Haptic feedback on success
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }

      // Auto-navigate after brief success display
      setTimeout(() => {
        router.push(`/mobile/application/${result.applicationId}?new=true`);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document');
      setIsProcessing(false);
    }
  };

  const getProcessingMessage = () => {
    switch (processingStep) {
      case 'uploading':
        return { title: 'Uploading...', text: 'Sending document to server' };
      case 'analyzing':
        return { title: 'Analyzing Document', text: 'AI is reading the document' };
      case 'extracting':
        return { title: 'Extracting Data', text: 'Identifying patient information' };
      case 'validating':
        return { title: 'Validating', text: 'Checking data accuracy' };
      case 'complete':
        return { title: 'Success!', text: 'Application created' };
    }
  };

  const completedSteps = () => {
    const steps: ProcessingStep[] = ['uploading', 'analyzing', 'extracting', 'validating'];
    const currentIndex = steps.indexOf(processingStep);
    return steps.slice(0, currentIndex);
  };

  // Processing overlay
  if (isProcessing) {
    const message = getProcessingMessage();
    
    if (processingStep === 'complete') {
      return (
        <MobileLayout title="Scan Document">
          <div className="scan-success">
            <div className="scan-success-icon">
              <CheckIcon />
            </div>
            <h2 className="scan-success-title">{message.title}</h2>
            <p className="scan-success-text">{message.text}</p>
            <p className="scan-success-text" style={{ fontSize: '13px', color: '#9ca3af' }}>
              Redirecting to application...
            </p>
          </div>
        </MobileLayout>
      );
    }

    return (
      <MobileLayout title="Scan Document">
        <div className="scan-processing">
          <div className="scan-processing-spinner" />
          <h2 className="scan-processing-title">{message.title}</h2>
          <p className="scan-processing-text">{message.text}</p>
          
          {completedSteps().map((step) => (
            <div key={step} className="scan-processing-step">
              <CheckIcon />
              <span>
                {step === 'uploading' && 'Document uploaded'}
                {step === 'analyzing' && 'Document analyzed'}
                {step === 'extracting' && 'Data extracted'}
                {step === 'validating' && 'Data validated'}
              </span>
            </div>
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Scan Document">
      <div className="scan-container">
        {/* Multi-page hint */}
        {images.length > 0 && images.length < 5 && (
          <div className="scan-multi-hint">
            <InformationCircleIcon />
            <span>You can add up to 5 pages for multi-page documents</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ 
            padding: '12px 16px', 
            background: '#fef2f2', 
            borderRadius: '10px', 
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Preview area */}
        {images.length === 0 ? (
          <div className="scan-preview-area">
            <div className="scan-placeholder">
              <DocumentTextIcon />
              <h3 className="scan-placeholder-title">Scan a Document</h3>
              <p className="scan-placeholder-text">
                Take a photo of a patient intake form, referral, or insurance document
              </p>
            </div>
          </div>
        ) : images.length === 1 ? (
          <div className="scan-preview-area has-image">
            <img 
              src={images[0].preview} 
              alt="Document preview" 
              className="scan-preview-image"
            />
            <div className="scan-preview-overlay">
              <button 
                className="scan-remove-btn"
                onClick={() => removeImage(images[0].id)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="scan-images-grid">
            {images.map((img, index) => (
              <div key={img.id} className="scan-image-thumb">
                <img src={img.preview} alt={`Page ${index + 1}`} />
                <button 
                  className="scan-image-thumb-remove"
                  onClick={() => removeImage(img.id)}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
                <span className="scan-image-thumb-number">{index + 1}</span>
              </div>
            ))}
            {images.length < 5 && (
              <button 
                className="scan-add-more"
                onClick={() => cameraInputRef.current?.click()}
              >
                <PlusIcon className="w-6 h-6" />
                <span>Add</span>
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="scan-actions">
          {images.length === 0 ? (
            <>
              <button 
                className="scan-btn primary"
                onClick={() => cameraInputRef.current?.click()}
              >
                <CameraIcon />
                Take Photo
              </button>
              <button 
                className="scan-btn secondary"
                onClick={() => galleryInputRef.current?.click()}
              >
                <PhotoIcon />
                Choose from Library
              </button>
            </>
          ) : (
            <>
              <button 
                className="scan-btn success"
                onClick={processImages}
              >
                <CheckIcon />
                Process {images.length > 1 ? `${images.length} Pages` : 'Document'}
              </button>
              {images.length < 5 && (
                <button 
                  className="scan-btn secondary"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <PlusIcon />
                  Add Another Page
                </button>
              )}
              <button 
                className="scan-btn secondary"
                onClick={clearAllImages}
                style={{ color: '#dc2626' }}
              >
                <XMarkIcon />
                Clear All
              </button>
            </>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="scan-camera-input"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleCapture}
          className="scan-camera-input"
        />
      </div>
    </MobileLayout>
  );
}
