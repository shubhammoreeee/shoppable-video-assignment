import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
  UIManager,
  Image,
} from "react-native";
import Slider from "@react-native-community/slider";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { BASE_URL } from "../../../shared/constants/config";

// ───────────────────────────────── constants ─────────────────────────────────
const SEEK_AMOUNT = 10;
const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2];

// ───────────────────────────── helper: format time ──────────────────────────
const formatTime = (seconds: number) => {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

// ───────────────────────────── pure JSX glyph fallbacks ──────────────────────
// These guarantee that the Play/Pause buttons render beautifully on all devices,
// even if native vector icon font families are completely unlinked.
const PlayIcon = () => (
  <View
    style={{
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftWidth: 16,
      borderRightWidth: 0,
      borderTopWidth: 10,
      borderBottomWidth: 10,
      borderLeftColor: "#fff",
      borderRightColor: "transparent",
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
      marginLeft: 4,
    }}
  />
);

const PauseIcon = () => (
  <View style={{ flexDirection: "row", gap: 4 }}>
    <View style={{ width: 4, height: 16, backgroundColor: "#fff", borderRadius: 1 }} />
    <View style={{ width: 4, height: 16, backgroundColor: "#fff", borderRadius: 1 }} />
  </View>
);

const PlayIconLarge = () => (
  <View
    style={{
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftWidth: 22,
      borderRightWidth: 0,
      borderTopWidth: 14,
      borderBottomWidth: 14,
      borderLeftColor: "#fff",
      borderRightColor: "transparent",
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
      marginLeft: 6,
    }}
  />
);

const PauseIconLarge = () => (
  <View style={{ flexDirection: "row", gap: 6 }}>
    <View style={{ width: 6, height: 22, backgroundColor: "#fff", borderRadius: 1.5 }} />
    <View style={{ width: 6, height: 22, backgroundColor: "#fff", borderRadius: 1.5 }} />
  </View>
);

// ───────────────────────────────── types ─────────────────────────────────
type Props = {
  // playback state
  paused: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  isFullscreen: boolean;
  isMini: boolean;
  title: string;

  // controls visibility
  showControls: boolean;
  controlsOpacity: Animated.Value;

  // menus
  showSettings: boolean;
  showSpeedMenu: boolean;

  // time toggle
  showRemainingTime: boolean;
  timeOpacity: Animated.Value;

  // long press
  longPressSpeed: boolean;

  // seek animations
  seekAnimLeft: Animated.Value;
  seekAnimRight: Animated.Value;

  // slider
  displayPosition: number;

  // shoppable video data
  markers?: number[];

  // callbacks
  onPlayPause: () => void;
  onToggleTimeMode: () => void;
  onToggleSettings: () => void;
  onToggleFullscreen: () => void;
  onExitMini: () => void;
  onSpeedChange: (speed: number) => void;
  onSliderStart: () => void;
  onSliderChange: (value: number) => void;
  onSliderComplete: (value: number) => void;
  onSeekBy?: (seconds: number) => void;
};

const hasLinearGradient =
  !!UIManager.getViewManagerConfig("BVLinearGradient") ||
  !!UIManager.getViewManagerConfig("RNLinearGradient");

const hasSlider = !!UIManager.getViewManagerConfig("RNCSlider");

// ─────────────────────────────── component ──────────────────────────────────
const VideoControls = ({
  paused,
  currentTime,
  duration,
  playbackSpeed,
  isFullscreen,
  isMini,
  title,
  showControls,
  controlsOpacity,
  showSettings,
  showSpeedMenu,
  showRemainingTime,
  timeOpacity,
  longPressSpeed,
  seekAnimLeft,
  seekAnimRight,
  displayPosition,
  markers = [],
  onPlayPause,
  onToggleTimeMode,
  onToggleSettings,
  onToggleFullscreen,
  onExitMini,
  onSpeedChange,
  onSliderStart,
  onSliderChange,
  onSliderComplete,
  onSeekBy,
}: Props) => {
  const [showXRay, setShowXRay] = useState(true);

  const progress = duration > 0 ? displayPosition / duration : 0;
  const remainingTime = Math.max(0, duration - displayPosition);

  // Active product timeline mapping:
  const activeProduct =
    displayPosition < 15
      ? {
          name: "Tshirt",
          role: "Kalapalatha - Tshirt",
          price: "₹ 299",
          image:  `${BASE_URL}/product_images/1779536590566.jpg`,
        }
      : {
          name: "Plant",
          role: "Decor - Plant",
          price: "₹ 200",
          image: `${BASE_URL}/product_images/1779536590596.jpg`,
        };

  return (
    <>
      {/* ───── seek indicators ───── */}
      <Animated.View
        style={[
          styles.seekIndicator,
          styles.seekIndicatorLeft,
          { opacity: seekAnimLeft },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="play-back" size={25} color="#fff" />
        <Text style={styles.seekText}>{SEEK_AMOUNT}s</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.seekIndicator,
          styles.seekIndicatorRight,
          { opacity: seekAnimRight },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="play-forward" size={25} color="#fff" />
        <Text style={styles.seekText}>{SEEK_AMOUNT}s</Text>
      </Animated.View>

      {/* ───── long-press 2× indicator ───── */}
      {longPressSpeed && (
        <View style={styles.speedIndicator} pointerEvents="none">
          <Text style={styles.speedText}>2×</Text>
        </View>
      )}

      {/* ───── controls overlay ───── */}
      {showControls && (
        <Animated.View
          style={[styles.controls, { opacity: controlsOpacity }]}
          pointerEvents="box-none"
        >
          {isFullscreen ? (
            /* =================================================================
               LANDSCAPE MODE UI (AMAZON PRIME VIDEO STYLE)
               ================================================================= */
            <View style={styles.landscapeContainer} pointerEvents="box-none">
              
              {/* TOP ROW: Title & Close Button */}
              <View style={styles.landscapeHeader}>
                <View style={styles.landscapeTitleWrap}>
                  <Text style={styles.landscapeTitle} numberOfLines={1}>
                    {title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onToggleFullscreen}
                  style={styles.closeButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <MaterialIcons name="close" size={26} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* MIDDLE ROW: X-Ray Cast/Product Card & Center Playback Controls */}
              <View style={styles.landscapeMiddle} pointerEvents="box-none">
                
                {/* Left Side: X-Ray Active Character/Product Card */}
                {showXRay && (
                  <View style={styles.xrayCard}>
                    <Image
                      source={{ uri: activeProduct.image }}
                      style={styles.xrayAvatar}
                      defaultSource={{ uri: "https://via.placeholder.com/100" }}
                    />
                    <View style={styles.xrayTextWrap}>
                      <Text style={styles.xrayTimestamp} numberOfLines={1}>
                        Active Scene
                      </Text>
                      <Text style={styles.xrayName} numberOfLines={1}>
                        {activeProduct.role}
                      </Text>
                      <Text style={styles.xrayPrice} numberOfLines={1}>
                        {activeProduct.price}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Center: Play/Pause, Rewind 10s, Fast Forward 10s */}
                <View style={styles.landscapeCenterControls}>
                  <TouchableOpacity
                    onPress={() => onSeekBy?.(-10)}
                    style={styles.centerIconBtn}
                  >
                    <MaterialIcons name="replay-10" size={34} color="#fff" />
                  </TouchableOpacity>

                  {/* Bulletproof Play/Pause Button */}
                  <TouchableOpacity
                    onPress={onPlayPause}
                    style={styles.landscapePlayBtn}
                  >
                    {paused ? <PlayIconLarge /> : <PauseIconLarge />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onSeekBy?.(10)}
                    style={styles.centerIconBtn}
                  >
                    <MaterialIcons name="forward-10" size={34} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Right Side: Empty space to balance layout */}
                <View style={styles.landscapeMiddleRight} />
              </View>

              {/* BOTTOM ROW: Timeline Slider & Bottom Bar Controls */}
              <View style={styles.landscapeBottom} pointerEvents="box-none">
                
                {/* ───── gradient slider ───── */}
                <View style={styles.sliderWrap}>
                  
                  {/* Yellow Tick Markers (Shoppable Detections) */}
                  {duration > 0 &&
                    markers.map((markerTime, idx) => {
                      const pct = (markerTime / duration) * 100;
                      if (pct < 0 || pct > 100) return null;
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.timelineMarker,
                            { left: `${pct}%` },
                          ]}
                        />
                      );
                    })}

                  {/* Gradient progress (dynamic width) */}
                  {hasLinearGradient ? (
                    <LinearGradient
                      colors={["#8c52ff", "#5ce1e6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.gradientTrack,
                        { width: `${progress * 96}%` },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.gradientTrack,
                        {
                          width: `${progress * 96}%`,
                          backgroundColor: "#8c52ff",
                        },
                      ]}
                    />
                  )}

                  {/* Actual slider or high-fidelity fallback track */}
                  {hasSlider ? (
                    <Slider
                      style={styles.slider}
                      value={displayPosition}
                      minimumValue={0}
                      maximumValue={duration}
                      minimumTrackTintColor="transparent"
                      maximumTrackTintColor="rgba(255,255,255,0.25)"
                      thumbTintColor="#FFFFFF"
                      onSlidingStart={onSliderStart}
                      onValueChange={onSliderChange}
                      onSlidingComplete={onSliderComplete}
                    />
                  ) : (
                    /* High-fidelity visual progress bar fallback */
                    <View style={[styles.slider, { justifyContent: "center", paddingHorizontal: 4 }]}>
                      <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, width: "100%", position: "relative" }}>
                        <View style={{ height: "100%", width: `${progress * 100}%`, backgroundColor: "#8c52ff", borderRadius: 2 }} />
                        <View style={{ position: "absolute", left: `${progress * 100}%`, top: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff", marginLeft: -6 }} />
                      </View>
                    </View>
                  )}
                </View>

                {/* Bottom Bar Controls */}
                <View style={styles.landscapeBottomBar}>
                  
                  {/* Left Controls: X-Ray Toggle & Time remaining */}
                  <View style={styles.landscapeLeftControls}>
                    <TouchableOpacity
                      onPress={() => setShowXRay(!showXRay)}
                      style={[
                        styles.xrayPill,
                        showXRay && styles.xrayPillActive,
                      ]}
                    >
                      <Text style={styles.xrayPillText}>X-Ray</Text>
                    </TouchableOpacity>

                    <Text style={styles.landscapeTime}>
                      - {formatTime(remainingTime)}
                    </Text>

                    <TouchableOpacity
                      onPress={onToggleFullscreen}
                      style={{ marginLeft: 20 }}
                    >
                      <MaterialIcons
                        name="fullscreen-exit"
                        size={28}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Right Controls: Cast, Subtitles, Settings */}
                  <View style={styles.landscapeRightControls}>
                    <TouchableOpacity style={styles.landscapeIconBtn}>
                      <MaterialIcons name="cast" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.landscapeIconBtn}>
                      <MaterialIcons name="subtitles" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={onToggleSettings}
                      style={styles.landscapeIconBtn}
                    >
                      <MaterialIcons name="settings" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </View>
          ) : (
            /* =================================================================
               PORTRAIT MODE UI (INLINE STREAM STYLE)
               ================================================================= */
            <View style={styles.portraitContainer} pointerEvents="box-none">
              
              {/* Top Bar: Brand Logo & Category */}
              <View style={styles.topBar}>
                <View>
                  <Text style={styles.brandTitle}>FITISTAN</Text>
                  <Text style={styles.brandSubtitle}>Video</Text>
                </View>
              </View>

              {/* Center: Play/Pause button in a strict perfect circle */}
              <TouchableOpacity
                onPress={onPlayPause}
                style={styles.playButton}
                activeOpacity={0.8}
              >
                {paused ? <PlayIcon /> : <PauseIcon />}
              </TouchableOpacity>

              {/* Bottom Section: Dedicated Time/Minimize-Maximize row + Slider */}
              <View style={styles.bottomSection}>
                
                {/* Time & Fullscreen/Landscape row (Highly Visible) */}
                <View style={styles.portraitBottomRow}>
                  <Text style={styles.time}>
                    {formatTime(displayPosition)} / {formatTime(duration)}
                  </Text>
                  
                  <View style={styles.portraitRightControls}>
                    <TouchableOpacity
                      onPress={onToggleSettings}
                      style={styles.portraitIconBtn}
                    >
                      <MaterialIcons name="settings" size={20} color="#fff" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={onToggleFullscreen}
                      style={styles.portraitIconBtn}
                    >
                      <MaterialIcons name="fullscreen" size={26} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ───── gradient slider ───── */}
                <View style={[styles.sliderWrap, { marginBottom: 12 }]}>
                  
                  {/* Yellow Tick Markers (Shoppable Detections) */}
                  {duration > 0 &&
                    markers.map((markerTime, idx) => {
                      const pct = (markerTime / duration) * 100;
                      if (pct < 0 || pct > 100) return null;
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.timelineMarker,
                            { left: `${pct}%`, bottom: 18, width: 5, height: 5 },
                          ]}
                        />
                      );
                    })}

                  {/* Gradient progress */}
                  {hasLinearGradient ? (
                    <LinearGradient
                      colors={["#8c52ff", "#5ce1e6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.gradientTrack,
                        { width: `${progress * 96}%`, height: 4 },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.gradientTrack,
                        {
                          width: `${progress * 96}%`,
                          backgroundColor: "#8c52ff",
                          height: 4,
                        },
                      ]}
                    />
                  )}

                  {/* Actual slider */}
                  {hasSlider ? (
                    <Slider
                      style={styles.slider}
                      value={displayPosition}
                      minimumValue={0}
                      maximumValue={duration}
                      minimumTrackTintColor="transparent"
                      maximumTrackTintColor="rgba(255,255,255,0.25)"
                      thumbTintColor="#FFFFFF"
                      onSlidingStart={onSliderStart}
                      onValueChange={onSliderChange}
                      onSlidingComplete={onSliderComplete}
                    />
                  ) : (
                    /* High-fidelity visual progress bar fallback */
                    <View style={[styles.slider, { justifyContent: "center", paddingHorizontal: 4 }]}>
                      <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, width: "100%", position: "relative" }}>
                        <View style={{ height: "100%", width: `${progress * 100}%`, backgroundColor: "#8c52ff", borderRadius: 2 }} />
                        <View style={{ position: "absolute", left: `${progress * 100}%`, top: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff", marginLeft: -6 }} />
                      </View>
                    </View>
                  )}
                </View>
              </View>

            </View>
          )}

          {/* ───── settings menu ───── */}
          {showSettings && !showSpeedMenu && (
            <View style={[styles.settingsMenu, isFullscreen && styles.landscapeSettings]}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => onSpeedChange(-1)}
              >
                <Text style={styles.settingText}>Playback Speed</Text>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{playbackSpeed}×</Text>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* ───── speed submenu ───── */}
          {showSpeedMenu && (
            <View style={[styles.submenu, isFullscreen && styles.landscapeSettings]}>
              {PLAYBACK_SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.submenuItem,
                    playbackSpeed === speed && styles.submenuItemActive,
                  ]}
                  onPress={() => onSpeedChange(speed)}
                >
                  <Text
                    style={[
                      styles.submenuText,
                      playbackSpeed === speed && styles.submenuTextActive,
                    ]}
                  >
                    {speed}×
                  </Text>
                  {playbackSpeed === speed && (
                    <Ionicons name="checkmark" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </>
  );
};

export default VideoControls;

// ───────────────────────────── styles ───────────────────────────────────────
const styles = StyleSheet.create({
  controls: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 10,
  },
  
  /* ==================== PORTRAIT STYLES ==================== */
  portraitContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 40 : 16,
  },
  brandTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  brandSubtitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: -2,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  playButton: {
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSection: {
    paddingBottom: 0,
    zIndex: 1,
  },
  portraitBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  portraitRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  portraitIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  time: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sliderWrap: {
    paddingHorizontal: 16,
    position: "relative",
  },
  gradientTrack: {
    position: "absolute",
    left: 0,
    bottom: 18,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },

  /* ==================== LANDSCAPE STYLES ==================== */
  landscapeContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  landscapeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  landscapeTitleWrap: {
    flex: 1,
  },
  landscapeTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  closeButton: {
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  landscapeMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  xrayCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 18, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    maxWidth: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  xrayAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#222",
  },
  xrayTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  xrayTimestamp: {
    color: "#8c52ff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  xrayName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  xrayPrice: {
    color: "#5ce1e6",
    fontSize: 11,
    fontWeight: "600",
  },
  landscapeCenterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  centerIconBtn: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 25,
  },
  landscapePlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  landscapeMiddleRight: {
    width: 260, // Equal width to xrayCard to center the playback controls perfectly
  },
  landscapeBottom: {
    width: "100%",
  },
  timelineMarker: {
    position: "absolute",
    bottom: 18,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFEB3B", // Beautiful yellow dot
    zIndex: 15,
  },
  landscapeBottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 8,
    marginTop: 2,
  },
  landscapeLeftControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  xrayPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  xrayPillActive: {
    backgroundColor: "#8c52ff",
    borderColor: "#5ce1e6",
  },
  xrayPillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  landscapeTime: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 12,
  },
  landscapeRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  landscapeIconBtn: {
    padding: 6,
  },

  /* ==================== COMMON STYLES ==================== */
  settingsMenu: {
    position: "absolute",
    bottom: 70,
    right: 16,
    width: 200,
    backgroundColor: "rgba(28,28,28,0.98)",
    borderRadius: 8,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  landscapeSettings: {
    bottom: 80,
    right: 32,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  settingText: { color: "#fff", fontSize: 14 },
  settingRight: { flexDirection: "row", alignItems: "center" },
  settingValue: { color: "#ccc", fontSize: 13, marginRight: 4 },
  submenu: {
    position: "absolute",
    bottom: 50,
    right: 16,
    width: 180,
    backgroundColor: "rgba(28,28,28,0.98)",
    borderRadius: 8,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  submenuItemActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  submenuText: { color: "#fff", fontSize: 14 },
  submenuTextActive: { fontWeight: "bold", color: "#ff0000" },
  seekIndicator: {
    position: "absolute",
    top: "45%",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 40,
    zIndex: 5,
  },
  seekIndicatorLeft: { left: "15%" },
  seekIndicatorRight: { right: "15%" },
  seekText: { color: "#fff", fontWeight: "bold", marginTop: 4 },
  speedIndicator: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speedText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
});