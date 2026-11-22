import { createElement, useEffect, useRef, useState, type ReactNode } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WistiaElement extends HTMLElement {
  currentTime: number;
  play: () => Promise<void>;
}

// The bar runs ahead of the video but only completes when the video actually ends.
const FAKE_CAP = 0.93;
const FAKE_STEP = 0.008;
const FAKE_TICK_MS = 120;

export function VslPlayer({ mediaId, actions }: { mediaId: string; actions: ReactNode }) {
  const video = useRef<WistiaElement>(null);
  const [ended, setEnded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fake, setFake] = useState(0);

  useEffect(() => {
    setEnded(false);
    setUnlocked(false);
    setFailed(false);
    setPlaying(false);
    setFake(0);
    const player = video.current;
    if (!player || !mediaId) return;
    const onEnded = () => { setEnded(true); setUnlocked(true); setPlaying(false); };
    const onError = () => setFailed(true);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener("ended", onEnded);
    player.addEventListener("error", onError);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    const scripts = [
      { src: "https://fast.wistia.com/player.js", module: false },
      { src: `https://fast.wistia.com/embed/${mediaId}.js`, module: true },
    ].map(({ src, module }) => {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        if (module) script.type = "module";
        document.head.appendChild(script);
      }
      script.addEventListener("error", onError);
      return script;
    });
    return () => {
      player.removeEventListener("ended", onEnded);
      player.removeEventListener("error", onError);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      scripts.forEach((script) => script.removeEventListener("error", onError));
    };
  }, [mediaId]);

  useEffect(() => {
    if (!playing || ended) return;
    const id = setInterval(() => {
      setFake((f) => f + (FAKE_CAP - f) * FAKE_STEP);
    }, FAKE_TICK_MS);
    return () => clearInterval(id);
  }, [playing, ended]);

  const pct = ended ? 100 : Math.min(fake * 100, FAKE_CAP * 100);

  function replay() {
    const player = video.current;
    if (!player) return;
    player.currentTime = 0;
    setEnded(false);
    setFake(0);
    void Promise.resolve(player.play()).catch(() => setFailed(true));
  }

  return (
    <>
      <div className="relative mt-5 aspect-[9/16] overflow-hidden rounded-lg bg-vsl-player text-vsl-player-foreground shadow-xl">
        {mediaId && createElement("wistia-player", {
          ref: video,
          "media-id": mediaId,
          seo: "false",
          aspect: "0.5625",
          playbar: "false",
          "settings-control": "false",
          "copy-link-and-thumbnail-enabled": "false",
          "aria-label": "Demonstração do FunilaBot",
          className: "block h-full w-full",
        })}
        {/* Covers any native control bar and carries the fake progress bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-vsl-player to-transparent" />
        <div
          role="progressbar"
          aria-label="Progresso do vídeo"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-vsl-player-foreground/20"
        >
          <div className="h-full bg-primary transition-[width] duration-150 ease-linear" style={{ width: `${pct}%` }} />
        </div>
        {(!mediaId || failed || ended) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-vsl-player px-6 text-center">
            {ended ? (
              <>
                <p className="font-display text-xl font-bold">Você já assistiu a este vídeo!</p>
                <Button variant="ghost" onClick={replay} className="text-vsl-player-foreground hover:bg-vsl-player-foreground/10 hover:text-vsl-player-foreground">
                  <RotateCcw /> Assistir novamente
                </Button>
              </>
            ) : (
              <>
                <Play className="h-10 w-10 opacity-70" />
                <p className="text-sm">{failed ? "Não foi possível carregar o vídeo. Tente novamente." : "A demonstração estará disponível em breve."}</p>
                {failed && <Button variant="ghost" className="text-vsl-player-foreground hover:bg-vsl-player-foreground/10 hover:text-vsl-player-foreground" onClick={() => window.location.reload()}><RotateCcw /> Tentar novamente</Button>}
              </>
            )}
          </div>
        )}
      </div>
      {unlocked && <div className="mt-5 animate-rise">{actions}</div>}
    </>
  );
}
