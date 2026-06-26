/**
 * @file frontend/src/lib/headerBack.js
 * @summary Contexto do botão "Voltar" exibido no header global.
 * @responsibility Permitir que qualquer tela registre sua ação de voltar para
 * que o AppHeader a renderize ao lado da marca (back padronizado no topo), em
 * vez de cada tela desenhar o próprio botão acima do título.
 */

import { createContext, useContext, useEffect, useRef } from "react";

export const HeaderBackContext = createContext({ setBack: () => {} });

/**
 * Registra (enquanto montado) a ação de voltar da tela atual no header.
 * Depende só da existência da ação e do rótulo — a função é lida por ref para
 * não re-registrar a cada render quando vier como arrow inline.
 */
export const useHeaderBack = (onBack, label = "Voltar") => {
  const { setBack } = useContext(HeaderBackContext);
  const ref = useRef(onBack);
  ref.current = onBack;
  const enabled = Boolean(onBack);

  useEffect(() => {
    if (!enabled) return undefined;
    setBack({ run: () => ref.current && ref.current(), label });
    return () => setBack(null);
  }, [enabled, label, setBack]);
};
