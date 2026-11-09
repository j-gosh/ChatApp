import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  useMicrophonePermission,
  usePhotoOutput,
  useVideoOutput,
  type CameraController,
  type CameraRef,
  type FlashMode,
  type OrientationSource,
  type Recorder,
} from 'react-native-vision-camera';

import { PermissionGate } from '@/components/PermissionGate';
import { CaptureThumbnail, type Capture } from '@/features/camera/CaptureThumbnail';
import { ModeRow } from '@/features/camera/ModeRow';
import { PhotoShareActions } from '@/features/camera/PhotoShareActions';
import { useIsAppActive } from '@/hooks/use-is-app-active';
import { showSnackbar } from '@/stores/snackbar-store';
import { getErrorMessage } from '@/utils/errors';

type LightMode = FlashMode | 'torch';
type MeteringMode = 'auto' | 'locked';
type Panel = 'flash' | 'exposure' | 'focus';

const EXPOSURE_STEP = 0.5;
const ICON_COLOR = '#2196F3';

function reportError(action: string, error: unknown) {
  console.error(`[camera] ${action} failed`, error);
  showSnackbar(`${action} failed: ${getErrorMessage(error)}`);
}

/**
 * Camera screen: photo capture, video recording (with pause/resume), flash and
 * torch, exposure and focus controls, pinch-to-zoom, and tap-to-focus. Photos
 * can be sent as snaps, posted as stories, or saved to memories.
 */
export function CameraScreen() {
  const cameraPermission = useCameraPermission();
  const microphonePermission = useMicrophonePermission();
  const isFocused = useIsFocused();
  const isAppActive = useIsAppActive();

  const [position, setPosition] = useState<'back' | 'front'>('back');
  const devices = useCameraDevices();
  const device = useCameraDevice(position);
  const canFlip =
    devices.some((d) => d.position === 'front') && devices.some((d) => d.position === 'back');

  const [enableAudio, setEnableAudio] = useState(true);
  // Photos can be uploaded as snaps, stories, or memories, so keep them reasonably small.
  const photoOutput = usePhotoOutput({ quality: 0.7 });
  const videoOutput = useVideoOutput({ enableAudio });

  const cameraRef = useRef<CameraRef>(null);
  const [controller, setController] = useState<CameraController>();
  const [openPanel, setOpenPanel] = useState<Panel | null>(null);
  const [lightMode, setLightMode] = useState<LightMode>('off');
  const [exposureMode, setExposureMode] = useState<MeteringMode>('auto');
  const [focusMode, setFocusMode] = useState<MeteringMode>('auto');
  const [exposureBias, setExposureBias] = useState(0);
  const [orientationSource, setOrientationSource] = useState<OrientationSource>('device');
  const [isPreviewPaused, setIsPreviewPaused] = useState(false);
  const [recorder, setRecorder] = useState<Recorder | null>(null);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [capture, setCapture] = useState<Capture | null>(null);

  const { hasPermission, canRequestPermission, requestPermission } = cameraPermission;
  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestPermission().catch((error: unknown) =>
        reportError('Camera permission request', error),
      );
    }
  }, [hasPermission, canRequestPermission, requestPermission]);

  if (!cameraPermission.hasPermission) {
    return (
      <PermissionGate
        message="Camera access is needed to take photos and record videos."
        canRequest={cameraPermission.canRequestPermission}
        onRequest={() => {
          cameraPermission.requestPermission().catch((error: unknown) => {
            reportError('Camera permission request', error);
          });
        }}
      />
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text>No camera available.</Text>
      </View>
    );
  }

  const isRecording = recorder !== null;
  const togglePanel = (panel: Panel) =>
    setOpenPanel((current) => (current === panel ? null : panel));

  const takePicture = async () => {
    try {
      const flashMode: FlashMode = lightMode === 'torch' || !device.hasFlash ? 'off' : lightMode;
      const photo = await photoOutput.capturePhotoToFile({ flashMode }, {});
      setCapture({ type: 'photo', uri: `file://${photo.filePath}` });
    } catch (error) {
      reportError('Taking a picture', error);
    }
  };

  const startRecording = async () => {
    try {
      if (enableAudio && !microphonePermission.hasPermission) {
        const granted = await microphonePermission.requestPermission();
        if (!granted) {
          showSnackbar('Microphone access denied. Turn off audio or allow it in Settings.');
          return;
        }
      }
      const newRecorder = await videoOutput.createRecorder({});
      await newRecorder.startRecording(
        (filePath) => {
          setRecorder(null);
          setIsRecordingPaused(false);
          setCapture({ type: 'video', uri: `file://${filePath}` });
          showSnackbar(`Video recorded to ${filePath}`);
        },
        (error) => {
          setRecorder(null);
          setIsRecordingPaused(false);
          reportError('Recording', error);
        },
        () => setIsRecordingPaused(true),
        () => setIsRecordingPaused(false),
      );
      setRecorder(newRecorder);
    } catch (error) {
      reportError('Starting a recording', error);
    }
  };

  const runRecorder = (action: string, run: (active: Recorder) => Promise<void>) => {
    if (recorder) run(recorder).catch((error: unknown) => reportError(action, error));
  };

  const changeExposureMode = (mode: MeteringMode) => {
    if (!controller) return;
    const update = mode === 'locked' ? controller.lockCurrentExposure() : controller.resetFocus();
    update
      .then(() => setExposureMode(mode))
      .catch((error: unknown) => reportError('Changing exposure', error));
  };

  const changeFocusMode = (mode: MeteringMode) => {
    if (!controller) return;
    const update = mode === 'locked' ? controller.lockCurrentFocus() : controller.resetFocus();
    update
      .then(() => setFocusMode(mode))
      .catch((error: unknown) => reportError('Changing focus', error));
  };

  const adjustExposure = (delta: number) =>
    setExposureBias((current) =>
      Math.min(device.maxExposureBias, Math.max(device.minExposureBias, current + delta)),
    );

  return (
    <View style={styles.container}>
      <View style={[styles.preview, isRecording && styles.previewRecording]}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          outputs={[photoOutput, videoOutput]}
          isActive={isFocused && isAppActive && !isPreviewPaused}
          torchMode={lightMode === 'torch' && device.hasTorch ? 'on' : 'off'}
          exposure={device.supportsExposureBias ? exposureBias : undefined}
          orientationSource={orientationSource}
          enableNativeZoomGesture
          enableNativeTapToFocusGesture
          onStarted={() => setController(cameraRef.current?.controller)}
          onError={(error) => reportError('Camera', error)}
        />
      </View>

      <View style={styles.row}>
        <IconButton
          icon="camera"
          iconColor={ICON_COLOR}
          disabled={isRecording}
          onPress={takePicture}
          accessibilityLabel="Take picture"
        />
        <IconButton
          icon="video"
          iconColor={ICON_COLOR}
          disabled={isRecording}
          onPress={startRecording}
          accessibilityLabel="Record video"
        />
        <IconButton
          icon={isRecordingPaused ? 'play' : 'pause'}
          iconColor={ICON_COLOR}
          disabled={!isRecording}
          onPress={() =>
            runRecorder(isRecordingPaused ? 'Resuming' : 'Pausing', (active) =>
              isRecordingPaused ? active.resumeRecording() : active.pauseRecording(),
            )
          }
          accessibilityLabel={isRecordingPaused ? 'Resume recording' : 'Pause recording'}
        />
        <IconButton
          icon="stop"
          iconColor="#F44336"
          disabled={!isRecording}
          onPress={() => runRecorder('Stopping', (active) => active.stopRecording())}
          accessibilityLabel="Stop recording"
        />
        <IconButton
          icon={isPreviewPaused ? 'play-box-outline' : 'pause-box-outline'}
          iconColor={isPreviewPaused ? '#F44336' : ICON_COLOR}
          disabled={isRecording}
          onPress={() => setIsPreviewPaused((paused) => !paused)}
          accessibilityLabel={isPreviewPaused ? 'Resume preview' : 'Pause preview'}
        />
      </View>

      <View style={styles.row}>
        <IconButton
          icon="flash"
          iconColor={ICON_COLOR}
          onPress={() => togglePanel('flash')}
          accessibilityLabel="Flash mode"
        />
        <IconButton
          icon="brightness-6"
          iconColor={ICON_COLOR}
          onPress={() => togglePanel('exposure')}
          accessibilityLabel="Exposure mode"
        />
        <IconButton
          icon="image-filter-center-focus"
          iconColor={ICON_COLOR}
          onPress={() => togglePanel('focus')}
          accessibilityLabel="Focus mode"
        />
        <IconButton
          icon={enableAudio ? 'volume-high' : 'volume-mute'}
          iconColor={ICON_COLOR}
          disabled={isRecording}
          onPress={() => setEnableAudio((enabled) => !enabled)}
          accessibilityLabel={enableAudio ? 'Disable audio' : 'Enable audio'}
        />
        <IconButton
          icon={orientationSource === 'interface' ? 'screen-rotation-lock' : 'screen-rotation'}
          iconColor={ICON_COLOR}
          onPress={() =>
            setOrientationSource((source) => (source === 'device' ? 'interface' : 'device'))
          }
          accessibilityLabel={
            orientationSource === 'interface'
              ? 'Unlock capture orientation'
              : 'Lock capture orientation'
          }
        />
      </View>

      {openPanel === 'flash' && (
        <ModeRow
          title="Flash Mode"
          value={lightMode}
          onChange={setLightMode}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'auto', label: 'Auto', disabled: !device.hasFlash },
            { value: 'on', label: 'Always', disabled: !device.hasFlash },
            { value: 'torch', label: 'Torch', disabled: !device.hasTorch },
          ]}
        />
      )}
      {openPanel === 'exposure' && (
        <ModeRow
          title="Exposure Mode"
          value={exposureMode}
          onChange={changeExposureMode}
          options={[
            { value: 'auto', label: 'Auto', disabled: !controller },
            {
              value: 'locked',
              label: 'Locked',
              disabled: !controller || !device.supportsExposureLocking,
            },
          ]}
        >
          {device.supportsExposureBias ? (
            <View style={styles.exposureOffset}>
              <IconButton
                icon="minus"
                onPress={() => adjustExposure(-EXPOSURE_STEP)}
                accessibilityLabel="Decrease exposure"
              />
              <Text>Offset {exposureBias.toFixed(1)}</Text>
              <IconButton
                icon="plus"
                onPress={() => adjustExposure(EXPOSURE_STEP)}
                accessibilityLabel="Increase exposure"
              />
              <IconButton
                icon="restore"
                onPress={() => setExposureBias(0)}
                accessibilityLabel="Reset exposure offset"
              />
            </View>
          ) : null}
        </ModeRow>
      )}
      {openPanel === 'focus' && (
        <ModeRow
          title="Focus Mode"
          value={focusMode}
          onChange={changeFocusMode}
          options={[
            { value: 'auto', label: 'Auto', disabled: !controller },
            {
              value: 'locked',
              label: 'Locked',
              disabled: !controller || !device.supportsFocusLocking,
            },
          ]}
        />
      )}

      {capture?.type === 'photo' ? <PhotoShareActions key={capture.uri} uri={capture.uri} /> : null}

      <View style={[styles.row, styles.bottomRow]}>
        <IconButton
          icon="camera-flip"
          iconColor={ICON_COLOR}
          disabled={!canFlip || isRecording}
          onPress={() => setPosition((current) => (current === 'back' ? 'front' : 'back'))}
          accessibilityLabel="Switch camera"
        />
        <CaptureThumbnail capture={capture} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  preview: { flex: 1, backgroundColor: '#000000', borderWidth: 3, borderColor: '#9E9E9E' },
  previewRecording: { borderColor: '#FF5252' },
  row: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  bottomRow: { justifyContent: 'space-between', padding: 5 },
  exposureOffset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
