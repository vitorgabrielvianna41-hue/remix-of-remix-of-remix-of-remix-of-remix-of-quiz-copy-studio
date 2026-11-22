import { createElement, useEffect, useRef, useState, type ReactNode } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WistiaElement extends HTMLElement {
  currentTime: number;
  play: () => Promise<void>;
}

export function VslPlayer({ mediaId, actions }: { mediaId: string; actions: ReactNode }) {
  const video = useRef<WistiaElement>(null);
  const [ended, setEnded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setEnded(false);
    setUnlocked(false);
    setFailed(false);
    const player = video.current;
    if (!player || !mediaId) return;
    const onEnded = () => { setEnded(true); setUnlocked(true); };
    const onError = () => setFailed(true);
    player.addEventListener("ended", onEnded);
    player.addEventListener("error", onError);
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
      scripts.forEach((script) => script.removeEventListener("error", onError));
    };
  }, [mediaId]);

  function replay() {
    const player = video.current;
    if (!player) return;
    player.currentTime = 0;
    setEnded(false);
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
          "aria-label": "Demonstração do FunilaBot",
          className: "block h-full w-full",
        })}
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