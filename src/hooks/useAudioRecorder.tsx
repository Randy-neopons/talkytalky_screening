import { useEffect, useRef, useState } from 'react';

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function encodeWAV(audioBuffer: AudioBuffer): ArrayBuffer {
    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    const numSamples = audioBuffer.length * numChannels;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV 헤더 작성
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM 포맷
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true); // 바이트 레이트
    view.setUint16(32, numChannels * 2, true); // 블록 정렬
    view.setUint16(34, 16, true); // 비트 심도

    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // PCM 데이터 작성 (Float32를 Int16 PCM으로 변환)
    let offset = 44;
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i])); // 값 제한
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
            offset += 2;
        }
    }

    return buffer;
}

function convertBlobToWav(blob: Blob, callback: (wavBlob: Blob) => void) {
    const reader = new FileReader();

    reader.onloadend = function () {
        const arrayBuffer = reader.result as ArrayBuffer;
        const audioContext = new AudioContext();

        audioContext.decodeAudioData(arrayBuffer, audioBuffer => {
            const wavArrayBuffer = encodeWAV(audioBuffer);
            const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
            callback(wavBlob);
        });
    };

    reader.readAsArrayBuffer(blob);
}

// 오디오 녹음 custom hook
const useAudioRecorder = (defaultUrl?: string | null) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>();
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
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
            event.data.size && audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            try {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                convertBlobToWav(audioBlob, wavBlob => {
                    const audioUrl = URL.createObjectURL(wavBlob);
                    setAudioBlob(wavBlob);
                    setAudioUrl(audioUrl);
                    if (audioPlayerRef.current) {
                        audioPlayerRef.current.src = audioUrl;
                    }

                    // 볼륨 측정 애니메이션 중지
                    if (animationFrameIdRef.current) {
                        cancelAnimationFrame(animationFrameIdRef.current);
                    }
                });
                // const wavBlob = await getWaveBlob(audioChunksRef.current, false);
                // const wavBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            } catch (err) {
                console.error(err);
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
        setAudioBlob,
        handleStartRecording,
        handleStopRecording,
        handlePlay,
        handlePause,
    };
};

export default useAudioRecorder;
