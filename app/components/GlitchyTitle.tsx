"use client";

import { useSearchParams } from "next/navigation";
import styles from "./GlitchyTitle.module.css";

export default function GlitchyTitle() {
  const searchParams = useSearchParams();
  const tone = searchParams.get("tone") || "standard";
  const isInternet = tone === "internet";

  return (
    <div
      className={`${styles.glitchContainer} ${
        isInternet ? styles.internet : styles.standard
      }`}
    >
      <div className={styles.glitchText}>
        {isInternet ? (
          // Internet tone - more chaotic, with emojis
          <>
            <span className={`${styles.char} ${styles.redInternet}`}>赛</span>
            <span className={`${styles.char} ${styles.blueInternet}`}>罗</span>
            <span className={styles.dotInternet}>🤪</span>
            <span className={`${styles.char} ${styles.purpleInternet}`}>
              大
            </span>
            <span className={`${styles.char} ${styles.greenInternet}`}>逼</span>
            <span className={`${styles.char} ${styles.yellowInternet}`}>
              兜
            </span>
            <span className={styles.dotInternet}>👻</span>
          </>
        ) : (
          // Standard tone - more elegant but still glitchy
          <>
            <span className={`${styles.char} ${styles.red}`}>赛</span>
            <span className={`${styles.char} ${styles.blue}`}>罗</span>
            <span className={styles.dot}>·</span>
            <span className={`${styles.char} ${styles.purple}`}>大</span>
            <span className={`${styles.char} ${styles.green}`}>逼</span>
            <span className={`${styles.char} ${styles.yellow}`}>兜</span>
          </>
        )}
      </div>
    </div>
  );
}
