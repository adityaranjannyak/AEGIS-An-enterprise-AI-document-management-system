/* AEGIS Console: every remote surface maintains an intelligible loading, error, and retry state. */
/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */
import { useCallback, useEffect, useState } from "react";

export function useApiResource(loader, dependencies = []) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, status: "loading", error: null }));
    try { setState({ status: "ready", data: await loader(), error: null }); } catch (error) { setState({ status: "error", data: null, error }); }
  }, dependencies);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
