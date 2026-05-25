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
  Dimensions,
  Text,
} from "react-native";
import Video, {
  OnLoadData,
  OnProgressData,
  OnBufferData,
  VideoRef,
} from "react-native-video";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
import { WatchHistory } from "../../../home/services/watchHistory";
import type {
  VideoPlayerProps,
  VideoPlayerHandle,
  SceneMarker,
} from "../../types/player.types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
    const [landscapePanelOpen, setLandscapePanelOpen] = useState(false);
    const [landscapeDismissed, setLandscapeDismissed] = useState(false);

    // Gestures HUD & Volume/Brightness states
    const [isPip, setIsPip] = useState(false);
    const [brightness, setBrightness] = useState(1.0);
    const [volume, setVolume] = useState(1.0);
    const [showBrightnessHUD, setShowBrightnessHUD] = useState(false);
    const [showVolumeHUD, setShowVolumeHUD] = useState(false);

    const activeBrightnessRef = useRef(1.0);
    const activeVolumeRef = useRef(1.0);
    const hudTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reanimated variables for PiP position & dragging
    const pipX = useSharedValue(SCREEN_WIDTH - 190);
    const pipY = useSharedValue(SCREEN_HEIGHT - 220);
    const startX = useSharedValue(SCREEN_WIDTH - 190);
    const startY = useSharedValue(SCREEN_HEIGHT - 220);

    const {
      isFullscreen,
      isLandscape,
      toggleFullscreen,
      exitFullscreen,
    } = usePlayerOrientation(onFullscreenChange);

    const hasSceneShop = sceneProducts.length > 0;
    const showLandscapeRail = isLandscape && landscapePanelOpen;
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

    // Portrait only: auto-open sheet on pause
    useEffect(() => {
      if (!paused) {
        setXraySheetOpen(false);
        setXrayDismissed(false);
      } else if (!isLandscape && paused && hasSceneShop && !xrayDismissed) {
        showControls();
        setXraySheetOpen(true);
      }
    }, [paused, hasSceneShop, isLandscape, xrayDismissed, showControls]);

    // Landscape only: close panel on play, auto-open when paused + products ready
    useEffect(() => {
      if (!paused) {
        setLandscapePanelOpen(false);
        setLandscapeDismissed(false);
      }
    }, [paused]);

    useEffect(() => {
      if (isLandscape && paused && hasSceneShop && !landscapeDismissed) {
        setLandscapePanelOpen(true);
        showControls();
      }
    }, [isLandscape, paused, hasSceneShop, landscapeDismissed, showControls]);

    const openXRay = useCallback(() => {
      if (!isLandscape) {
        setXrayDismissed(false);
        setXraySheetOpen(true);
        clearHideTimer();
        return;
      }
      setLandscapeDismissed(false);
      setLandscapePanelOpen(true);
      clearHideTimer();
      if (!paused) {
        onPause?.();
      }
    }, [isLandscape, paused, clearHideTimer, onPause]);

    const closeXRay = useCallback(() => {
      setXrayDismissed(true);
      setXraySheetOpen(false);
      scheduleAutoHide();
    }, [scheduleAutoHide]);

    const dismissLandscapePanel = useCallback(() => {
      setLandscapeDismissed(true);
      setLandscapePanelOpen(false);
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
        if (videoDuration > 0) {
          const safeId = videoId ?? "default";
          const imageUri = `https://picsum.photos/seed/${safeId}/400/250`;
          WatchHistory.saveProgress(safeId, videoUrl, title ?? DEFAULT_MOVIE_TITLE, data.currentTime, videoDuration, imageUri);
        }
      },
      [isSeeking, setCurrentTime, videoId, videoUrl, title, videoDuration],
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

    const handlePlayPause = useCallback(() => {
      if (paused) {
        onPlay?.();
      } else {
        onPause?.();
      }
    }, [paused, onPlay, onPause]);

    const handleSingleTap = useCallback(() => {
      toggleControls();
    }, [toggleControls]);

    const handleSeekStart = useCallback(() => {
      setIsSeeking(true);
      wasPlayingBeforeScrub.current = !paused;
      onPause?.();
      clearHideTimer();
    }, [paused, onPause, clearHideTimer]);

    const handleSeekChange = useCallback((value: number) => {
      setDisplayPosition(value);
    }, []);

    const handleSeekComplete = useCallback(
      (value: number) => {
        setIsSeeking(false);
        videoRef.current?.seek(value);
        setDisplayPosition(value);
        setCurrentTime(value);
        if (wasPlayingBeforeScrub.current) {
          onPlay?.();
        }
        scheduleAutoHide();
      },
      [onPlay, setCurrentTime, scheduleAutoHide],
    );

    const seekBy = useCallback(
      (seconds: number) => {
        const target = Math.min(
          videoDuration,
          Math.max(0, displayPosition + seconds),
        );
        videoRef.current?.seek(target);
        setDisplayPosition(target);
        setCurrentTime(target);
        showControls();
      },
      [displayPosition, videoDuration, setCurrentTime, showControls],
    );

    const handleLayout = (e: LayoutChangeEvent) => {
      setContainerWidth(e.nativeEvent.layout.width);
    };

    useImperativeHandle(ref, () => ({
      toggleFullscreen,
      seekTo: (time: number) => {
        videoRef.current?.seek(time);
        setDisplayPosition(time);
        setCurrentTime(time);
      },
      seek: (time: number) => {
        videoRef.current?.seek(time);
        setDisplayPosition(time);
        setCurrentTime(time);
      },
    }));


    // Swipe volume/brightness gesture callbacks
    const handleSwipeUpdate = useCallback((side: "left" | "right", delta: number) => {
      if (hudTimeoutRef.current) {
        clearTimeout(hudTimeoutRef.current);
      }
      if (side === "left") {
        setShowBrightnessHUD(true);
        setShowVolumeHUD(false);
        const newVal = Math.min(1.0, Math.max(0.0, activeBrightnessRef.current + delta * 0.4));
        setBrightness(newVal);
      } else {
        setShowVolumeHUD(true);
        setShowBrightnessHUD(false);
        const newVal = Math.min(1.0, Math.max(0.0, activeVolumeRef.current + delta * 0.4));
        setVolume(newVal);
      }
    }, []);

    const handleSwipeEnd = useCallback((side: "left" | "right") => {
      if (side === "left") {
        activeBrightnessRef.current = brightness;
      } else {
        activeVolumeRef.current = volume;
      }
      hudTimeoutRef.current = setTimeout(() => {
        setShowBrightnessHUD(false);
        setShowVolumeHUD(false);
      }, 1000);
    }, [brightness, volume]);

    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    // PiP pan gestures using Reanimated
    const pipPanGesture = Gesture.Pan()
      .enabled(isPip)
      .onStart(() => {
        startX.value = pipX.value;
        startY.value = pipY.value;
      })
      .onUpdate((e) => {
        pipX.value = startX.value + e.translationX;
        pipY.value = startY.value + e.translationY;
      });

    // PiP Container animated styles
    const animatedContainerStyle = useAnimatedStyle(() => {
      if (!isPip) {
        return {
          width: "100%",
          height: "100%",
          borderRadius: 0,
          borderWidth: 0,
          position: "relative",
          top: 0,
          left: 0,
        };
      }
      return {
        width: 170,
        height: 100,
        borderRadius: 14,
        borderWidth: 1.2,
        borderColor: "rgba(255, 122, 0, 0.6)",
        backgroundColor: COLORS.black,
        position: "absolute",
        top: pipY.value,
        left: pipX.value,
        zIndex: 9999,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
      };
    });

    return (
      <GestureDetector gesture={pipPanGesture}>
        <Animated.View
          style={[styles.root, animatedContainerStyle]}
          onLayout={handleLayout}
        >
          {/* Simulated Brightness Dark Overlay */}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "black", opacity: 1 - brightness, zIndex: 1 },
            ]}
            pointerEvents="none"
          />

          {/* PiP Mini Player — premium controls */}
          {isPip && (
            <Pressable
              style={[StyleSheet.absoluteFill, { zIndex: 99999 }]}
              onPress={handlePlayPause}
            >
              {/* Center: play/pause indicator (non-interactive, pointer events off) */}
              <View style={styles.pipCenterRow} pointerEvents="none">
                <View style={styles.pipPlayCircle}>
                  <Text style={styles.pipPlayText}>{paused ? "▶" : "||"}</Text>
                </View>
              </View>

              {/* Top-left: maximize back to full */}
              <Pressable
                style={styles.pipMaxBtn}
                onPress={() => setIsPip(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.pipIconText1}>⤢</Text>
              </Pressable>

              {/* Top-right: close PiP */}
              <Pressable
                style={styles.pipCloseAbsBtn}
                onPress={handleClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.pipIconText}>✕</Text>
              </Pressable>
            </Pressable>
          )}

          <View
            style={[
              styles.mainRow,
              showLandscapeRail && styles.mainRowSplit,
            ]}
            pointerEvents={isPip ? "none" : "auto"}
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
                playInBackground={true}
                ignoreSilentSwitch="ignore"
                volume={volume}
              />

              {containerWidth > 0 && !isPip && (
                <GestureLayer
                  width={containerWidth}
                  onSingleTap={handleSingleTap}
                  onDoubleTapLeft={() => seekBy(-SEEK_SKIP_SECONDS)}
                  onDoubleTapRight={() => seekBy(SEEK_SKIP_SECONDS)}
                  onLongPressStart={() => setLongPress2x(true)}
                  onLongPressEnd={() => setLongPress2x(false)}
                  onSwipeUpdate={handleSwipeUpdate}
                  onSwipeEnd={handleSwipeEnd}
                />
              )}

              {isBuffering && !isPip && (
                <View style={styles.loader} pointerEvents="none">
                  <ActivityIndicator size="large" color={COLORS.white} />
                </View>
              )}

              {longPress2x && !isPip && (
                <View style={styles.speedBadge} pointerEvents="none">
                  <Animated.Text style={styles.speedText}>2×</Animated.Text>
                </View>
              )}

              {!isLandscape && !isPip && (
                <Animated.View style={[styles.videoFullscreenBtn, overlayStyle]}>
                  <Pressable
                    onPress={toggleFullscreen}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconFullscreen size={22} />
                  </Pressable>
                </Animated.View>
              )}

              {/* Side HUD Indicator Overlays for swipes */}
              {showBrightnessHUD && !isPip && (
                <View style={[styles.hudCard, styles.hudLeft]}>
                  <Text style={styles.hudIcon}>☀️</Text>
                  <View style={styles.hudProgressBg}>
                    <View style={[styles.hudProgressFill, { height: `${brightness * 100}%` }]} />
                  </View>
                </View>
              )}

              {showVolumeHUD && !isPip && (
                <View style={[styles.hudCard, styles.hudRight]}>
                  <Text style={styles.hudIcon}>🔊</Text>
                  <View style={styles.hudProgressBg}>
                    <View style={[styles.hudProgressFill, { height: `${volume * 100}%` }]} />
                  </View>
                </View>
              )}

              {!isPip && (
                <TopOverlay
                  title={title}
                  isLandscape={isLandscape}
                  controlsOpacity={controlsOpacity}
                  onClose={handleClose}
                  onToggleOrientation={toggleFullscreen}
                  onPiP={() => {
                    setIsPip(true);
                    exitFullscreen();
                  }}
                  onSettings={() => {
                    setSettingsOpen((v) => !v);
                    setSpeedMenuOpen(false);
                    showControls();
                  }}
                />
              )}

              {isLandscape && !isPip && (
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
                      {/* <Pressable
                        onPress={toggleFullscreen}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        style={styles.landscapeIconBtn}
                      >
                        <IconFullscreenExit size={26} />
                      </Pressable> */}
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
                    {activeActor && (
                      <XRayPanel
                        actor={activeActor}
                        sceneProducts={sceneProducts}
                        isLandscape={true}
                        controlsOpacity={controlsOpacity}
                        sheetOpen={false}
                        onOpenSheet={openXRay}
                        onCloseSheet={closeXRay}
                      />
                    )}
                  </Animated.View>
                </>
              )}
            </View>

            {showLandscapeRail && !isPip && (
              <XRaySidePanel
                sceneProducts={sceneProducts}
                onClose={dismissLandscapePanel}
              />
            )}
          </View>

          {!isLandscape && !isPip && (
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

          {/* Speed & Settings overlay */}
          {settingsOpen && !isPip && (
            <Animated.View style={styles.settingsMenu}>
              <Pressable
                style={styles.settingRow}
                onPress={() => setSpeedMenuOpen((v) => !v)}
              >
                <Animated.Text style={styles.settingText}>Playback Speed</Animated.Text>
                <Animated.Text style={styles.settingValue}>
                  {playbackRate}×
                </Animated.Text>
              </Pressable>
              {speedMenuOpen && (
                <View style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                  {PLAYBACK_SPEEDS.map((speed) => (
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
                  ))}
                </View>
              )}
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    );
  },
);

Player.displayName = "OTTPlayer";

export default Player;

const styles = StyleSheet.create({
  root: {
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
  pipCenterRow: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
  pipPlayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor: "rgba(255,122,0,0.88)",
    // borderWidth: 1.5,
    borderColor: "rgba(255,200,100,0.5)",
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#FF7A00",
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.6,
    // shadowRadius: 8,
    // elevation: 6,
  },
  pipPlayText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 2,
  },
  pipMaxBtn: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  pipCloseAbsBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(180,0,0,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  pipIconText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 12,
  },
  pipIconText1: {
    color: "#FFF",
    fontSize: 22,
    // fontWeight: "bold",
    textAlign: "center",
    // lineHeight: 12,
    marginTop: -12,
  },
  hudCard: {
    position: "absolute",
    top: "32%",
    width: 38,
    height: 120,
    backgroundColor: "rgba(24, 24, 24, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 122, 0, 0.3)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    zIndex: 99,
  },
  hudLeft: {
    left: 20,
  },
  hudRight: {
    right: 20,
  },
  hudIcon: {
    fontSize: 14,
    color: "#FFF",
    marginBottom: 8,
  },
  hudProgressBg: {
    width: 5,
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2.5,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  hudProgressFill: {
    width: "100%",
    backgroundColor: "#FF7A00",
    borderRadius: 2.5,
  },
});
