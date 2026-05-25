import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import Video, {
  OnLoadData,
  OnProgressData,
  OnBufferData,
  VideoRef,
} from "react-native-video";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import {
  IconFullscreen,
  IconFullscreenExit,
  IconCast,
  IconSubtitles,
  IconSettings,
} from "./PlayerIcons";

import TopOverlay from "./TopOverlay";
import Controls from "./Controls";
import SeekBar from "./SeekBar";
import XRayPanel from "./XRayPanel";
import XRaySidePanel from "./XRaySidePanel";
import GestureLayer from "./GestureLayer";
import { usePlayerControls } from "../../hooks/usePlayerControls";
import { usePlayerOrientation } from "../../hooks/usePlayerOrientation";
import { BASE_URL } from "../../../../shared/constants/config";
import {
  DEFAULT_MOVIE_TITLE,
  MOCK_ACTORS,
  MOCK_CHAPTERS,
  MOCK_SCENE_MARKERS,
  MOCK_XRAY_PRODUCTS,
  getActiveActor,
  mergeMarkers,
} from "../../data/mockPlayerData";
import { PLAYBACK_SPEEDS, SEEK_SKIP_SECONDS } from "./constants";
import { COLORS } from "./styles/playerTheme";
import type {
  VideoPlayerProps,
  VideoPlayerHandle,
  SceneMarker,
} from "../../types/player.types";

const Player = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      videoUrl,
      videoId,
      title = DEFAULT_MOVIE_TITLE,
      paused,
      currentTime,
      setCurrentTime,
      setDuration,
      onPause,
      onPlay,
      onEnd,
      onFullscreenChange,
      metadata,
      onClose,
      sceneProducts = [],
    },
    ref,
  ) => {
    const videoRef = useRef<VideoRef>(null);
    const wasPlayingBeforeScrub = useRef(false);

    const [containerWidth, setContainerWidth] = useState(0);
    const [displayPosition, setDisplayPosition] = useState(0);
    const [videoDuration, setVideoDuration] = useState(1);
    const [isSeeking, setIsSeeking] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [apiMarkerTimes, setApiMarkerTimes] = useState<number[]>([]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [longPress2x, setLongPress2x] = useState(false);
    const [xraySheetOpen, setXraySheetOpen] = useState(false);
    const [xrayDismissed, setXrayDismissed] = useState(false);

    const {
      isFullscreen,
      isLandscape,
      toggleFullscreen,
      exitFullscreen,
    } = usePlayerOrientation(onFullscreenChange);

    const hasSceneShop = sceneProducts.length > 0;
    const showLandscapeRail =
      isLandscape && paused && hasSceneShop && !xrayDismissed;
    const controlsMinimal = showLandscapeRail;

    const {
      controlsOpacity,
      showControls,
      hideControls,
      toggleControls,
      scheduleAutoHide,
      clearHideTimer,
    } = usePlayerControls({
      paused,
      isSeeking,
      settingsOpen,
      xraySheetOpen: xraySheetOpen || showLandscapeRail,
    });

    useEffect(() => {
      if (!paused) {
        setXraySheetOpen(false);
        setXrayDismissed(false);
      } else if (paused && hasSceneShop && !xrayDismissed) {
        showControls();
        if (!isLandscape) {
          setXraySheetOpen(true);
        }
      }
    }, [paused, hasSceneShop, isLandscape, xrayDismissed, showControls]);

    const openXRay = useCallback(() => {
      setXrayDismissed(false);
      setXraySheetOpen(true);
      clearHideTimer();
    }, [clearHideTimer]);

    const closeXRay = useCallback(() => {
      setXrayDismissed(true);
      setXraySheetOpen(false);
      scheduleAutoHide();
    }, [scheduleAutoHide]);

    const markers: SceneMarker[] = useMemo(
      () =>
        mergeMarkers(
          apiMarkerTimes,
          metadata?.markers ?? MOCK_SCENE_MARKERS,
        ),
      [apiMarkerTimes, metadata?.markers],
    );

    const actors = metadata?.actors ?? MOCK_ACTORS;
    const products = metadata?.products ?? MOCK_XRAY_PRODUCTS;
    const chapters = metadata?.chapters ?? MOCK_CHAPTERS;
    const activeActor = useMemo(
      () => getActiveActor(displayPosition, actors),
      [displayPosition, actors],
    );

    useEffect(() => {
      const fetchMarkers = async () => {
        try {
          const id =
            videoId ??
            videoUrl.substring(
              videoUrl.lastIndexOf("/") + 1,
              videoUrl.lastIndexOf("."),
            );
          const res = await fetch(`${BASE_URL}/videos/${id}/detections`);
          if (res.ok) {
            const data = await res.json();
            setApiMarkerTimes(Array.isArray(data) ? data : []);
          }
        } catch {
          /* use mock markers */
        }
      };
      if (videoUrl) fetchMarkers();
    }, [videoId, videoUrl]);

    const overlayStyle = useAnimatedStyle(() => ({
      opacity: controlsOpacity.value,
    }));

    const handleProgress = useCallback(
      (data: OnProgressData) => {
        if (isSeeking) return;
        setDisplayPosition(data.currentTime);
        setCurrentTime(data.currentTime);
      },
      [isSeeking, setCurrentTime],
    );

    const handleLoad = useCallback(
      (data: OnLoadData) => {
        setVideoDuration(data.duration);
        setDuration(data.duration);
        setIsBuffering(false);
      },
      [setDuration],
    );

    const handleBuffer = useCallback((data: OnBufferData) => {
      setIsBuffering(data.isBuffering);
    }, []);

    const seekTo = useCallback(
      (time: number) => {
        const clamped = Math.max(0, Math.min(videoDuration, time));
        videoRef.current?.seek(clamped);
        setDisplayPosition(clamped);
        setCurrentTime(clamped);
        showControls();
      },
      [videoDuration, setCurrentTime, showControls],
    );

    const seekBy = useCallback(
      (delta: number) => {
        seekTo(displayPosition + delta);
      },
      [displayPosition, seekTo],
    );

    const handlePlayPause = useCallback(() => {
      if (paused) {
        setXraySheetOpen(false);
        setXrayDismissed(true);
        onPlay();
      } else {
        onPause();
      }
      scheduleAutoHide();
    }, [paused, onPlay, onPause, scheduleAutoHide]);

    const dismissXRay = useCallback(() => {
      closeXRay();
    }, [closeXRay]);

    const handleSeekStart = useCallback(() => {
      setIsSeeking(true);
      wasPlayingBeforeScrub.current = !paused;
      if (!paused) onPause();
      clearHideTimer();
    }, [paused, onPause, clearHideTimer]);

    const handleSeekChange = useCallback((value: number) => {
      setDisplayPosition(value);
    }, []);

    const handleSeekComplete = useCallback(
      (value: number) => {
        seekTo(value);
        setIsSeeking(false);
        if (wasPlayingBeforeScrub.current) onPlay();
        scheduleAutoHide();
      },
      [seekTo, onPlay, scheduleAutoHide],
    );

    const handleClose = useCallback(() => {
      if (isFullscreen) {
        exitFullscreen();
      } else {
        onClose?.();
      }
    }, [isFullscreen, exitFullscreen, onClose]);

    const handleSingleTap = useCallback(() => {
      if (settingsOpen) {
        setSettingsOpen(false);
        setSpeedMenuOpen(false);
        return;
      }
      toggleControls();
    }, [settingsOpen, toggleControls]);

    useImperativeHandle(
      ref,
      () => ({
        toggleFullscreen,
        seekTo,
      }),
      [toggleFullscreen, seekTo],
    );

    const onLayout = (e: LayoutChangeEvent) => {
      setContainerWidth(e.nativeEvent.layout.width);
    };

    return (
      <View style={styles.root} onLayout={onLayout}>
        <View
          style={[
            styles.mainRow,
            showLandscapeRail && styles.mainRowSplit,
          ]}
        >
        <View
          style={[
            styles.videoStage,
            showLandscapeRail && styles.videoStageSplit,
          ]}
        >
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            paused={paused}
            rate={longPress2x ? 2 : playbackRate}
            onProgress={handleProgress}
            onLoad={handleLoad}
            onBuffer={handleBuffer}
            onEnd={() => {
              onEnd?.();
              showControls();
            }}
            repeat={false}
            playInBackground={false}
            ignoreSilentSwitch="ignore"
          />

          {containerWidth > 0 && (
            <GestureLayer
              width={containerWidth}
              onSingleTap={handleSingleTap}
              onDoubleTapLeft={() => seekBy(-SEEK_SKIP_SECONDS)}
              onDoubleTapRight={() => seekBy(SEEK_SKIP_SECONDS)}
              onLongPressStart={() => setLongPress2x(true)}
              onLongPressEnd={() => setLongPress2x(false)}
            />
          )}

          {isBuffering && (
            <View style={styles.loader} pointerEvents="none">
              <ActivityIndicator size="large" color={COLORS.white} />
            </View>
          )}

          {longPress2x && (
            <View style={styles.speedBadge} pointerEvents="none">
              <Animated.Text style={styles.speedText}>2×</Animated.Text>
            </View>
          )}

          {!isLandscape && (
            <Animated.View style={[styles.videoFullscreenBtn, overlayStyle]}>
              <Pressable
                onPress={toggleFullscreen}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconFullscreen size={22} />
              </Pressable>
            </Animated.View>
          )}

          <TopOverlay
            title={title}
            isLandscape={isLandscape}
            controlsOpacity={controlsOpacity}
            onClose={handleClose}
            onToggleOrientation={toggleFullscreen}
            onSettings={() => {
              setSettingsOpen((v) => !v);
              setSpeedMenuOpen(false);
              showControls();
            }}
          />

          {isLandscape && (
            <>
              <Controls
                paused={paused}
                controlsOpacity={controlsOpacity}
                onPlayPause={handlePlayPause}
                onSeekBack={() => seekBy(-SEEK_SKIP_SECONDS)}
                onSeekForward={() => seekBy(SEEK_SKIP_SECONDS)}
                minimal={controlsMinimal}
              />
              <Animated.View
                style={[styles.landscapeBottom, overlayStyle]}
                pointerEvents="box-none"
              >
                  <SeekBar
                    duration={videoDuration}
                    position={displayPosition}
                    markers={markers}
                    isLandscape
                    onSeekStart={handleSeekStart}
                    onSeekChange={handleSeekChange}
                    onSeekComplete={handleSeekComplete}
                  />
                  <View style={styles.landscapeBar}>
                    <Pressable
                      onPress={toggleFullscreen}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      style={styles.landscapeIconBtn}
                    >
                      <IconFullscreenExit size={26} />
                    </Pressable>
                    <View style={styles.landscapeBarSpacer} />
                    <View style={styles.landscapeRightIcons}>
                      <Pressable style={styles.landscapeIconBtn}>
                        <IconCast size={24} />
                      </Pressable>
                      <Pressable style={styles.landscapeIconBtn}>
                        <IconSubtitles size={24} />
                      </Pressable>
                      <Pressable
                        style={styles.landscapeIconBtn}
                        onPress={() => {
                          setSettingsOpen((v) => !v);
                          setSpeedMenuOpen(false);
                          showControls();
                        }}
                      >
                        <IconSettings size={24} />
                      </Pressable>
                    </View>
                  </View>
                  {!showLandscapeRail && (
                    <XRayPanel
                      actor={activeActor}
                      sceneProducts={sceneProducts}
                      isLandscape
                      controlsOpacity={controlsOpacity}
                      sheetOpen={xraySheetOpen}
                      onOpenSheet={openXRay}
                      onCloseSheet={closeXRay}
                    />
                  )}
                </Animated.View>
            </>
          )}
        </View>

        {showLandscapeRail && (
          <XRaySidePanel
            sceneProducts={sceneProducts}
            onClose={dismissXRay}
          />
        )}
        </View>

        {!isLandscape && (
          <Animated.View style={[styles.portraitChrome, overlayStyle]}>
            <SeekBar
              duration={videoDuration}
              position={displayPosition}
              markers={markers}
              isLandscape={false}
              onSeekStart={handleSeekStart}
              onSeekChange={handleSeekChange}
              onSeekComplete={handleSeekComplete}
            />

            <View style={styles.portraitControls}>
              <Controls
                variant="inline"
                paused={paused}
                controlsOpacity={controlsOpacity}
                onPlayPause={handlePlayPause}
                onSeekBack={() => seekBy(-SEEK_SKIP_SECONDS)}
                onSeekForward={() => seekBy(SEEK_SKIP_SECONDS)}
              />
            </View>

            <XRayPanel
              actor={activeActor}
              sceneProducts={sceneProducts}
              isLandscape={false}
              controlsOpacity={controlsOpacity}
              sheetOpen={xraySheetOpen}
              onOpenSheet={openXRay}
              onCloseSheet={closeXRay}
            />
          </Animated.View>
        )}

        {settingsOpen && (
          <Animated.View style={[styles.settingsMenu, overlayStyle]}>
            {!speedMenuOpen ? (
              <Pressable
                style={styles.settingRow}
                onPress={() => setSpeedMenuOpen(true)}
              >
                <Animated.Text style={styles.settingText}>
                  Playback speed
                </Animated.Text>
                <Animated.Text style={styles.settingValue}>
                  {playbackRate}×
                </Animated.Text>
              </Pressable>
            ) : (
              PLAYBACK_SPEEDS.map((speed) => (
                <Pressable
                  key={speed}
                  style={[
                    styles.settingRow,
                    playbackRate === speed && styles.settingActive,
                  ]}
                  onPress={() => {
                    setPlaybackRate(speed);
                    setSpeedMenuOpen(false);
                    setSettingsOpen(false);
                    scheduleAutoHide();
                  }}
                >
                  <Animated.Text style={styles.settingText}>{speed}×</Animated.Text>
                </Pressable>
              ))
            )}
          </Animated.View>
        )}
      </View>
    );
  },
);

Player.displayName = "OTTPlayer";

export default Player;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  mainRow: {
    flex: 1,
  },
  mainRowSplit: {
    flexDirection: "row",
  },
  videoStage: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: "center",
  },
  videoStageSplit: {
    flex: 1,
    maxWidth: "58%",
  },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  speedBadge: {
    position: "absolute",
    top: 72,
    alignSelf: "center",
    backgroundColor: COLORS.glass,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 12,
  },
  speedText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 13,
  },
  landscapeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
    paddingBottom: 8,
    zIndex: 18,
    width: "100%",
  },
  landscapeBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 2,
    marginBottom: 4,
  },
  landscapeBarSpacer: { flex: 1 },
  landscapeRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  landscapeIconBtn: {
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  portraitChrome: {
    paddingBottom: 8,
    backgroundColor: COLORS.black,
  },
  portraitControls: {
    height: 100,
    justifyContent: "center",
    marginTop: -20,
  },
  videoFullscreenBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 14,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  settingsMenu: {
    position: "absolute",
    right: 16,
    top: 100,
    minWidth: 180,
    backgroundColor: "rgba(24,24,24,0.98)",
    borderRadius: 8,
    zIndex: 30,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  settingActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  settingText: {
    color: COLORS.white,
    fontSize: 14,
  },
  settingValue: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
});
