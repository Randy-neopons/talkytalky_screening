import { useEffect, useRef, useState } from 'react';

// 오디오 녹음 custom hook
const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioBlob, setAudioBlob] = useState<Blob>();
    const [audioUrl, setAudioUrl] = useState<string>();
    const mediaRecorderRef = useRef<MediaRecorder>();
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement>();

    const handleStartRecording = async () => {
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioPlayer = new Audio();

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        audioPlayerRef.current = audioPlayer;

        mediaRecorder.ondataavailable = event => {
            audioChunksRef.current.push(event.data);
        };

        audioPlayer.onended = event => {
            setIsPlaying(false);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioBlob(audioBlob);
            setAudioUrl(audioUrl);
            audioPlayer.src = audioUrl;
        };

        mediaRecorder.start();
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        mediaRecorderRef.current?.stop();
    };

    const handlePlay = () => {
        setIsPlaying(true);
        audioPlayerRef.current?.play();
    };

    const handlePause = () => {
        setIsPlaying(false);
        audioPlayerRef.current?.pause();
    };

    return {
        isRecording,
        isPlaying,
        audioBlob,
        audioUrl,
        handleStartRecording,
        handleStopRecording,
        handlePlay,
        handlePause,
    };
};

export default useAudioRecorder;
