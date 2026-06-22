import React, { useEffect, useState } from "react";
import {
  applyPublicReadingFontScalePreference,
  applyPublicReadingThemePreference,
  resolveInitialPublicReadingFontScale,
  resolveInitialPublicReadingTheme,
} from "../lib/publicReadingPreferences";
import { FONT_SCALE_MAX, FONT_SCALE_MIN, FONT_SCALE_STEP } from "../lib/appFontScale";
import { Btn, ThemeIcon } from "./ui";

export const PublicReadingToolbar = ({
  theme,
  fontScale = 1,
  onToggleTheme,
  onIncreaseFontScale,
  onDecreaseFontScale,
  onBack,
  backHref,
}) => {
  const [localTheme, setLocalTheme] = useState(() => resolveInitialPublicReadingTheme(theme));
  const [localFontScale, setLocalFontScale] = useState(() => resolveInitialPublicReadingFontScale(fontScale));

  useEffect(() => {
    if (theme) {
      setLocalTheme(resolveInitialPublicReadingTheme(theme));
    }
  }, [theme]);

  useEffect(() => {
    if (fontScale) {
      setLocalFontScale(resolveInitialPublicReadingFontScale(fontScale));
    }
  }, [fontScale]);

  const handleDecrease = () => {
    if (onDecreaseFontScale) {
      onDecreaseFontScale();
    } else {
      setLocalFontScale(applyPublicReadingFontScalePreference(localFontScale - FONT_SCALE_STEP));
    }
  };

  const handleIncrease = () => {
    if (onIncreaseFontScale) {
      onIncreaseFontScale();
    } else {
      setLocalFontScale(applyPublicReadingFontScalePreference(localFontScale + FONT_SCALE_STEP));
    }
  };

  const handleThemeToggle = () => {
    const nextTheme = localTheme === "dark" ? "light" : "dark";
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      setLocalTheme(applyPublicReadingThemePreference(nextTheme));
    }
  };

  const fontControlStyle = {
    minHeight: 34,
    padding: "6px 10px",
    border: localTheme === "dark" ? "1px solid rgba(255,255,255,0.26)" : "1px solid rgba(15, 38, 24, 0.12)",
    background: localTheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.96)",
    color: localTheme === "dark" ? "#fff" : "var(--text)",
    fontWeight: 800,
    borderRadius: 10,
    boxShadow: "none",
  };

  return (
    <div className="public-reading-toolbar" data-theme={localTheme} aria-label="Ajustes de leitura">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {(onBack || backHref) && (
          <Btn
            v="ghost"
            sz="sm"
            icon="back"
            onClick={() => {
              if (onBack) {
                onBack();
                return;
              }
              window.location.hash = backHref.startsWith("#") ? backHref : `#${backHref}`;
            }}
            title="Voltar"
            aria-label="Voltar"
            style={{ ...fontControlStyle, width: 34, justifyContent: "center", padding: 0 }}
          />
        )}
        <span className="public-reading-toolbar__zoom" title="Zoom do texto">{Math.round(localFontScale * 100)}%</span>
      </div>
      <div className="public-reading-toolbar__actions">
        <Btn
          v="ghost"
          sz="sm"
          onClick={handleDecrease}
          title="Diminuir fonte"
          aria-label="Diminuir fonte"
          disabled={localFontScale <= FONT_SCALE_MIN}
          style={fontControlStyle}
        >
          A-
        </Btn>
        <Btn
          v="ghost"
          sz="sm"
          onClick={handleIncrease}
          title="Aumentar fonte"
          aria-label="Aumentar fonte"
          disabled={localFontScale >= FONT_SCALE_MAX}
          style={fontControlStyle}
        >
          A+
        </Btn>
        <Btn
          v="ghost"
          sz="sm"
          onClick={handleThemeToggle}
          title={localTheme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
          aria-label={localTheme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
          style={{ ...fontControlStyle, width: 34, justifyContent: "center", padding: 0, fontWeight: 900 }}
        >
          <ThemeIcon theme={localTheme} size={16} />
        </Btn>
      </div>
    </div>
  );
};
