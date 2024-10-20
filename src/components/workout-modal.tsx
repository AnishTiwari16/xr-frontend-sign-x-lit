'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import StakeButtonWorkout from './health/StakeButtonWorkout';
import { EvmChains, SignProtocolClient, SpMode } from '@ethsign/sp-sdk';
import { privateKeyToAccount } from 'viem/accounts';
import { useEffect, useRef, useState } from 'react';
import Button from './buttons/Button';
import StartWorkoutButton from './health/EndWorkoutButton';
import { fetchUserData } from '@/hooks/useFitbitAuth';
import useHandleEncryption from '@/hooks/useLitEncryption';
const id = '0x26008c3393219f37ac18d956cbff520df8c130062e757fd3dc999f092b05a196';
export const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.polygonAmoy,
    account: privateKeyToAccount(id as `0x${string}`),
});
export default function WorkoutoutModal({
    children,
    open,
    onClose,
}: {
    children: React.ReactNode;
    open: boolean;
    onClose: () => void;
}) {
    const [showVrVideo, setShowVrVideo] = useState(false);
    const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
    const [attestaionId, setAttestaionId] = useState('');
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        function handlePlayPause() {
            setIsVideoPlaying(!videoRef.current?.paused);
        }

        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.addEventListener('play', handlePlayPause);
            videoElement.addEventListener('pause', handlePlayPause);
            videoElement.addEventListener('ended', handlePlayPause);
        }

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('play', handlePlayPause);
                videoElement.removeEventListener('pause', handlePlayPause);
                videoElement.removeEventListener('ended', handlePlayPause);
            }
        };
    }, []);
    const sessionCode = sessionStorage.getItem('fitbit_token');
    const { data: fitbitData } = useQuery({
        queryKey: ['user-data'],
        queryFn: () => fetchUserData(sessionCode!),
        enabled: !!sessionCode,
    });
    const { handleEncryptions } = useHandleEncryption();
    const onSubmitHandler = async () => {
        const { ciphertext, dataToEncryptHash } = await handleEncryptions({
            data: fitbitData?.gender,
        });
        const createSchemaRes = await client.createSchema({
            name: 'fitness',
            data: [
                { name: 'age', type: 'string' },
                { name: 'name', type: 'string' },
                { name: 'gender', type: 'string' },
                { name: 'walking', type: 'string' },
                { name: 'running', type: 'string' },
            ],
        });
        console.log(createSchemaRes);
        const createAttestationRes = await client.createAttestation({
            schemaId: createSchemaRes.schemaId,
            data: {
                age: fitbitData?.age,
                name: fitbitData?.displayName,
                gender: JSON.stringify({
                    ciphertext,
                    dataToEncryptHash,
                }),
                walking: fitbitData?.strideLengthWalking,
                running: fitbitData?.strideLengthRunning,
            },
            indexingValue: 'fitness',
        });
        setAttestaionId(createAttestationRes.attestationId);
        console.log(createAttestationRes);
    };
    return (
        <Dialog
            open={open}
            onOpenChange={(data) => {
                if (!data) {
                    onClose();
                }
            }}
        >
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                className="sm:max-w-[425px] md:max-w-[700px]"
            >
                <Card className="w-full mt-3">
                    <CardHeader>
                        <CardTitle>
                            Get Started with your fitness journey
                        </CardTitle>
                        <CardDescription>
                            Cut fat and build power at home and get your desired
                            physique.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!showVrVideo ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    {
                                        name: 'Chest',
                                        image: '/images/bodybuilder.png',
                                    },
                                    {
                                        name: 'Legs',
                                        image: '/images/dumbell.png',
                                    },
                                    { name: 'Back', image: '/images/luke.png' },
                                    {
                                        name: 'Shoulders',
                                        image: '/images/ini.png',
                                    },
                                ].map((part) => (
                                    <div
                                        key={part.name}
                                        className="relative aspect-video"
                                    >
                                        <Image
                                            src={part.image}
                                            alt={part.name}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-lg"
                                        />
                                        <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                                            {part.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <video
                                    className="rounded-lg"
                                    ref={videoRef}
                                    controls={isWorkoutStarted}
                                >
                                    <source
                                        src="https://res.cloudinary.com/ds9mjlm1r/video/upload/v1729114456/checkVid_ypequp.mp4"
                                        type="video/mp4"
                                    />
                                </video>
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 mt-3">
                                Workout Details
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-center justify-between">
                                    <span className="font-medium">
                                        Duration
                                    </span>
                                    <div className="font-bold text-blue-600">
                                        5 Days
                                    </div>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="font-medium">Rewards</span>
                                    <div className="font-bold text-blue-600">
                                        120 Days
                                    </div>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="font-medium">
                                        Calories burned
                                    </span>
                                    <div className="font-bold text-blue-600">
                                        60-100
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {showVrVideo ? (
                            isWorkoutStarted ? (
                                <StartWorkoutButton
                                    disabled={false}
                                    attestaionId={attestaionId}
                                />
                            ) : (
                                <Button
                                    onClick={async () => {
                                        onSubmitHandler();
                                        setIsWorkoutStarted(true);
                                        if (videoRef.current) {
                                            videoRef.current.play();
                                        }
                                    }}
                                    className="w-full flex items-center justify-center bg-blue-600 h-12  hover:bg-blue-700 text-white"
                                >
                                    Start Workout
                                </Button>
                            )
                        ) : (
                            <StakeButtonWorkout
                                onSuccess={() => {
                                    setShowVrVideo(true);
                                }}
                            />
                        )}
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
