import { useEffect, useRef, useState } from 'react';

// 오디오 녹음 custom hook
const useAudioRecorder = (defaultUrl?: string | null) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioBlob, setAudioBlob] = useState<Blob>();
    const [audioUrl, setAudioUrl] = useState<string | null>();
    const [volume, setVolume] = useState<number>(0); // 볼륨 상태 추가

    const mediaRecorderRef = useRef<MediaRecorder>();
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement>();
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

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

        // 웹 오디오 API를 사용해 오디오 컨텍스트 및 분석기 설정
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        // 볼륨 측정 애니메이션
        const visualizeVolume = () => {
            if (analyserRef.current && dataArrayRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                const averageVolume = dataArrayRef.current.reduce((a, b) => a + b) / bufferLength;
                setVolume(averageVolume); // 볼륨 업데이트
            }
            animationFrameIdRef.current = requestAnimationFrame(visualizeVolume);
        };

        visualizeVolume(); // 볼륨 측정 시작

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

            // 볼륨 측정 애니메이션 중지
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
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
        volume,
        setAudioUrl,
        handleStartRecording,
        handleStopRecording,
        handlePlay,
        handlePause,
    };
};

export default useAudioRecorder;
