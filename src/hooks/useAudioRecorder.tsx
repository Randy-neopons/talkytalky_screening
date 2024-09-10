import { useEffect, useRef, useState } from 'react';

// 오디오 녹음 custom hook
const useAudioRecorder = (defaultUrl?: string | null) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioBlob, setAudioBlob] = useState<Blob>();
    const [audioUrl, setAudioUrl] = useState<string | null>();
    const mediaRecorderRef = useRef<MediaRecorder>();
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement>();

    useEffect(() => {
        const audioPlayer = new Audio();
        audioPlayerRef.current = audioPlayer;
        audioPlayer.onended = event => {
            setIsPlaying(false);
        };

        if (defaultUrl) {
            setAudioUrl(defaultUrl);
            audioPlayer.src = defaultUrl;
        }
    }, [defaultUrl]);

    const handleStartRecording = async () => {
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = event => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioBlob(audioBlob);
            setAudioUrl(audioUrl);
            if (audioPlayerRef.current) {
                audioPlayerRef.current.src = audioUrl;
            }
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
        setAudioUrl,
        handleStartRecording,
        handleStopRecording,
        handlePlay,
        handlePause,
    };
};

export default useAudioRecorder;
