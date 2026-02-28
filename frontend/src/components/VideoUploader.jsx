
import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';

export default function VideoUploader({ jobId, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { borderClass, glowClass, textClass, bgClass } = useUserTypeColor();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size <= 100 * 1024 * 1024) {
      setFile(selected);
    } else {
      alert("File too large or invalid. Max 100MB.");
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setStatus('Uploading');
    
    try {
      const timestamp = Date.now();
      const filePath = `videos/${user.id}/${jobId}/${timestamp}.mp4`;
      
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      
      setStatus('Processing');
      setTimeout(() => {
        setStatus('Completed');
        if (onUploadComplete) onUploadComplete(filePath);
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus('Error');
    }
  };

  return (
    <div className={`border-2 border-dashed ${borderClass} rounded-lg p-8 text-center transition-dynamic ${glowClass}`}>
      <input 
        type="file" 
        accept="video/mp4,video/webm,video/quicktime" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {!file ? (
        <div className="cursor-pointer" onClick={() => fileInputRef.current.click()}>
          <p className="text-muted-foreground mb-4">Drag and drop your video here, or click to browse</p>
          <p className="text-xs text-muted-foreground">MP4, WebM, MOV (Max 100MB)</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className={`font-bold ${textClass}`}>{file.name}</p>
          <p className="text-sm text-muted-foreground">Status: {status}</p>
          
          {status === 'Idle' && (
            <button onClick={handleUpload} className={`px-4 py-2 rounded font-bold ${bgClass}`}>
              Upload Video
            </button>
          )}
        </div>
      )}
    </div>
  );
}
